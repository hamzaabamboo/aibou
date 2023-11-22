import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { type SearchAPIResults } from '../types/api'
import { type TopicItem } from '../types/topic'
import { sortJishoReadings } from '../utils/sortJishoReadings'
import { useDBContext } from './contexts/useDBContext'

export const useFetchJishoResults = (topicId: string) => {
  const { db } = useDBContext()
  const queryClient = useQueryClient()
  return useMutation(
    {
      mutationKey: ['updateJishoResults'],
      mutationFn: async (words?: TopicItem[]) => {
        if (words == null) return
        for (const word of words) {
          if (!word.id) return
          const { data } = await axios.get<SearchAPIResults>(
          `/api/search?keyword=${encodeURIComponent(word.word)}`
          )
          const jishoData = data.results.find((m) => m.japanese.some(
            (w) => w.word === word.word || w.reading === word.word
          ))

          if (jishoData != null) {
            await db?.topicEntries.put({
              ...word,
              jishoData: sortJishoReadings(jishoData, word.word)
            })
          }
        }
      },
      onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['fetchTopicItems', topicId] }) }
    }
  )
}
