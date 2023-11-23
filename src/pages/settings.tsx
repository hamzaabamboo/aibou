import {
  Button,
  Container,
  Divider,
  Heading,
  HStack,
  IconButton,
  Stack,
  Switch,
  Text
} from '@chakra-ui/react'

import { DownloadIcon } from '@chakra-ui/icons'
import { format } from 'date-fns'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

import { SyncSettings } from '../components/SyncSettings'
import { useDownloadOfflineDictionary } from '../hooks/offline/useDownloadOfflineDictionary'
import { useKeyValueData } from '../hooks/utils/useKeyValueData'
import { useSyncData } from '../hooks/utils/useSyncData'

function Home() {
  const { download, isDBDownloaded, progressText, deleteDictionary } =
    useDownloadOfflineDictionary()
  const [{ data: lastSyncedTime }] = useKeyValueData('lastSyncedTime', 0)
  const [
    { data: offlineDictionaryEnabled },
    { mutate: updateDictionaryEnabledStatus }
  ] = useKeyValueData('offlineDictionaryEnabled', true)
  const { sync, syncEnabled } = useSyncData()

  return (
    <Container>
      <Stack h="full" pt="8">
        <Heading>App Settings</Heading>
        <Stack>
          <Heading size="xl">Sync</Heading>
          <HStack justifyContent="space-between">
            <Stack>
              <Text>Sync Data (Experimental)</Text>
              {lastSyncedTime && (
                <Text>
                  Last updated at :{' '}
                  {format(new Date(lastSyncedTime), 'dd/MM/yyyy HH:mm')} (
                  {formatDistanceToNow(new Date(lastSyncedTime))} ago)
                </Text>
              )}
            </Stack>
            <Button
              isDisabled={!syncEnabled}
              onClick={async () => {
                await sync(new Date(lastSyncedTime ?? 0))
              }}
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
              onClick={async () => {
                await sync(new Date(0))
              }}
            >
              Sync Everything
            </Button>
          </HStack>
          <Divider />
          <Stack>
            <Heading size="lg">Sync Settings</Heading>
            <HStack justifyContent="space-between">
              <Text>Download offline dictionary (Work in progress)</Text>
              {isDBDownloaded ? (
                <Text>Already downloaded</Text>
              ) : (
                <IconButton
                  aria-label="download"
                  icon={<DownloadIcon />}
                  isDisabled={isDBDownloaded}
                  onClick={() => {
                    download()
                  }}
                />
              )}
            </HStack>
            {progressText && <Text>{progressText}</Text>}
            {isDBDownloaded && (
              <>
                <HStack justifyContent="space-between">
                  <Text>Enable Offline Dictionary</Text>
                  <Switch
                    isChecked={offlineDictionaryEnabled}
                    onChange={(e) => {
                      updateDictionaryEnabledStatus(e.target.checked)
                    }}
                  />
                </HStack>
                <HStack justifyContent="space-between">
                  <Text>Delete Offline Dictionary</Text>
                  <Button
                    colorScheme="red"
                    onClick={() => {
                      deleteDictionary()
                    }}
                  >
                    Delete
                  </Button>
                </HStack>
              </>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Container>
  )
}

export default Home
