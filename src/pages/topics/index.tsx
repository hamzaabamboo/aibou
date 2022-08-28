import { AddIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  Heading,
  Link,
  Spinner,
  Stack,
  HStack,
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
              {data?.map((topic) => {
                return (
                  <Link key={topic.id} href={`/topics/${topic.id}`}>
                    <Box
                      shadow="md"
                      rounded="md"
                      p={2}
                      _hover={{ textDecoration: "none" }}
                    >
                      <Text fontSize="2xl" fontWeight="bold">
                        {topic.name}
                      </Text>
                      <Text fontSize="lg">{topic.description}</Text>
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
