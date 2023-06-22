import { ExternalLinkIcon } from '@chakra-ui/icons'
import {
  Button,
  HStack,
  Heading,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text
} from '@chakra-ui/react'
import { groupBy } from 'lodash'
import { useEffect, useState } from 'react'
import { useOfflineDictionaryContext } from '../../hooks/contexts/useOfflineDictionaryContext'
import { type KankenKanjiData } from '../../types/kanken'
import { getKanjiInfoSQL } from '../../utils/sql/getKanjiInfoSQL'

interface KanjiData {
  onyomi: string
  kunyomi: string
  radicals: string
  meanings: string[]
  jlptLevel: string
  grade: string
  radicalName: string
  frequency: string
  strokeCounts: string
}

export function KanjiInfoModal (props: {
  data: KankenKanjiData
  isOpen: boolean
  onClose: () => void
}) {
  const { isOpen, onClose, data } = props
  const [kanjiData, setKanjiData] = useState<KanjiData>()
  const { runSQL } = useOfflineDictionaryContext()

  useEffect(() => {
    if (!data) return
    void runSQL?.({
      query: getKanjiInfoSQL(),
      variables: { $searchTerm: data.kanji }
    }).then((res) => {
      const results =
        res[0].values.map((r) => {
          const [
            ,
            type,
            readings,
            id,
            meanings,
            radicals,
            jlptLevel,
            grade,
            radicalName,
            frequency,
            strokeCounts
          ] = r
          return {
            type,
            readings,
            id,
            radicals,
            meanings,
            jlptLevel,
            grade,
            radicalName,
            frequency,
            strokeCounts
          }
        }) ?? []
      const { jlptLevel, grade, radicals, radicalName, frequency, strokeCounts } =
        results[0]
      setKanjiData({
        onyomi: results.find((r) => r.type === 'ja_on')?.readings,
        kunyomi: results.find((r) => r.type === 'ja_kun')?.readings,
        meanings: Object.values(groupBy(results, 'id')).map(
          (i) => i[0].meanings
        ),
        jlptLevel,
        grade,
        radicals,
        radicalName,
        frequency,
        strokeCounts
      })
    })
  }, [data])

  if (!data?.kanji) return <></>

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setKanjiData(undefined)
          onClose()
        }}
      >
        <ModalOverlay
          bg="blackAlpha.300"
          // backdropFilter="blur(10px) hue-rotate(90deg)"
        />
        <ModalContent>
          <ModalHeader>
            <Heading>Kanji Info</Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack>
              <HStack justifyContent="center">
                <Text fontSize="5xl">{data.kanji}</Text>
              </HStack>
              <Stack>
                <Heading size="sm">Readings</Heading>
                {kanjiData?.onyomi && (
                  <Text>Onyomi: {kanjiData.onyomi.replaceAll(',', ', ')}</Text>
                )}
                {kanjiData?.kunyomi && (
                  <Text>
                    Kunyomi: {kanjiData.kunyomi.replaceAll(',', ', ')}
                  </Text>
                )}
                <Heading size="sm">Meanings</Heading>
                {kanjiData?.meanings &&
                  kanjiData.meanings.map((m, idx) => (
                    <Text key={idx}>{m.replaceAll(',', ', ')}</Text>
                  ))}
                <Heading size="sm">Other info</Heading>
                {kanjiData?.radicals && (
                  <Text>Parts: {kanjiData.radicals.replaceAll(',', ', ')}</Text>
                )}
                  {kanjiData?.radicalName && (
                  <Text>Radical: {kanjiData.radicalName}</Text>
                  )}
                {kanjiData?.strokeCounts && (
                  <Text>Stroke Counts: {kanjiData.strokeCounts}</Text>
                )}
                {kanjiData?.jlptLevel && (
                  <Text>JLPT Level: N{kanjiData.jlptLevel}</Text>
                )}
                {kanjiData?.grade && (
                  <Text>Grade: Grade {kanjiData.grade}</Text>
                )}

              </Stack>
              <Stack>
                <Heading size="md">Search On</Heading>
                <Link
                  href={`https://www.google.com/search?q=${encodeURIComponent(
                    data.kanji
                  )}`}
                  isExternal
                >
                  Google
                  <ExternalLinkIcon mx="2px" />
                </Link>
                <Link
                  href={`https://jisho.org/search/${encodeURIComponent(
                    data.kanji
                  )}`}
                  isExternal
                >
                  Jisho
                  <ExternalLinkIcon mx="2px" />
                </Link>
                <Link
                  href={`https://kotobank.jp/gs/?q=${encodeURIComponent(
                    data.kanji
                  )}`}
                  isExternal
                >
                  Kotobank
                  <ExternalLinkIcon mx="2px" />
                </Link>
                <Link
                  href={`https://kanji.jitenon.jp/cat/search.php?getdata=${data.kanji
                    .split('')
                    .map((s) => s.charCodeAt(0).toString(16))
                    .join('_')}&search=contain&how=${encodeURIComponent(
                    'すべて'
                  )}`}
                  isExternal
                >
                  Kanji Jiten Online
                  <ExternalLinkIcon mx="2px" />
                </Link>
              </Stack>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <HStack w="full" justifyContent="space-between">
              <Button onClick={onClose}>Close</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
