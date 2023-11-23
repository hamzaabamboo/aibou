import { useMutation, useQueryClient } from '@tanstack/react-query'

import axios from 'axios'
import { groupBy, isEqual, uniqWith } from 'lodash'
import { JishoWord } from 'types/jisho'

import { type SearchApiResults } from '../types/api'
import { type TopicItem } from '../types/topic'
import { sortJishoReadings } from '../utils/sortJishoReadings'
import { useDBContext } from './contexts/useDBContext'
import { useKeyValueData } from './utils/useKeyValueData'

const parseResults = (data: SearchApiResults): JishoWord[] => {
  const groups = Object.values(groupBy(data, 'word_id')).map((word) => {
    const { dictionary_id, text, word_id } = word[0]
    return {
      attribution: { offlineDict: true, dictionary_id },
      is_common: '',
      japanese: word.map(({ kanji, reading }) => ({ word: kanji, reading })),
      senses: [
        {
          english_definitions: [text],
          tags: [],
          parts_of_speech: []
        }
      ],
      tags: [],
      slug: word_id.toString()
    }
  })
  const aggregated = groupBy(
    groups,
    (d) => `${d.japanese[0].word}:${d.japanese[0].reading}`
  )
  const combined = Object.values(aggregated).map((words) => ({
    ...words[0],
    japanese: uniqWith(
      words.flatMap((w) => w.japanese),
      isEqual
    ),
    senses: uniqWith(
      words.flatMap((w) => w.senses),
      isEqual
    )
  }))

  return combined
}

export const useFetchJishoResults = (topicId: string) => {
  const { db } = useDBContext()
  const [{ data: dictionaryApiUrl }] = useKeyValueData('dictionaryApiUrl', '')
  const [{ data: dictionaryApiSecret }] = useKeyValueData(
    'dictionaryApiSecret',
    ''
  )
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['updateJishoResults'],
    mutationFn: async (words?: TopicItem[]) => {
      if (words == null) return
      const p = words.map(async (word) => {
        if (!word.id) return
        const { data } = await axios.get<SearchApiResults>(
          `${dictionaryApiUrl}?q=${encodeURIComponent(word.word)}`,
          {
            headers: {
              'x-jisho-secret': dictionaryApiSecret
            }
          }
        )

        const results = parseResults(data)
        const jishoData = results.find((m) =>
          m.japanese.some(
            (w) => w.word === word.word || w.reading === word.word
          )
        )

        if (jishoData != null) {
          await db?.topicEntries.put({
            ...word,
            jishoData: sortJishoReadings(jishoData, word.word)
          })
        }
      })
      await Promise.all(p)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['fetchTopicItems', topicId]
      })
    }
  })
}
