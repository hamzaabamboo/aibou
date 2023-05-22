import {
  Button,
  Heading,
  Modal,
  Stack,
  Select,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  HStack,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { TopicItem } from "../types/topic";
import { JishoWord } from "../types/jisho";
import { SearchResultItem } from "./SearchResultItem";
import { KanjiDisplay } from "./KanjiDisplay";
import { useUpdateTopic } from "../hooks/useUpdateTopic";
import { useUpdateTopicItem } from "../hooks/useUpdateTopicItem";
import { DeleteIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { DeleteTopicItemModal } from "./DeleteTopicItemModal";

export const TopicItemModal = (props: {
  item: TopicItem;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { isOpen, onClose, item } = props;
  const [isDeleting, setDeleting] = useState(false);

  const { mutate: updateTopicItem } = useUpdateTopicItem(item.topicId);

  const handleChangeReading = (index: number) => {
    updateTopicItem({
      ...item,
      jishoData: {
        ...(item.jishoData as JishoWord),
        japanese:
          item.jishoData && index !== 0
            ? [
                item.jishoData.japanese[index],
                ...(item.jishoData?.japanese.filter(
                  (_, idx) => idx !== index
                ) ?? []),
              ]
            : item.jishoData?.japanese ?? [],
      },
    });
    console.log("updated", index);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay
          bg="blackAlpha.300"
          backdropFilter="blur(10px) hue-rotate(90deg)"
        />
        <ModalContent>
          <ModalHeader>
            <Heading>Word Info</Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack>
              {item.jishoData && (
                <SearchResultItem isCard={false} item={item.jishoData} />
              )}
              <Stack>
                <HStack>
                  <Text>Change Reading:</Text>
                  <Select
                    value={0}
                    onChange={(e) =>
                      handleChangeReading(Number(e.target.value))
                    }
                  >
                    {item.jishoData?.japanese.map((o, idx) => (
                      <option key={idx} value={idx}>
                        <KanjiDisplay data={o} hideRuby />
                      </option>
                    ))}
                  </Select>
                </HStack>
              </Stack>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <HStack w="full" justifyContent="space-between">
              <IconButton
                colorScheme="red"
                aria-label="Delete Item"
                icon={<DeleteIcon />}
                onClick={() => setDeleting(true)}
              />
              <Button onClick={onClose}>Close</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {isDeleting && (
        <DeleteTopicItemModal
          topicItem={item}
          onClose={() => setDeleting(false)}
          onDeleteSuccess={() => {
            setDeleting(false);
            onClose();
          }}
        />
      )}
    </>
  );
};
