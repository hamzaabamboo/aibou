import {
  Button,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { JishoWord } from '../types/jisho';
import { JishoSearch } from './JishoSearch';

export function JishoSearchModal(props: {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (word: JishoWord) => void;
}) {
  const { isOpen, onClose, onSelectItem } = props;

  return (
    <Modal size="full" isOpen={isOpen} onClose={onClose}>
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
          <JishoSearch onSelectItem={onSelectItem} />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
