import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  GridItem,
  Heading,
  HStack,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Stack,
  Switch,
  Text,
  useDisclosure,
  useToast
} from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'

import {
  ArrowBackIcon,
  DeleteIcon,
  DownloadIcon,
  EditIcon,
  HamburgerIcon
} from '@chakra-ui/icons'
import { parsePartOfSpeech } from 'components/jisho/PartOfSpeechLabel'
import { Search } from 'components/jisho/Search'
import { WordInfoModal } from 'components/jisho/WordInfoModal'
import { WordItem } from 'components/jisho/WordItem'
import { BulkAddModal } from 'components/topic/BulkAddModal'
import { DeleteTopicModal } from 'components/topic/DeleteTopicModal'
import { EditTopicModal } from 'components/topic/EditTopicModal'
import {
  ItemViewOptions,
  ItemViewSettings
} from 'components/topic/ItemViewSettings'
import { useFetchTopicItemDataOffline } from 'hooks/offline/useFetchTopicItemDataOffline'
import { useOfflineDictionaryAvailability } from 'hooks/offline/useOfflineDictionaryAvailability'
import { useFetchTopicItemDataOnline } from 'hooks/search/useFetchTopicItemDataOnline'
import { useGetTopic } from 'hooks/topic/useGetTopic'
import { useAddTopicItem } from 'hooks/topic-item/useAddTopicItem'
import { useGetTopicItems } from 'hooks/topic-item/useGetTopicItems'
import { useLocalStorage } from 'hooks/useLocalStorage'
import { useKeyValueData } from 'hooks/utils/useKeyValueData'
import { uniq } from 'lodash'
import { JishoWord } from 'types/jisho'
import { Topic } from 'types/topic'
import { download } from 'utils/downloadFile'
import { filterTopicItemsByKeywords } from 'utils/filterTopicItemsByKeywords'
import { sortTopicItems } from 'utils/sortTopicItems'

