import { createContext, type ReactNode, useMemo } from 'react'

import { useDownloadOfflineDictionary } from '../offline/useDownloadOfflineDictionary'
import { useKeyValueData } from '../utils/useKeyValueData'

export const OfflineDBAvailabilityContext = createContext({
  isDictionaryAvailable: false,
  isDBDownloaded: false,
  isPending: false
})

export function OfflineDBAvailabilityProvider({
  children
}: {
  children: ReactNode
}) {
  const { isDBDownloaded, isProcessing } = useDownloadOfflineDictionary()
  const [{ data: offlineDictionaryEnabled, isPending: isLoadingVariable }] =
    useKeyValueData('offlineDictionaryEnabled', true)
  const isAvailable = isDBDownloaded && (offlineDictionaryEnabled ?? false)
  const isLoading = isProcessing || isLoadingVariable

  const context = useMemo(
    () => ({
      isDictionaryAvailable: isAvailable,
      isDBDownloaded,
      isPending: isLoading
    }),
    [isAvailable, isDBDownloaded, isLoading]
  )

  return (
    <OfflineDBAvailabilityContext.Provider value={context}>
      {children}
    </OfflineDBAvailabilityContext.Provider>
  )
}
