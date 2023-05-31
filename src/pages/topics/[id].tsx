import {
  ArrowBackIcon,
  DeleteIcon,
  DownloadIcon,
  EditIcon,
  HamburgerIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  GridItem,
  HStack,
  Heading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Stack,
  Switch,
  Text,
  useToast,
} from "@chakra-ui/react";
import { uniq } from "lodash";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { DeleteTopicModal } from "../../components/DeleteTopicModal";
import { EditTopicModal } from "../../components/EditTopicModal";
import {
  ItemViewOptions,
  ItemViewSettings,
} from "../../components/ItemViewSettings";
import { parsePartOfSpeech } from "../../components/PartOfSpeechLabel";
import { Search } from "../../components/Search";
import { WordInfoModal } from "../../components/WordInfoModal";
import { WordItem } from "../../components/WordItem";
import { useAddTopicItem } from "../../hooks/useAddTopicItem";
import { useFetchJishoResults } from "../../hooks/useFetchJishoResults";
import { useGetTopic } from "../../hooks/useGetTopic";
import { useGetTopicItems } from "../../hooks/useGetTopicItems";
import { useKeyValueData } from "../../hooks/useKeyValueData";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { JishoWord } from "../../types/jisho";
import { Topic } from "../../types/topic";
import { download } from "../../utils/downloadFile";
import { filterTopicItemsByKeywords } from "../../utils/filterTopicItemsByKeywords";
import { sortTopicItems } from "../../utils/sortTopicItems";

