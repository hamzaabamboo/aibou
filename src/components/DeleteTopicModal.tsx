import { AddIcon, EditIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  Grid,
  GridItem,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  HStack,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAddTopic } from "../hooks/useAddTopic";
import { useUpdateTopic } from "../hooks/useUpdateTopic";
import { Topic } from "../types/topic";

// TODO: Refactor modals
export const DeleteTopicModal = (props: {
  topic: Topic;
  onClose: () => void;
  onDeleteSuccess: () => void;
}) => {
  const { topic, onClose, onDeleteSuccess } = props;
  const { mutate, isLoading } = useUpdateTopic(topic.id ?? "");
  const toast = useToast();

  const handleDeleteTopic = async () => {
    if (isLoading) return;
    await mutate({ isDeleted: true });
    toast({ status: "success", title: "Topic Deleted successfully" });
    onDeleteSuccess();
  };

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
            e.preventDefault();
            handleDeleteTopic();
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
                onClick={() => handleDeleteTopic()}
              >
                Delete
              </Button>
              <Button onClick={() => onClose()}>Close</Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
