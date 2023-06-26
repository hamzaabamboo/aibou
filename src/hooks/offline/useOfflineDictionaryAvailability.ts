import { useContext } from 'react'
import { OfflineDBAvailabilityContext } from '../contexts/OfflineDBAvailabilityContext'

export const useOfflineDictionaryAvailability = () => useContext(OfflineDBAvailabilityContext)
