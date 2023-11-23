import {
  Button,
  Heading,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay
} from '@chakra-ui/react'
import { useState } from 'react'

import { DeleteIcon } from '@chakra-ui/icons'

import { type TopicItem } from '../../types/topic'
import { DeleteTopicItemModal } from '../topic/DeleteTopicItemModal'
import { WordInfo } from './WordInfo'

export function WordInfoModal(props: {
  item: TopicItem
  isOpen: boolean
  onClose: () => void
  isEditable?: boolean
  isAddable?: boolean
}) {
  const { isOpen, onClose, item, isEditable = false, isAddable = false } = props
  const [isDeleting, setDeleting] = useState(false)

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay
          bg="blackAlpha.300"
          // backdropFilter="blur(10px) hue-rotate(90deg)"
        />
        <ModalContent>
          <ModalHeader>
            <Heading>Word Info</Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <WordInfo
              item={item}
              isEditable={isEditable}
              isAddable={isAddable}
            />
          </ModalBody>
          <ModalFooter>
            <HStack w="full" justifyContent="space-between">
              {isEditable && (
                <IconButton
                  colorScheme="red"
                  aria-label="Delete Item"
                  icon={<DeleteIcon />}
                  onClick={() => {
                    setDeleting(true)
                  }}
                />
              )}
              <Button onClick={onClose}>Close</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {isEditable && isDeleting && (
        <DeleteTopicItemModal
          topicItem={item}
          onClose={() => {
            setDeleting(false)
          }}
          onDeleteSuccess={() => {
            setDeleting(false)
            onClose()
          }}
        />
      )}
    </>
  )
}
