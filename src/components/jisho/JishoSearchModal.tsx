import {
  Button,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay
} from '@chakra-ui/react'
import { useRef } from 'react'
import { type JishoWord } from '../../types/jisho'
import { Search } from './Search'

export function JishoSearchModal (props: {
  isOpen: boolean
  onClose: () => void
  onSelectItem: (word: JishoWord) => void
  keyword?: string
}) {
  const { isOpen, onClose, onSelectItem, keyword } = props
  const searchRef = useRef<HTMLInputElement>(null)

  return (
    <Modal size="xl" isOpen={isOpen} onClose={onClose} initialFocusRef={searchRef}>
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(10px) hue-rotate(90deg)"
      />
      <ModalContent>
        <ModalHeader>
          <Heading>Search Jisho</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Search ref={searchRef} initialWord={keyword} onSelectItem={onSelectItem} />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
