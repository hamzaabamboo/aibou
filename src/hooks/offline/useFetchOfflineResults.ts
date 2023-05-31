import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderBy } from 'lodash'
import { useEffect, useRef } from 'react'
import { type JishoWord } from '../../types/jisho'
import { type TopicItem } from '../../types/topic'
import { similarity } from '../../utils/stringSimilarity'
import { useDBContext } from '../contexts/useDBContext'

export const useFetchOfflineResults = (topicId: string) => {
  const { db } = useDBContext()
  const queryClient = useQueryClient()

  const worker = useRef<Worker>()

  useEffect(() => {
    worker.current = new Worker(
      new URL('../../workers/offline-search.worker.ts', import.meta.url)
    )
    worker.current.onmessage = async ({ data }) => {
      switch (data.type) {
        case 'searchWordResult':
      }
    }
    return () => {
      worker.current?.terminate()
    }
  }, [])

  return useMutation(
    ['updateOfflineResults'],
    async (words?: TopicItem[]) => {
      if (words == null) return
      const searchResults: any = await new Promise((resolve) => {
        if (worker.current == null) return
        worker.current.postMessage({
          type: 'searchWords',
          data: words.map(w => w.word)
        })
        worker.current.onmessage = ({ data }) => { data.type === 'searchWordsResult' && resolve(data.data) }
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
