import {
  AddIcon,
  ArrowBackIcon,
  ArrowLeftIcon,
  DeleteIcon,
  EditIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  Heading,
  Spinner,
  Stack,
  Switch,
  TagLeftIcon,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { JishoSearch } from "../../components/JishoSearch";
import { KanjiDisplay } from "../../components/KanjiDisplay";
import { SearchResultItem } from "../../components/SearchResultItem";
import { useAddTopicItem } from "../../hooks/useAddTopicItem";
import { useGetTopic } from "../../hooks/useGetTopic";
import { useGetTopicItems } from "../../hooks/useGetTopicItems";
import { JishoWord } from "../../types/jisho";
import { db } from "../../utils/db";

const TopicDetailPage: NextPage = () => {
  const { query } = useRouter();
  const [showMeaning, setShowMeaning] = useState(true);
  const topicId = parseInt(query.id as string);
  const { data: topic, refetch, isLoading } = useGetTopic(topicId);

  const { data: saveWords } = useGetTopicItems(topicId);
  const { mutate, isLoading: isAdding } = useAddTopicItem(topicId);
  // const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const toast = useToast();

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
    toast({
      status: "success",
      title: "Word successfully added",
    });
  };

  return (
    <>
      <Container maxW="2xl" pt={8}>
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
          <Stack direction="row" justifyContent="space-between">
            <Heading>{topic?.name}</Heading>
            <Stack direction="row">
              <Button colorScheme="yellow">
                <EditIcon />
              </Button>
              <Button colorScheme="red">
                <DeleteIcon />
              </Button>
            </Stack>
          </Stack>
          {topic?.description && <Text>{topic?.description}</Text>}
          <Stack direction={["column", "row"]}>
            <JishoSearch
              onSelectItem={(word) => handleAddTopicItem(word)}
              inputSize="small"
              w="full"
            />
            <Box w="full" px={2}>
              {!saveWords || saveWords.length === 0 ? (
                <Heading fontSize="xl" textAlign="center">
                  No saved words
                </Heading>
              ) : (
                <Stack>
                  <Heading fontSize="2xl">Saved words</Heading>
                  <Switch
                    isChecked={showMeaning}
                    onChange={(e) => setShowMeaning(e.target.checked)}
                  />
                  <Stack>
                    {saveWords.map(({ id, jishoData, word }) => (
                      <Box key={id}>
                        {jishoData ? (
                          <SearchResultItem
                            item={jishoData}
                            showMeaning={showMeaning}
                          />
                        ) : (
                          <KanjiDisplay data={{ word: word }} />
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              )}
            </Box>
          </Stack>
        </Stack>
      </Container>
    </>
  );
};

export default TopicDetailPage;
