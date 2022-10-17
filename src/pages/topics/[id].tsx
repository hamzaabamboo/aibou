import { ArrowBackIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  GridItem,
  Heading,
  HStack,
  Stack,
  Switch,
  Text,
  useToast,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { DeleteTopicModal } from "../../components/DeleteTopicModal";
import { EditTopicModal } from "../../components/EditTopicModal";
import {
  ItemViewOptions,
  ItemViewSettings,
} from "../../components/ItemViewSettings";
import { JishoSearch } from "../../components/JishoSearch";
import { KanjiDisplay } from "../../components/KanjiDisplay";
import { SearchResultItem } from "../../components/SearchResultItem";
import { useAddTopicItem } from "../../hooks/useAddTopicItem";
import { useFetchJishoResults } from "../../hooks/useFetchJishoResults";
import { useGetTopic } from "../../hooks/useGetTopic";
import { useGetTopicItems } from "../../hooks/useGetTopicItems";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useUpdateTopic } from "../../hooks/useUpdateTopic";
import { JishoWord } from "../../types/jisho";
import { Topic } from "../../types/topic";
import { db } from "../../utils/db";
import { filterTopicItemsByKeywords } from "../../utils/filterTopicItemsByKeywords";
import { sortTopicItems } from "../../utils/sortTopicItems";

const TopicDetailPage: NextPage = () => {
  const { query } = useRouter();
  const topicId = query.id as string;

  const [showPopup, setShowPopup] = useState(true);
  const [editingTopic, setEditingTopic] = useState<Topic>();
  const [deleteTopic, setDeleteTopic] = useState<Topic>();

  const [settingsData, setSettingsData] = useLocalStorage<ItemViewOptions>(
    "search-view-settings",
    { showMeaning: true, reverseSortOrder: true, orderBy: "createdAt" }
  );

  const { data: topic, refetch, isLoading } = useGetTopic(topicId);
  const { data: saveWords } = useGetTopicItems(topicId);
  const { mutate, isLoading: isAdding } = useAddTopicItem(topicId);
  const { mutate: fetchJishoResults, isLoading: isFetchingJishoResults } =
    useFetchJishoResults(topicId);
  const router = useRouter();
  const toast = useToast();

  const { showMeaning, filter, numberOfColumns, orderBy, reverseSortOrder } =
    settingsData ?? {};

  const filteredList = useMemo(
    () =>
      sortTopicItems(
        orderBy,
        reverseSortOrder
      )(filterTopicItemsByKeywords(filter)(saveWords ?? [])),
    [filter, saveWords, orderBy, reverseSortOrder]
  );

  const needsSync = useMemo(
    () => saveWords?.filter((w) => !w.jishoData) ?? [],
    [saveWords]
  );

  useEffect(() => {
    refetch();
  }, []);

  const handleAddTopicItem = async (data: JishoWord) => {
    if (!data || isAdding) return;
    const word = data.japanese[0].word ?? data.japanese[0].reading;
    const wordAlreadyExist =
      (await db?.topicEntries?.where({ word, topicId }).count()) ?? 0;
    if (wordAlreadyExist > 0) {
      toast({
        status: "warning",
        title: "Word already exist in this topic",
      });
      return;
    }
    await mutate({ word, jishoData: data });
    setShowPopup(false);
    toast({
      status: "success",
      title: "Word successfully added",
    });
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
          <HStack justifyContent="space-between">
            <Heading>{topic?.name}</Heading>
            <HStack>
              {needsSync.length > 0 && (
                <Button
                  colorScheme="green"
                  isLoading={isFetchingJishoResults}
                  onClick={() => fetchJishoResults(needsSync)}
                >
                  Sync Words
                </Button>
              )}
              <Button
                colorScheme="yellow"
                onClick={() => setEditingTopic(topic)}
              >
                <EditIcon />
              </Button>

              <Button colorScheme="red" onClick={() => setDeleteTopic(topic)}>
                <DeleteIcon />
              </Button>
            </HStack>
          </HStack>
          {topic?.description && <Text>{topic?.description}</Text>}
          <Stack direction={["column"]}>
            <JishoSearch
              onSelectItem={(word) => handleAddTopicItem(word)}
              inputSize="small"
              w="full"
              isShowPopup={showPopup}
              setShowPopup={setShowPopup}
              isPopup
            />
            <Box w="full">
              {!saveWords || saveWords.length === 0 ? (
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
                    {filteredList.map(({ id, jishoData, word }) => (
                      <GridItem key={id}>
                        {jishoData ? (
                          <SearchResultItem
                            item={jishoData}
                            showMeaning={showMeaning}
                            isCard={false}
                          />
                        ) : (
                          <KanjiDisplay data={{ word: word }} />
                        )}
                        <Divider />
                      </GridItem>
                    ))}
                  </Grid>
                </Stack>
              )}
            </Box>
          </Stack>
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
    </>
  );
};

export default TopicDetailPage;
