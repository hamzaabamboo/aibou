import { AddIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  HStack,
  Heading,
  Link,
  Spinner,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import sortBy from "lodash/sortBy";
import type { NextPage } from "next";
import { useEffect } from "react";
import { AddTopicModal } from "../../components/topic/AddTopicModal";
import { useGetTopicsList } from "../../hooks/topic/useGetTopicsList";

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
          <HStack justifyContent="space-between">
            <Heading>Topics</Heading>
            <Button leftIcon={<AddIcon />} onClick={onOpen}>
              Add Topic
            </Button>
          </HStack>
          {isLoading ? (
            <Spinner />
          ) : (
            <Stack>
              {sortBy(data, (d) => d.lastUpdatedAt)
                .reverse()
                .map((topic) => (
                  <Link key={topic.id} href={`/topics/${topic.id}`}>
                    <Box
                      shadow="md"
                      rounded="md"
                      px="2"
                      py="4"
                      _hover={{ textDecoration: "none" }}
                    >
                      <Text fontSize="2xl" fontWeight="bold">
                        {topic.name}
                      </Text>
                      <Text fontSize="lg">{topic.description}</Text>
                    </Box>
                  </Link>
                ))}
            </Stack>
          )}
        </Stack>
      </Container>
      <AddTopicModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default TopicsPage;