const TopicDetailPage: NextPage = () => {
  const { query } = useRouter();
  const topicId = query.id as string;

  const [showPopup, setShowPopup] = useState(true);
  const [editingTopic, setEditingTopic] = useState<Topic>();
  const [deleteTopic, setDeleteTopic] = useState<Topic>();
  const [viewingItem, setViewingItem] = useState<string>();

  const [settingsData, setSettingsData] = useLocalStorage<ItemViewOptions>(
    "search-view-settings",
    { showMeaning: true, reverseSortOrder: true, orderBy: "createdAt" }
  );

  const {
    data: topic,
    refetch,
    isLoading: isLoadingTopic,
  } = useGetTopic(topicId);
  const { data: words, isLoading: isLoadingItems } = useGetTopicItems(topicId);
  const { mutate, isLoading: isAdding } = useAddTopicItem();
  const { mutate: fetchJishoResults, isLoading: isFetchingJishoResults } =
    useFetchJishoResults(topicId);
  const [
    { data: offlineDictionaryEnabled },
    { mutate: updateDictionaryEnabledStatus },
  ] = useKeyValueData("offlineDictionaryEnabled", true);
  const router = useRouter();
  const toast = useToast();

  const { showMeaning, filter, numberOfColumns, orderBy, reverseSortOrder } =
    settingsData ?? {};

  const filteredList = useMemo(
    () =>
      sortTopicItems(
        orderBy,
        reverseSortOrder
      )(filterTopicItemsByKeywords(filter)(words ?? [])),
    [filter, words, orderBy, reverseSortOrder]
  );

  const isLoading = !topicId || isLoadingTopic || isLoadingItems;

  const handleDownloadCSV = () => {
    const header = "Question,Answers,Comment,Instructions,Render as\n";
    const data = words
      ?.filter((w) => !!w.jishoData)
      ?.reverse()
      ?.map(
        (w) =>
          `${w.word},"${uniq(w.jishoData?.japanese.map((w) => w.reading)).join(
            ","
          )}","${w.jishoData?.senses
            .map((s) =>
              `(${s.parts_of_speech
                .map(parsePartOfSpeech)
                .join(",")}) ${s.english_definitions.join(",")}`.replace(
                '"',
                '""'
              )
            )
            .join("/")}",Type the reading!,Image`
      )
      .join("\n");
    const csv = header + data;
    download(`${topic?.name}.csv`, csv);
  };
  const needsSync = useMemo(
    () => words?.filter((w) => !w.jishoData) ?? [],
    [words]
  );

  useEffect(() => {
    refetch();
  }, []);

  const handleAddTopicItem = async (data: JishoWord) => {
    if (!data || isAdding) return;
    const word = data.japanese[0].word ?? data.japanese[0].reading;
    await mutate(
      { topicId, word, jishoData: data },
      {
        onSuccess: () => {
          setShowPopup(false);
          toast({
            status: "success",
            title: "Word successfully added",
          });
        },
        onError: (error) => {
          toast({
            status: "warning",
            title: (error as Error).message,
          });
        },
      }
    );
  };

  return (
    <>
      <Container maxW="4xl" pt={8}>
        <Stack>
          <Box>
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="ghost"
              onClick={() => router.push("/topics")}
            >
              Back to Topics
            </Button>
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
                flexDir={["column", "row"]}
              >
                <Heading>{topic?.name}</Heading>
                <HStack alignSelf="flex-end">
                  <HStack>
                    <HStack justifyContent="space-between">
                      <Text>Offline Dict.</Text>
                      <Switch
                        isChecked={offlineDictionaryEnabled}
                        onChange={(e) =>
                          updateDictionaryEnabledStatus(e.target.checked)
                        }
                      />
                    </HStack>
                    <Menu>
                      <MenuButton as={Button} rightIcon={<HamburgerIcon />}>
                        Menu
                      </MenuButton>
                      <MenuList>
                        {needsSync.length > 0 && (
                          <MenuItem
                            icon={<DownloadIcon />}
                            isDisabled={isFetchingJishoResults}
                            onClick={() => fetchJishoResults(needsSync)}
                          >
                            Load Definition from Jisho
                          </MenuItem>
                        )}
                        <MenuItem
                          icon={<EditIcon />}
                          onClick={() => setEditingTopic(topic)}
                        >
                          Edit Topic
                        </MenuItem>
                        <MenuItem
                          icon={<DownloadIcon />}
                          onClick={() => handleDownloadCSV()}
                        >
                          Download Data (Kotobot CSV)
                        </MenuItem>
                        <MenuItem
                          icon={<DeleteIcon />}
                          onClick={() => setDeleteTopic(topic)}
                        >
                          Delete Topic
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </HStack>
              </HStack>
              {topic?.description && <Text>{topic?.description}</Text>}
              <Stack direction={["column"]}>
                <Search
                  onSelectItem={(word) => handleAddTopicItem(word)}
                  inputSize="small"
                  w="full"
                  isShowPopup={showPopup}
                  setShowPopup={setShowPopup}
                  isPopup
                />
                <Box w="full">
                  {!words || words.length === 0 ? (
                    <Heading fontSize="xl" textAlign="center">
                      No saved words
                    </Heading>
                  ) : (
                    <Stack>
                      {settingsData && (
                        <ItemViewSettings
                          data={settingsData}
                          setData={setSettingsData}
                        />
                      )}
                      <Grid
                        gridTemplateColumns={[
                          "1fr",
                          `repeat(min(${numberOfColumns}, 2), 1fr)`,
                          `repeat(min(${numberOfColumns}, 3), 1fr)`,
                          `repeat(min(${numberOfColumns}, 4), 1fr)`,
                        ]}
                        alignItems="stretch"
                      >
                        {filteredList.map((item, idx) => {
                          const { id, jishoData, word, ...rest } = item;
                          return (
                            <GridItem
                              key={id}
                              onClick={() => {
                                if (!jishoData) {
                                  fetchJishoResults([item]);
                                } else {
                                  setViewingItem(item.id);
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
                          );
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
      {editingTopic && (
        <EditTopicModal
          topic={editingTopic}
          onClose={() => setEditingTopic(undefined)}
        />
      )}
      {deleteTopic && (
        <DeleteTopicModal
          topic={deleteTopic}
          onClose={() => setDeleteTopic(undefined)}
          onDeleteSuccess={() => {
            setDeleteTopic(undefined);
            router.push("/topics/");
          }}
        />
      )}
      {viewingItem && (
        <WordInfoModal
          item={words?.find((v) => v.id === viewingItem)!}
          isOpen={!!viewingItem}
          onClose={() => setViewingItem(undefined)}
          isEditable
        />
      )}
    </>
  );
};

export default TopicDetailPage;
