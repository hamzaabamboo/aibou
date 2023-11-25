import { useMutation, useQueryClient } from '@tanstack/react-query'

import { type JishoWord } from '../../types/jisho'
import { type TopicItem } from '../../types/topic'
import { sortJishoReadings } from '../../utils/sortJishoReadings'
import { useDBContext } from '../contexts/useDBContext'
import { useOfflineDictionaryContext } from '../contexts/useOfflineDictionaryContext'

export const useFetchTopicItemDataOffline = (topicId: string) => {
  const { db } = useDBContext()
  const { searchTerms } = useOfflineDictionaryContext()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['updateOfflineResults'],
    mutationFn: async (words?: TopicItem[]) => {
      if (words == null) return
      const searchResults =
        (await searchTerms?.(words.map((w) => w.word))) ?? []
      const p = words.map(async (word, index) => {
        if (!word.id) return
        const jishoData =
          searchResults[index].results.find((m: JishoWord) =>
            m.japanese.some(
              (w) => w.word === word.word && w.reading === word.reading
            )
          ) ??
          searchResults[index].results.find((m: JishoWord) =>
            m.japanese.some(
              (w) => w.word === word.word || w.reading === word.word
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
