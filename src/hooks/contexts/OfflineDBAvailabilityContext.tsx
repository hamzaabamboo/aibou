import { createContext, type ReactNode } from 'react'
import { useDownloadOfflineDictionary } from '../offline/useDownloadOfflineDictionary'
import { useKeyValueData } from '../utils/useKeyValueData'

export const OfflineDBAvailabilityContext = createContext({
  isDictionaryAvailable: false,
  isDBDownloaded: false,
  isLoading: false
})

export const OfflineDBAvailabilityProvider = ({ children }: { children: ReactNode }) => {
  const { isDBDownloaded, isProcessing } = useDownloadOfflineDictionary()
  const [
    { data: offlineDictionaryEnabled, isLoading: isLoadingVariable }
  ] = useKeyValueData('offlineDictionaryEnabled', true)
  const isAvailable = isDBDownloaded && (offlineDictionaryEnabled ?? false)
  const isLoading = isProcessing && isLoadingVariable

  return <OfflineDBAvailabilityContext.Provider value={{ isDictionaryAvailable: isAvailable, isDBDownloaded, isLoading }}>
        {children}
    </OfflineDBAvailabilityContext.Provider>
}
