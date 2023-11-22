import { EditIcon } from '@chakra-ui/icons'
import {
  Button,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast
} from '@chakra-ui/react'
import { useUpdateTopic } from '../../hooks/topic/useUpdateTopic'
import { type Topic } from '../../types/topic'

// TODO: Refactor modals
export function DeleteTopicModal (props: {
  topic: Topic
  onClose: () => void
  onDeleteSuccess: () => void
}) {
  const { topic, onClose, onDeleteSuccess } = props
  const { mutate, isPending: isLoading } = useUpdateTopic(topic.id ?? '')
  const toast = useToast()

  const handleDeleteTopic = async () => {
    if (isLoading) return
    await mutate({ isDeleted: true })
    toast({ status: 'success', title: 'Topic Deleted successfully' })
    onDeleteSuccess()
  }

  return (
    <Modal
      isOpen={!!topic}
      onClose={onClose}
      closeOnOverlayClick={false}
      size="lg"
    >
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(10px) hue-rotate(90deg)"
      />
      <ModalContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleDeleteTopic()
          }}
        >
          <ModalHeader>
            <Heading>Delete Topic</Heading>
          </ModalHeader>
          <ModalBody>
            <Text>
              Are you sure you want to delete this topic ? (Cannot be undone)
            </Text>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button
                leftIcon={<EditIcon />}
                colorScheme="red"
                onClick={async () => { await handleDeleteTopic() }}
              >
                Delete
              </Button>
              <Button onClick={() => { onClose() }}>Close</Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
