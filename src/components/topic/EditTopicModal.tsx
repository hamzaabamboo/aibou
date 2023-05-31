import { EditIcon } from '@chakra-ui/icons'
import {
  Button,
  FormControl,
  Grid,
  GridItem,
  HStack,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useToast
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useUpdateTopic } from '../../hooks/topic/useUpdateTopic'
import { type Topic } from '../../types/topic'

// TODO: Refactor modals
export function EditTopicModal (props: { topic: Topic, onClose: () => void }) {
  const { topic, onClose } = props
  const [title, setTitle] = useState(topic.name)
  const [description, setDescription] = useState(topic.description)
  const [formError, setFormError] = useState<{
    title?: boolean
  }>({})
  const { mutate, isLoading } = useUpdateTopic(topic.id ?? '')
  const toast = useToast()

  const handleEditTopic = async () => {
    if (title.length === 0 || isLoading) return
    await mutate({ name: title, description })
    toast({ status: 'success', title: 'Topic edited successfully' })
    onClose()
  }

  useEffect(() => {
    setFormError({
      title: title.length === 0
    })
  }, [title])

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
            handleEditTopic()
          }}
        >
          <ModalHeader>
            <Heading>Add new topic</Heading>
          </ModalHeader>
          <ModalBody>
            <Grid templateColumns={['1fr', '1fr 3fr']} gap="2">
              <GridItem>
                <Text>Title</Text>
              </GridItem>
              <GridItem>
                <FormControl isInvalid={formError.title}>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value) }}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <Text>Description</Text>
              </GridItem>
              <GridItem>
                <Textarea
                  value={description}
                  onChange={(e) => { setDescription(e.target.value) }}
                />
              </GridItem>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button
                leftIcon={<EditIcon />}
                colorScheme="green"
                onClick={async () => { await handleEditTopic() }}
              >
                Edit
              </Button>
              <Button onClick={() => { onClose() }}>Close</Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
