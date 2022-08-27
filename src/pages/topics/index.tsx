import { AddIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  Heading,
  Link,
  Spinner,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { useEffect } from "react";
import { AddTopicModal } from "../../components/AddTopicModal";
import { useGetTopicsList } from "../../hooks/useGetTopicsList";

const TopicsPage: NextPage = () => {
  const { data, refetch, isLoading } = useGetTopicsList();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    refetch();
  }, []);

  return (
    <>
      <Container pt={8}>
        <Stack>
          <Stack direction="row" justifyContent="space-between">
            <Heading>Topics</Heading>
            <Button leftIcon={<AddIcon />} onClick={onOpen}>
              Add Topic
            </Button>
          </Stack>
          {isLoading ? (
            <Spinner />
          ) : (
            <Stack>
              {data?.map((topic) => {
                return (
                  <Link key={topic.id} href={`/topics/${topic.id}`}>
                    <Box shadow="md" rounded="md" p={2}>
                      <Text fontSize="2xl">{topic.name}</Text>
                    </Box>
                  </Link>
                );
              })}
            </Stack>
          )}
        </Stack>
      </Container>
      <AddTopicModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default TopicsPage;
