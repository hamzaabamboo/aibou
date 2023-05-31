import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { orderBy } from 'lodash'
import { type SearchAPIResults } from '../types/api'
import { type TopicItem } from '../types/topic'
import { similarity } from '../utils/stringSimilarity'
import { useDBContext } from './contexts/useDBContext'

export const useFetchJishoResults = (topicId: string) => {
  const { db } = useDBContext()
  const queryClient = useQueryClient()
  return useMutation(
    ['updateJishoResults'],
    async (words?: TopicItem[]) => {
      if (words == null) return
      for (const word of words) {
        if (!word.id) return
        const { data } = await axios.get<SearchAPIResults>(
          `/api/search?keyword=${encodeURIComponent(word.word)}`
        )
        const jishoData = data.results.find((m) => m.japanese.some(
          (w) => w.word === word.word || w.reading === word.word
        ))

        const sortedReadings = word
          ? orderBy(
            jishoData?.japanese,
            (w) => Math.max(
              w.word ? similarity(w.word, word.word) : -Infinity,
              w.reading ? similarity(w.reading, word.word) : -Infinity
            ),
            'desc'
          )
          : jishoData?.japanese

        if (jishoData != null) {
          await db?.topicEntries.put({
            ...word,
            jishoData: { ...jishoData, japanese: sortedReadings ?? [] }
          })
        }
      }
    },
    {
      onSuccess: async () => { await queryClient.invalidateQueries(['fetchTopicItems', topicId]) }
    }
  )
}
