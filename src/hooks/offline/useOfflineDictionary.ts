import { useQuery } from '@tanstack/react-query'
import { type JishoWord } from '../../types/jisho'
import { useOfflineDictionaryContext } from '../contexts/useOfflineDictionaryContext'

export const useOfflineDictionary = (keyword: string) => {
  const { worker } = useOfflineDictionaryContext()

  const search = async (searchTerm: string): Promise<JishoWord[]> =>
    await new Promise((resolve) => {
      if (!worker) return
      worker.postMessage({
        type: 'searchWord',
        data: searchTerm
      })
      worker.onmessage = ({ data }) => { data.type === 'searchWordResult' && resolve(data.data) }
    })

  return useQuery(['offlineSearch', keyword], async () => {
    if (!keyword) return []
    return await search(keyword)
  })
}
