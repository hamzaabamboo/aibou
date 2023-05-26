import {
  Box,
  Container,
  HStack,
  Heading,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';
import type { NextPage } from 'next';
import format from 'date-fns/format';
import { useEffect } from 'react';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { JishoSearch } from '../components/JishoSearch';
import { useSyncData } from '../hooks/useSyncData';
import { useLastUpdatedTopics } from '../hooks/useLastUpdatedTopics';

const Home: NextPage = () => {
  const { data: lastUpdatedTopics, refetch } = useLastUpdatedTopics();

  const { syncEnabled, sync, lastSyncedTime } = useSyncData();

  useEffect(() => {
    refetch();
  }, []);

  return (
    <Container>
      <Stack justifyContent="center" alignItems="center" h="full" pt="8">
        <Heading>相棒/ Aibou</Heading>
        <Text>Japanese-language learning companion</Text>
        <JishoSearch onSelectItem={console.log} />
        {syncEnabled && (
          <HStack>
            <Text>
              Last Synced At:
              {' '}
              {format(new Date(lastSyncedTime), 'dd/MM/yyyy HH:mm')}
              {' '}
              (
              {formatDistanceToNow(new Date(lastSyncedTime))}
              {' '}
              ago)
            </Text>
            <Link onClick={() => sync()}>
              <Text color="blue.400">Sync Now</Text>
            </Link>
          </HStack>
        )}
        <Stack alignItems="stretch" width="full">
          {lastUpdatedTopics?.map((topic) => (
            <Link key={topic.id} href={`/topics/${topic.id}`}>
              <Box
                shadow="md"
                rounded="md"
                p={2}
                _hover={{ textDecoration: 'none' }}
              >
                <Text fontSize="2xl" fontWeight="bold">
                  {topic.name}
                </Text>
                <Text fontSize="lg">{topic.description}</Text>
              </Box>
            </Link>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
};

export default Home;
