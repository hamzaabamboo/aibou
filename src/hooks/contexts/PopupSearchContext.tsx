import { useDisclosure } from '@chakra-ui/react'
import {
  createContext,
  type ReactNode,
  useEffect,
  useMemo,
  useState
} from 'react'

import { JishoSearchModal } from '../../components/jisho/JishoSearchModal'
import { WordInfoModal } from '../../components/jisho/WordInfoModal'
import { type JishoWord } from '../../types/jisho'

interface PopupSearchData {
  openSearchModal?: (keyword?: string) => void
  closeSearchModal?: () => void
  showWordInfo?: (word: JishoWord) => void
}
export const PopupSearchContext = createContext<PopupSearchData>({})

export function PopupSearchProvider({ children }: { children: ReactNode }) {
  const [selectedWord, setSelectedWord] = useState<JishoWord | undefined>()
  const [keyword, setKeyword] = useState<string>()
  const { isOpen, onClose, onOpen } = useDisclosure()

  useEffect(() => {
    const handleKeystrokes = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 's') {
        onOpen()
        event.stopPropagation()
        event.stopImmediatePropagation()
      } else if (event.key === 'Esc' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keypress', handleKeystrokes)
    return () => {
      window.removeEventListener('keypress', handleKeystrokes)
    }
  }, [])

  const context = useMemo(
    () => ({
      openSearchModal: (searchKeyword?: string) => {
        setKeyword(searchKeyword)
        onOpen()
      },
      closeSearchModal: onClose,
      showWordInfo: setSelectedWord
    }),
    [onOpen, onClose]
  )

  return (
    <>
      <PopupSearchContext.Provider value={context}>
        {children}
      </PopupSearchContext.Provider>
      <JishoSearchModal
        isOpen={isOpen}
        onClose={onClose}
        keyword={keyword}
        onSelectItem={setSelectedWord}
      />
      <WordInfoModal
        isOpen={!!selectedWord}
        item={{
          topicId: '',
          word:
            selectedWord?.japanese[0].word ??
            selectedWord?.japanese[0].reading ??
            '',
          jishoData: selectedWord,
          createdAt: new Date(),
          lastUpdatedAt: new Date()
        }}
        onClose={() => {
          setSelectedWord(undefined)
        }}
        isAddable
      />
    </>
  )
}
