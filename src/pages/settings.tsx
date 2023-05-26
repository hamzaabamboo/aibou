import {
  Button,
  Container,
  HStack,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react';
import type { NextPage } from 'next';
import { format } from 'date-fns';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { JishoSearch } from '../components/JishoSearch';
import { useDownloadOfflineDictionary } from '../hooks/useDownloadOfflineDictionary';
import { useLastUpdatedTime } from '../hooks/useLastUpdatedTime';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SyncSettings } from '../components/SyncSettings';
import { useSyncData } from '../hooks/useSyncData';
import { useKeyValueData } from '../hooks/useKeyValueData';

const Home: NextPage = () => {
  const { download } = useDownloadOfflineDictionary();
  const [{ data: lastSyncedTime }] = useKeyValueData('lastSyncedTime', 0);
  const { sync, syncEnabled } = useSyncData();

  return (
    <Container>
      <Stack h="full" pt="8">
        <Heading>App Settings</Heading>
        <Stack>
          <HStack justifyContent="space-between">
            <Stack>
              <Text>Sync Data (Experimental)</Text>
              {lastSyncedTime && (
                <Text>
                  Last updated at :
                  {' '}
                  {format(new Date(lastSyncedTime), 'dd/MM/yyyy HH:mm')}
                  {' '}
                  (
                  {formatDistanceToNow(new Date(lastSyncedTime))}
                  {' '}
                  ago)
                </Text>
              )}
            </Stack>
            <Button
              isDisabled={!syncEnabled}
              onClick={() => sync(new Date(lastSyncedTime ?? 0))}
            >
              Sync Data
            </Button>
          </HStack>
          <SyncSettings />
          <HStack justifyContent="space-between">
            <Text>Sync Everything (This is destructive btw)</Text>
            <Button
              isDisabled={!syncEnabled}
              colorScheme="red"
              onClick={() => sync(new Date(0))}
            >
              Sync Everything
            </Button>
          </HStack>
          <HStack justifyContent="space-between">
            <Text>Download offline dictionary (Work in progress)</Text>
            <Button isDisabled onClick={() => download()}>
              Download
            </Button>
          </HStack>
        </Stack>
      </Stack>
    </Container>
  );
};

export default Home;
