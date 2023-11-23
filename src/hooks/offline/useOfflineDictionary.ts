import { useQuery } from '@tanstack/react-query'

import { type JishoWord } from '../../types/jisho'
import { useOfflineDictionaryContext } from '../contexts/useOfflineDictionaryContext'

export const useOfflineDictionary = (
  keyword: string,
  options: { exact?: boolean } = {}
) => {
  const { exact } = options
  const { worker } = useOfflineDictionaryContext()

  const search = async (searchTerm: string): Promise<JishoWord[]> =>
    new Promise((resolve) => {
      if (!worker) return
      worker.postMessage({
        type: 'searchWord',
        data: searchTerm,
        exact
      })
      worker.onmessage = ({ data }) => {
        if (data.type === 'searchWordResult') resolve(data.data)
      }
    })

  return useQuery({
    queryKey: ['offlineSearch', keyword],
    queryFn: async () => {
      if (!keyword) return []
      return search(keyword)
    }
  })
}
