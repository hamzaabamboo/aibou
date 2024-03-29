import axios from 'axios'
import { useOfflineDictionaryContext } from 'hooks/contexts/useOfflineDictionaryContext'
import { useOfflineDictionaryAvailability } from 'hooks/offline/useOfflineDictionaryAvailability'
import { useKeyValueData } from 'hooks/utils/useKeyValueData'
import { SearchApiResults } from 'types/api'
import { parseJishoResults } from 'types/jisho'

export const useGetSearchMultiple = () => {
  const { isDictionaryAvailable, isDBDownloaded, isPending } =
    useOfflineDictionaryAvailability()
  const { searchTerms } = useOfflineDictionaryContext()

  const [{ data: dictionaryApiUrl, refetch }] = useKeyValueData(
    'dictionaryApiUrl',
    ''
  )
  const [{ data: dictionaryApiSecret, refetch: refetchKey }] = useKeyValueData(
    'dictionaryApiSecret',
    ''
  )
  const isOffline = isDBDownloaded && isDictionaryAvailable

  return isPending
    ? undefined
    : async (queries: string[]) => {
        if (isOffline) {
          return searchTerms?.(queries)
        }

        const apiUrl = dictionaryApiUrl || (await refetch()).data
        const apiKey = dictionaryApiSecret || (await refetchKey()).data
        if (!apiUrl) throw new Error('URL not set')
        const p = queries.map(async (word) => {
          const { data } = await axios.get<SearchApiResults>(
            `${apiUrl}?q=${encodeURIComponent(word)}&exact=true`,

            {
              headers: {
                'x-jisho-secret': apiKey
              }
            }
          )

          const results = parseJishoResults(data)
          const jishoData = results.filter((m) =>
            m.japanese.some((w) => w.word === word || w.reading === word)
          )
          return {
            word,
            results: jishoData
          }
        })
        return Promise.all(p) ?? []
      }
}
