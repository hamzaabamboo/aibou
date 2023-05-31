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
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { Search } from '../components/jisho/Search'
import { WordInfoModal } from '../components/jisho/WordInfoModal'
import { useLastUpdatedTopics } from '../hooks/useLastUpdatedTopics'
import { useSyncData } from '../hooks/utils/useSyncData'
import { type JishoWord } from '../types/jisho'

const Home: NextPage = () => {
  const [selectedWord, setSelectedWord] = useState<JishoWord | undefined>()
  const { data: lastUpdatedTopics, refetch } = useLastUpdatedTopics()
  const { syncEnabled, sync, lastSyncedTime } = useSyncData()

  useEffect(() => {
    refetch()
  }, [])

  return (
    <>
      <Container>
        <Stack justifyContent="center" alignItems="center" h="full" pt="8">
          <Heading>相棒/ Aibou</Heading>
          <Text>Japanese-language learning companion</Text>
          <Search onSelectItem={setSelectedWord} />
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
      {(selectedWord != null) && (
        <WordInfoModal
          isOpen={!!selectedWord}
          item={{
            topicId: '',
            word:
              selectedWord.japanese[0].word ?? selectedWord.japanese[0].reading,
            jishoData: selectedWord,
            createdAt: new Date(),
            lastUpdatedAt: new Date()
          }}
          onClose={() => { setSelectedWord(undefined) }}
          isAddable
        />
      )}
    </>
  )
}

export default Home
