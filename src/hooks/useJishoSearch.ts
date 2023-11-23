import { useQuery } from '@tanstack/react-query'

import axios from 'axios'
import { groupBy, isEqual, uniqWith } from 'lodash'
import { JishoWord } from 'types/jisho'

import { type SearchApiResults } from '../types/api'
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

export const useJishoSearch = (keyword: string) => {
  const [{ data: dictionaryApiUrl }] = useKeyValueData('dictionaryApiUrl', '')
  const [{ data: dictionaryApiSecret }] = useKeyValueData(
    'dictionaryApiSecret',
    ''
  )
  const query = useQuery({
    queryKey: ['jishoSearch', keyword],
    queryFn: async ({ signal }) => {
      if (!keyword) return []
      const { data } = await axios.get<SearchApiResults>(
        `${dictionaryApiUrl}?q=${encodeURIComponent(keyword)}`,
        {
          headers: {
            'x-jisho-secret': dictionaryApiSecret
          },
          signal
        }
      )

      const res = parseResults([...data])
      return res
    }
  })

  return query
}
