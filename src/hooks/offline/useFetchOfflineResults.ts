import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type JishoWord } from '../../types/jisho'
import { type TopicItem } from '../../types/topic'
import { sortJishoReadings } from '../../utils/sortJishoReadings'
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

        if (jishoData != null) {
          await db?.topicEntries.put({
            ...word,
            jishoData: sortJishoReadings(jishoData, word.word)
          })
        }
      }
    },
    {
      onSuccess: async () => { await queryClient.invalidateQueries(['fetchTopicItems', topicId]) }
    }
  )
}
