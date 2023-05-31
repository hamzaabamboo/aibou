import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { type JishoWord } from '../../types/jisho'

export const useOfflineDictionary = (keyword: string) => {
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

  const search = async (searchTerm: string): Promise<JishoWord[]> =>
    await new Promise((resolve) => {
      if (worker.current == null) return
      worker.current.postMessage({
        type: 'searchWord',
        data: searchTerm
      })
      worker.current.onmessage = ({ data }) => { data.type === 'searchWordResult' && resolve(data.data) }
    })

  return useQuery(['offlineSearch', keyword], async () => {
    if (!keyword) return []
    return await search(keyword)
  })
}
