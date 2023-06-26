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
import { type JishoWord } from '../../types/jisho'
import { Search } from './Search'

export function JishoSearchModal (props: {
  isOpen: boolean
  onClose: () => void
  onSelectItem: (word: JishoWord) => void
}) {
  const { isOpen, onClose, onSelectItem } = props

  return (
    <Modal size="xl" isOpen={isOpen} onClose={onClose}>
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
          <Search onSelectItem={onSelectItem} />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
