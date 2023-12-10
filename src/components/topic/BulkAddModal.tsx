import {
  Button,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Textarea
} from '@chakra-ui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { useDBContext } from 'hooks/contexts/useDBContext'
import { useOfflineDictionaryContext } from 'hooks/contexts/useOfflineDictionaryContext'
import { useUpdateTopicItem } from 'hooks/topic-item/useUpdateTopicItem'
import { nanoid } from 'nanoid'
import { JishoWord } from 'types/jisho'
import { Topic } from 'types/topic'

const useBulkAddItem = () => {
  const queryClient = useQueryClient()
  const { db } = useDBContext()
  const { mutate: editItem } = useUpdateTopicItem()

  return useMutation({
    mutationFn: async (data: {
      words: Array<{ word: string; jishoData: JishoWord }>
      topicId: string
    }) => {
      const { words, topicId } = data
      const idNumber = Number(topicId)
      const existingWords = (
        await db?.topicEntries?.where({ topicId }).toArray()
      )?.map((w) => w.word)
      const wordAlreadyExist = words.filter((w) =>
        existingWords?.includes(w.word)
      )
      const newWords = words.filter((w) => !existingWords?.includes(w.word))
      if (wordAlreadyExist.length > 0) {
        await Promise.all(
          wordAlreadyExist.map(async (word) => {
            const a = (
              await db?.topicEntries?.where({ word, topicId }).toArray()
            )?.[0]
            if (a?.isDeleted) {
              await editItem({ id: a.id, topicId, isDeleted: false })
            }
          })
        )
      }
      try {
        await db?.topicEntries.bulkAdd(
          newWords.map((d) => ({
            ...d,
            id: nanoid(8),
            topicId,
            reading: d.jishoData?.japanese[0]?.reading,
            tags: [],
            createdAt: new Date(),
            lastUpdatedAt: new Date()
          }))
        )
        await db?.topics.update(Number.isNaN(idNumber) ? topicId : idNumber, {
          lastUpdatedAt: new Date()
        })
        return topicId
      } catch (e) {
        console.error('Error adding')
      }
    },
    onSuccess: (topicId) => {
      queryClient.invalidateQueries({ queryKey: ['fetchTopicItems', topicId] })
      queryClient.invalidateQueries({ queryKey: ['fetchLastUpdatedTopics'] })
    }
  })
}

// TODO: Refactor modals
export function BulkAddModal(props: {
  topic: Topic
  isOpen: boolean
  onClose: () => void
  onAddSuccess: () => void
}) {
  const { topic, isOpen, onClose, onAddSuccess } = props
  const { searchTerms } = useOfflineDictionaryContext()
  const [terms, setTerms] = useState('')
  const [searchResults, setSearchResults] = useState<
    Array<{ word: string; results: JishoWord[] }>
  >([])
  const { mutate: bulkAddItems, isPending: isLoading } = useBulkAddItem()

  const onSearchTerms = async () => {
    if (!searchTerms) return
    const results = await searchTerms(terms.split('\n'))
    setSearchResults(results)
  }

  const onAddTerms = async () => {
    if (!topic.id) return
    await bulkAddItems({
      words: searchResults
        .filter((s) => !!s.results[0])
        .map((s) => ({ word: s.word, jishoData: s.results[0] })),
      topicId: topic.id
    })
    onAddSuccess()
  }

  const wordsFound = useMemo(
    () => searchResults.filter((s) => s.results.length > 0).length,
    [searchResults]
  )

  console.log(wordsFound)
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      size="lg"
    >
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(10px) hue-rotate(90deg)"
      />
      <ModalContent>
        <ModalHeader>
          <Heading>Add Multiple Items</Heading>
        </ModalHeader>
        <ModalBody>
          <Stack>
            <Text>Please separate by Space</Text>
            <Textarea
              value={terms}
              onChange={(e) => {
                setTerms(e.target.value)
              }}
            />
            <Button
              isDisabled={isLoading}
              onClick={() => {
                onSearchTerms()
              }}
            >
              Search Terms
            </Button>
            {searchResults.length > 0 && (
              <Stack>
                <Text>
                  Search results found for {wordsFound} word(s) (
                  {searchResults.length - wordsFound} missing)
                </Text>
                <Button
                  colorScheme="green"
                  isDisabled={isLoading}
                  onClick={() => {
                    onAddTerms()
                  }}
                >
                  Add Terms
                </Button>
              </Stack>
            )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button
              isDisabled={isLoading}
              onClick={() => {
                onClose()
              }}
            >
              Close
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
