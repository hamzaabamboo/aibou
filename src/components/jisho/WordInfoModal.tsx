import { DeleteIcon, DownloadIcon, ExternalLinkIcon } from '@chakra-ui/icons'
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
  useToast
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useAddTopicItem } from '../../hooks/topic-item/useAddTopicItem'
import { useUpdateTopicItem } from '../../hooks/topic-item/useUpdateTopicItem'
import { useGetTopicsList } from '../../hooks/topic/useGetTopicsList'
import { useFetchJishoResults } from '../../hooks/useFetchJishoResults'
import { type JishoWord } from '../../types/jisho'
import { type TopicItem } from '../../types/topic'
import { DeleteTopicItemModal } from '../topic/DeleteTopicItemModal'
import { KanjiDisplay } from './KanjiDisplay'
import { SearchResultItem } from './SearchResultItem'

export function WordInfoModal (props: {
  item: TopicItem
  isOpen: boolean
  onClose: () => void
  isEditable?: boolean
  isAddable?: boolean
}) {
  const {
    isOpen,
    onClose,
    item,
    isEditable = false,
    isAddable = false
  } = props
  const [isDeleting, setDeleting] = useState(false)
  const [topicIDToAdd, setTopicIDToAdd] = useState<string | undefined>()

  const { mutate: updateTopicItem, isLoading: isLoadingTopics } =
    useUpdateTopicItem()
  const { data: topics } = useGetTopicsList()
  const { mutate: addTopicItem, isLoading } = useAddTopicItem()
  const { mutate: fetchJishoResults, isLoading: isFetchingJishoResults } =
    useFetchJishoResults(item?.topicId)
  const { push } = useRouter()
  const toast = useToast()

  const handleChangeReading = (index: number) => {
    updateTopicItem({
      ...item,
      word: item.jishoData?.japanese[index].word ?? item.word,
      jishoData: {
        ...(item.jishoData as JishoWord),
        japanese:
          (item.jishoData != null) && index !== 0
            ? [
                item.jishoData.japanese[index],
                ...(item.jishoData?.japanese.filter(
                  (_, idx) => idx !== index
                ) ?? [])
              ]
            : item.jishoData?.japanese ?? []
      }
    })
  }

  const handleAddToTopic = async () => {
    const word =
      item.jishoData?.japanese[0].word ?? item.jishoData?.japanese[0].reading
    const topicId = topicIDToAdd ?? topics?.[0].id
    if (!topicId || isLoading || ((item?.jishoData) == null) || !word) return
    await addTopicItem(
      {
        topicId,
        word,
        jishoData: item.jishoData
      },
      {
        onSuccess: () => {
          push(`/topics/${topicId}`)
        },
        onError: (error) => {
          toast({
            status: 'warning',
            title: (error as Error).message
          })
        }
      }
    )
  }

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
              {(item.jishoData != null) && (
                <SearchResultItem isCard={false} item={item.jishoData} />
              )}
              <Stack>
                <Heading size="lg">Search On</Heading>
                <Link
                  href={`https://www.google.com/search?q=${encodeURIComponent(
                    item.word
                  )}`}
                  isExternal
                >
                  Google
                  <ExternalLinkIcon mx="2px" />
                </Link>
                <Link
                  href={`https://jisho.org/search/${encodeURIComponent(
                    item.word
                  )}`}
                  isExternal
                >
                  Jisho
                  <ExternalLinkIcon mx="2px" />
                </Link>
                <Link
                  href={`https://kotobank.jp/gs/?q=${encodeURIComponent(
                    item.word
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
                    'すべて'
                  )}`}
                  isExternal
                >
                  Kanji Jiten Online
                  <ExternalLinkIcon mx="2px" />
                </Link>
              </Stack>
              {isEditable && (
                <Stack>
                  <Heading size="lg">Edit</Heading>
                  <HStack justifyContent="space-between">
                    <Text>Change Reading</Text>
                    <Select
                      value={0}
                      onChange={(e) => { handleChangeReading(Number(e.target.value)) }
                      }
                    >
                      {item.jishoData?.japanese.map((o, idx) => (
                        <option key={idx} value={idx}>
                          <KanjiDisplay data={o} hideRuby />
                        </option>
                      ))}
                    </Select>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text>Download Data from Jisho</Text>
                    <IconButton
                      aria-label="download"
                      icon={<DownloadIcon />}
                      onClick={(e) => { fetchJishoResults([item]) }}
                    />
                  </HStack>
                </Stack>
              )}
              {isAddable && (
                <Stack>
                  <Heading size="md">Add to topic</Heading>
                  <HStack>
                    <Text>Select Topic:</Text>
                    <Select
                      isDisabled={isLoadingTopics}
                      value={topicIDToAdd}
                      onChange={(e) => { setTopicIDToAdd(e.target.value) }}
                    >
                      {topics?.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </Select>
                    <Button
                      isDisabled={isLoadingTopics}
                      onClick={async (e) => { await handleAddToTopic() }}
                    >
                      Add
                    </Button>
                  </HStack>
                </Stack>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <HStack w="full" justifyContent="space-between">
              {isEditable && (
                <IconButton
                  colorScheme="red"
                  aria-label="Delete Item"
                  icon={<DeleteIcon />}
                  onClick={() => { setDeleting(true) }}
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
          onClose={() => { setDeleting(false) }}
          onDeleteSuccess={() => {
            setDeleting(false)
            onClose()
          }}
        />
      )}
    </>
  )
}
