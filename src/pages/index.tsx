import {
  Box,
  Container,
  HStack,
  Heading,
  Link,
  Stack,
  Text
} from '@chakra-ui/react'
import format from 'date-fns/format'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import noop from 'lodash/noop'
import type { NextPage } from 'next'
import { useEffect, useRef } from 'react'
import { Search } from '../components/jisho/Search'
import { usePopupSearchContext } from '../hooks/contexts/usePopupSearchContext'
import { useOfflineDictionaryAvailability } from '../hooks/offline/useOfflineDictionaryAvailability'
import { useLastUpdatedTopics } from '../hooks/useLastUpdatedTopics'
import { useSyncData } from '../hooks/utils/useSyncData'

const Home: NextPage = () => {
  const { showWordInfo } = usePopupSearchContext()
  const searchRef = useRef<HTMLInputElement>(null)
  const { data: lastUpdatedTopics, refetch } = useLastUpdatedTopics()
  const { syncEnabled, sync, lastSyncedTime } = useSyncData()
  const { isPending: isLoading, isDictionaryAvailable } = useOfflineDictionaryAvailability()

  useEffect(() => {
    if (!isLoading && isDictionaryAvailable) {
      searchRef?.current?.focus()
    }
  }, [isLoading, isDictionaryAvailable])

  useEffect(() => {
    refetch()
  }, [])

  return (
    <>
      <Container>
        <Stack justifyContent="center" alignItems="center" h="full" pt="8">
          <Heading>相棒/ Aibou</Heading>
          <Text>Japanese-language learning companion</Text>
          <Search ref={searchRef} onSelectItem={showWordInfo ?? noop} />
          {syncEnabled && (
            <HStack>
              <Text>
                Last Synced At:{' '}
                {format(new Date(lastSyncedTime), 'dd/MM/yyyy HH:mm')} (
                {formatDistanceToNow(new Date(lastSyncedTime))} ago)
              </Text>
              <Link onClick={async () => { await sync() }}>
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
    </>
  )
}

export default Home
