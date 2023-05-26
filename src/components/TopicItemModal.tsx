import {
  Button,
  HStack,
  Heading,
  IconButton,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Text,
} from '@chakra-ui/react';
import { DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { TopicItem } from '../types/topic';
import { JishoWord } from '../types/jisho';
import { useUpdateTopic } from '../hooks/useUpdateTopic';
import { useUpdateTopicItem } from '../hooks/useUpdateTopicItem';
import { SearchResultItem } from './SearchResultItem';
import { KanjiDisplay } from './KanjiDisplay';
import { DeleteTopicItemModal } from './DeleteTopicItemModal';

export function TopicItemModal(props: {
  item: TopicItem;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { isOpen, onClose, item } = props;
  const [isDeleting, setDeleting] = useState(false);

  const { mutate: updateTopicItem } = useUpdateTopicItem(item.topicId);

  const handleChangeReading = (index: number) => {
    updateTopicItem({
      ...item,
      word: item.jishoData?.japanese[index].word ?? item.word,
      jishoData: {
        ...(item.jishoData as JishoWord),
        japanese:
          item.jishoData && index !== 0
            ? [
              item.jishoData.japanese[index],
              ...(item.jishoData?.japanese.filter(
                (_, idx) => idx !== index,
              ) ?? []),
            ]
            : item.jishoData?.japanese ?? [],
      },
    });
  };

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
            <Stack>
              {item.jishoData && (
                <SearchResultItem isCard={false} item={item.jishoData} />
              )}
              <Stack>
                <Heading size="lg">Search On</Heading>
                <Link
                  href={`https://www.google.com/search?q=${encodeURIComponent(
                    item.word,
                  )}`}
                  isExternal
                >
                  Google
                  <ExternalLinkIcon mx="2px" />
                </Link>
                <Link
                  href={`https://jisho.org/search/${encodeURIComponent(
                    item.word,
                  )}`}
                  isExternal
                >
                  Jisho
                  <ExternalLinkIcon mx="2px" />
                </Link>
                <Link
                  href={`https://kotobank.jp/gs/?q=${encodeURIComponent(
                    item.word,
                  )}`}
                  isExternal
                >
                  Kotobank
                  <ExternalLinkIcon mx="2px" />
                </Link>
                <Link
                  href={`https://kanji.jitenon.jp/cat/search.php?getdata=${item.word
                    .split('')
                    .map((s) => s.charCodeAt(0).toString(16))
                    .join('_')}&search=contain&how=${encodeURIComponent(
                    'すべて',
                  )}`}
                  isExternal
                >
                  Kanji Jiten Online
                  <ExternalLinkIcon mx="2px" />
                </Link>
              </Stack>
              <Stack>
                <Heading size="lg">Edit</Heading>
                <HStack>
                  <Text>Change Reading:</Text>
                  <Select
                    value={0}
                    onChange={(e) => handleChangeReading(Number(e.target.value))}
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
}
