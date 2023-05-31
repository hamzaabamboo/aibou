import { useContext } from 'react'
import { OfflineDictionaryContext } from './OfflineDictionaryProvider'

export const useOfflineDictionaryContext = () => useContext(OfflineDictionaryContext)
