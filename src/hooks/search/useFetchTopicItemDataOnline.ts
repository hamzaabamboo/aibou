import { useMutation, useQueryClient } from '@tanstack/react-query'

import axios from 'axios'
import { useDBContext } from 'hooks/contexts/useDBContext'
import { useKeyValueData } from 'hooks/utils/useKeyValueData'
import { SearchApiResults } from 'types/api'
import { parseJishoResults } from 'types/jisho'
import { TopicItem } from 'types/topic'
import { sortJishoReadings } from 'utils/sortJishoReadings'

export const useFetchTopicItemDataOnline = (topicId: string) => {
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
          `${dictionaryApiUrl}?q=${encodeURIComponent(word.word)}&exact=true`,
          {
            headers: {
              'x-jisho-secret': dictionaryApiSecret
            }
          }
        )

        const results = parseJishoResults(data)
        const jishoData =
          results.find((m) =>
            m.japanese.some(
              (w) => w.word === word.word && w.reading === word.reading
            )
          ) ??
          results.find((m) =>
            m.japanese.some(
              (w) => w.word === word.word || w.word === word.reading
            )
          )

        if (jishoData != null) {
          const d = sortJishoReadings(jishoData, word.word)
          await db?.topicEntries.put({
            ...word,
            jishoData: d,
            reading: d.japanese[0].reading
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
