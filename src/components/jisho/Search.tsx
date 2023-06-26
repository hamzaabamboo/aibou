import { type BoxProps } from '@chakra-ui/react'

import { forwardRef } from 'react'
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

export const Search = forwardRef<HTMLInputElement, SearchProps>((props, ref) => {
  const { isDictionaryAvailable } = useOfflineDictionaryAvailability()

  if (isDictionaryAvailable) {
    return <OfflineSearch ref={ref} {...props} />
  }
  return <JishoSearch ref={ref} {...props} />
}
)

Search.displayName = 'Search'
