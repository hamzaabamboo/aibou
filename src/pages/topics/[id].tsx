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
  TagLeftIcon,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { AddTopicModal } from "../../components/AddTopicModal";
import { JishoSearch } from "../../components/JishoSearch";
import { useGetTopic } from "../../hooks/useGetTopic";

const TopicDetailPage: NextPage = () => {
  const { query } = useRouter();
  const {
    data: topic,
    refetch,
    isLoading,
  } = useGetTopic(parseInt(query.id as string));
  // const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  const saveWords = [];
  useEffect(() => {
    refetch();
  }, []);

  if (!topic && !isLoading)
    return (
      <Container pt={8}>
        <Text fontSize="xl">
          Topic not found{" "}
          <Link as="span" href="/topics">
            go back
          </Link>
        </Text>
      </Container>
    );

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
            <JishoSearch onSelectItem={() => {}} inputSize="small" w="full" />
            <Box w="full" px={2}>
              {saveWords.length === 0 ? (
                <Heading fontSize="xl" textAlign="center">
                  No saved words
                </Heading>
              ) : (
                <>
                  <Heading fontSize="2xl">Saved words</Heading>
                </>
              )}
            </Box>
          </Stack>
        </Stack>
      </Container>
    </>
  );
};

export default TopicDetailPage;
