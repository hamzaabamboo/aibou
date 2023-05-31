import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderBy } from 'lodash'
import { type JishoWord } from '../../types/jisho'
import { type TopicItem } from '../../types/topic'
import { similarity } from '../../utils/stringSimilarity'
import { useDBContext } from '../contexts/useDBContext'
import { useOfflineDictionaryContext } from '../contexts/useOfflineDictionaryContext'

export const useFetchOfflineResults = (topicId: string) => {
  const { db } = useDBContext()
  const { worker } = useOfflineDictionaryContext()
  const queryClient = useQueryClient()

  return useMutation(
    ['updateOfflineResults'],
    async (words?: TopicItem[]) => {
      if (words == null) return
      const searchResults: any = await new Promise((resolve) => {
        if (!worker) return
        worker.postMessage({
          type: 'searchWords',
          data: words.map(w => w.word)
        })
        worker.onmessage = ({ data }) => { data.type === 'searchWordsResult' && resolve(data.data) }
      })
      for (let i = 0; i < words.length; i++) {
        const word = words[i]
        if (!word.id) return
        const jishoData: JishoWord = searchResults[i].results.find((m: JishoWord) => m.japanese.some(
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