function TopicDetailPage() {
  const searchRef = useRef<HTMLInputElement>(null)
  const { query } = useRouter()
  const topicId = query.id as string

  const [showPopup, setShowPopup] = useState(true)
  const [editingTopic, setEditingTopic] = useState<Topic>()
  const [deleteTopic, setDeleteTopic] = useState<Topic>()
  const [viewingItem, setViewingItem] = useState<string>()

  const {
    isOpen: showBulkAdd,
    onClose: closeBulkAdd,
    onOpen: openBulkAdd
  } = useDisclosure()
  const [settingsData, setSettingsData] = useLocalStorage<ItemViewOptions>(
    'search-view-settings',
    { showMeaning: true, reverseSortOrder: true, orderBy: 'createdAt' }
  )

  const {
    data: topic,
    refetch,
    isPending: isLoadingTopic
  } = useGetTopic(topicId)
  const { data: words, isPending: isLoadingItems } = useGetTopicItems(topicId)
  const { mutate, isPending: isAdding } = useAddTopicItem()
  const { mutate: fetchJishoResults, isPending: isFetchingJishoResults } =
    useFetchTopicItemDataOnline(topicId)
  const { mutate: fetchOfflineResults, isPending: isFetchingOfflineResults } =
    useFetchTopicItemDataOffline(topicId)
  const {
    isDictionaryAvailable,
    isDBDownloaded,
    isPending: isLoadingAvailability
  } = useOfflineDictionaryAvailability()
  const [
    { data: offlineDictionaryEnabled },
    { mutate: updateDictionaryEnabledStatus }
  ] = useKeyValueData('offlineDictionaryEnabled', true)
  const router = useRouter()
  const toast = useToast()

  const { showMeaning, filter, numberOfColumns, orderBy, reverseSortOrder } =
    settingsData ?? {}

  const filteredList = useMemo(
    () =>
      sortTopicItems(
        orderBy,
        reverseSortOrder
      )(filterTopicItemsByKeywords(filter)(words ?? [])),
    [filter, words, orderBy, reverseSortOrder]
  )

  const isLoading = !topicId || isLoadingTopic || isLoadingItems

  const handleDownloadCSV = () => {
    const header = 'Question,Answers,Comment,Instructions,Render as\n'
    const data = words
      ?.filter((w) => !(w.jishoData == null))
      ?.reverse()
      ?.map(
        (w) =>
          `${w.word},"${uniq(
            w.jishoData?.japanese.map((word) => word.reading)
          ).join(',')}","${w.jishoData?.senses
            .map((s) =>
              `(${s.parts_of_speech
                .map(parsePartOfSpeech)
                .filter((str) => !!str)
                .join(',')}) ${s.english_definitions.join(',')}`.replace(
                '"',
                '""'
              )
            )
            .join('/')}",Type the reading!,Image`
      )
      .join('\n')
    const csv = header + data
    download(`${topic?.name}.csv`, csv)
  }

  const needsSync = useMemo(
    () => words?.filter((w) => w.jishoData == null) ?? [],
    [words]
  )

  const needsSyncJisho = useMemo(
    () =>
      words?.filter(
        (w) => w.jishoData == null || w?.jishoData?.attribution.jisho
      ) ?? [],
    [words]
  )

  useEffect(() => {
    if (!isLoadingAvailability && isDictionaryAvailable) {
      searchRef?.current?.focus()
    }
  }, [isLoadingAvailability, isDictionaryAvailable])

  useEffect(() => {
    refetch()
  }, [])

  const handleAddTopicItem = async (data: JishoWord) => {
    if (!data || isAdding) return
    const word = data.japanese[0].word ?? data.japanese[0].reading
    await mutate(
      { topicId, word, jishoData: data },
      {
        onSuccess: () => {
          setShowPopup(false)
          toast({
            status: 'success',
            title: 'Word successfully added'
          })
        },
        onError: (error) => {
          toast({
            status: 'warning',
            title: error.message
          })
        }
      }
    )
  }

  return (
    <>
      <Container maxW="4xl" pt={8}>
        <Stack>
          <Box>
            <Link href="/topics">
              <Button leftIcon={<ArrowBackIcon />} variant="link">
                Back to Topics
              </Button>
            </Link>
          </Box>
          {isLoading ? (
            <HStack justifyContent="center">
              <Spinner size="xl" my={8} />
            </HStack>
          ) : (
            <>
              <HStack
                justifyContent="space-between"
                alignItems="flex-start"
                flexDir={['column', 'row']}
              >
                <Heading>{topic?.name}</Heading>
                <HStack alignSelf="flex-end">
                  <HStack>
                    {isDBDownloaded && (
                      <HStack justifyContent="space-between">
                        <Text>Offline Dict.</Text>
                        <Switch
                          isChecked={offlineDictionaryEnabled}
                          onChange={(e) => {
                            updateDictionaryEnabledStatus(e.target.checked)
                          }}
                        />
                      </HStack>
                    )}
                    <Link href={`/topics/quiz?id=${topicId}`}>
                      <Button>Quiz</Button>
                    </Link>
                    <Menu>
                      <MenuButton as={Button} rightIcon={<HamburgerIcon />}>
                        Menu
                      </MenuButton>
                      <MenuList>
                        {needsSyncJisho.length > 0 && (
                          <MenuItem
                            icon={<DownloadIcon />}
                            isDisabled={isFetchingJishoResults}
                            onClick={() => {
                              fetchJishoResults(needsSync)
                            }}
                          >
                            Load Definition from Jisho
                          </MenuItem>
                        )}
                        {isDictionaryAvailable && needsSync.length > 0 && (
                          <MenuItem
                            icon={<DownloadIcon />}
                            isDisabled={isFetchingOfflineResults}
                            onClick={() => {
                              fetchOfflineResults(needsSync)
                            }}
                          >
                            Load Definition Offline
                          </MenuItem>
                        )}
                        {isDictionaryAvailable && (
                          <MenuItem
                            onClick={() => {
                              openBulkAdd()
                            }}
                          >
                            Bulk Add Items (Experimental)
                          </MenuItem>
                        )}
                        <MenuItem
                          icon={<EditIcon />}
                          onClick={() => {
                            setEditingTopic(topic)
                          }}
                        >
                          Edit Topic
                        </MenuItem>
                        <MenuItem
                          icon={<DownloadIcon />}
                          onClick={() => {
                            handleDownloadCSV()
                          }}
                        >
                          Download Data (Kotobot CSV)
                        </MenuItem>
                        <MenuItem
                          icon={<DeleteIcon />}
                          onClick={() => {
                            setDeleteTopic(topic)
                          }}
                        >
                          Delete Topic
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </HStack>
              </HStack>
              {topic?.description && <Text>{topic?.description}</Text>}
              <Stack direction={['column']}>
                <Search
                  ref={searchRef}
                  onSelectItem={async (word) => {
                    await handleAddTopicItem(word)
                  }}
                  inputSize="small"
                  w="full"
                  isShowPopup={showPopup}
                  setShowPopup={setShowPopup}
                  isPopup
                />
                <Box w="full">
                  {words == null || words.length === 0 ? (
                    <Heading fontSize="xl" textAlign="center">
                      No saved words
                    </Heading>
                  ) : (
                    <Stack>
                      {settingsData != null && (
                        <ItemViewSettings
                          data={settingsData}
                          setData={setSettingsData}
                        />
                      )}
                      <Grid
                        gridTemplateColumns={[
                          '1fr',
                          `repeat(min(${numberOfColumns}, 2), 1fr)`,
                          `repeat(min(${numberOfColumns}, 3), 1fr)`,
                          `repeat(min(${numberOfColumns}, 4), 1fr)`
                        ]}
                        alignItems="stretch"
                      >
                        {filteredList.map((item) => {
                          const { id, jishoData, word } = item
                          return (
                            <GridItem
                              key={id}
                              onClick={() => {
                                if (jishoData == null) {
                                  fetchJishoResults([item])
                                } else {
                                  setViewingItem(item.id)
                                }
                              }}
                            >
                              <WordItem
                                word={word}
                                showMeaning={showMeaning}
                                item={jishoData}
                                showCopy
                              />
                              <Divider />
                            </GridItem>
                          )
                        })}
                      </Grid>
                    </Stack>
                  )}
                </Box>
              </Stack>
            </>
          )}
        </Stack>
      </Container>
      {editingTopic != null && (
        <EditTopicModal
          topic={editingTopic}
          onClose={() => {
            setEditingTopic(undefined)
          }}
        />
      )}
      {deleteTopic != null && (
        <DeleteTopicModal
          topic={deleteTopic}
          onClose={() => {
            setDeleteTopic(undefined)
          }}
          onDeleteSuccess={() => {
            setDeleteTopic(undefined)
            router.push('/topics/')
          }}
        />
      )}
      {viewingItem && (
        <WordInfoModal
          item={words?.find((v) => v.id === viewingItem)!}
          isOpen={!!viewingItem}
          onClose={() => {
            setViewingItem(undefined)
          }}
          isEditable
        />
      )}
      {topic && (
        <BulkAddModal
          topic={topic}
          isOpen={showBulkAdd}
          onClose={closeBulkAdd}
          onAddSuccess={closeBulkAdd}
        />
      )}
    </>
  )
}

export default TopicDetailPage
