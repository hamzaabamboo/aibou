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
import { Topic, TopicItem } from "../types/topic";
import { useUpdateTopicItem } from "../hooks/useUpdateTopicItem";

// TODO: Refactor modals
export const DeleteTopicItemModal = (props: {
  topicItem: TopicItem;
  onClose: () => void;
  onDeleteSuccess: () => void;
}) => {
  const { topicItem, onClose, onDeleteSuccess } = props;
  const { mutate, isLoading } = useUpdateTopicItem(topicItem.topicId ?? "");
  const toast = useToast();

  const handleDeleteItem = async () => {
    if (isLoading) return;
    await mutate({
      id: topicItem.id,
      topicId: topicItem.topicId,
      isDeleted: true,
    });
    toast({ status: "success", title: "Item Deleted successfully" });
    onDeleteSuccess();
  };

  return (
    <Modal
      isOpen={!!topicItem}
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
            handleDeleteItem();
          }}
        >
          <ModalHeader>
            <Heading>Delete Item</Heading>
          </ModalHeader>
          <ModalBody>
            <Text>
              Are you sure you want to delete this item ? (Cannot be undone)
            </Text>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button
                leftIcon={<EditIcon />}
                colorScheme="red"
                onClick={() => handleDeleteItem()}
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
