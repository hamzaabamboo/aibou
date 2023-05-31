import { AddIcon } from "@chakra-ui/icons";
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
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAddTopic } from "../../hooks/topic/useAddTopic";

export function AddTopicModal(props: { isOpen: boolean; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<{
    title?: boolean;
  }>({});
  const { isOpen, onClose } = props;
  const { mutate, isLoading } = useAddTopic();
  const toast = useToast();

  const handleAddTopic = async () => {
    if (title.length === 0 || isLoading) return;
    await mutate({ name: title, description });
    toast({ status: "success", title: "Topic added successfully" });
    onClose();
  };

  useEffect(() => {
    setFormError({
      title: title.length === 0,
    });
  }, [title, description]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(10px) hue-rotate(90deg)"
      />
      <ModalContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddTopic();
          }}
        >
          <ModalHeader>
            <Heading>Add new topic</Heading>
          </ModalHeader>
          <ModalBody>
            <Grid templateColumns={["1fr", "1fr 3fr"]} gap="2">
              <GridItem>
                <Text>Title</Text>
              </GridItem>
              <GridItem>
                <FormControl isInvalid={formError.title}>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <Text>Description</Text>
              </GridItem>
              <GridItem>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </GridItem>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="green"
                onClick={() => handleAddTopic()}
              >
                Add
              </Button>
              <Button onClick={() => onClose()}>Close</Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
