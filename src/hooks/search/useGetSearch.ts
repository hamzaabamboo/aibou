import { useOfflineDictionary } from 'hooks/offline/useOfflineDictionary'
import { useOfflineDictionaryAvailability } from 'hooks/offline/useOfflineDictionaryAvailability'

import { useJishoSearch } from './useJishoSearch'

export const useGetSearchResults = (
  keyword: string,
  options: { exact?: boolean } = {}
) => {
  const { isDictionaryAvailable, isDBDownloaded } =
    useOfflineDictionaryAvailability()
  const isOffline = isDBDownloaded && isDictionaryAvailable
  const offlineResults = useOfflineDictionary(keyword, options, isOffline)
  const onlineResults = useJishoSearch(keyword, options, !isOffline)

  if (isOffline) {
    return offlineResults
  }

  return onlineResults
}
