import { type BoxProps } from '@chakra-ui/react'

import { useOfflineDictionaryAvailability } from '../../hooks/offline/useOfflineDictionaryAvailability'
import { type JishoWord } from '../../types/jisho'
import { JishoSearch } from './JishoSearch'
import { OfflineSearch } from './OfflineSearch'

export type SearchProps = {
  inputSize?: 'small' | 'large'
  onSelectItem: (word: JishoWord) => void
  isPopup?: boolean
  isShowPopup?: boolean
  setShowPopup?: (status: boolean) => void
} & BoxProps

export const Search = (props: SearchProps) => {
  const isOfflineDictionaryAvailable = useOfflineDictionaryAvailability()
  if (isOfflineDictionaryAvailable) {
    return <OfflineSearch {...props} />
  }
  return <JishoSearch {...props} />
}
