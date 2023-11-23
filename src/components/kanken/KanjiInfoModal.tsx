import {
  Button,
  Heading,
  HStack,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'

import { ExternalLinkIcon } from '@chakra-ui/icons'

import { useOfflineDictionaryContext } from '../../hooks/contexts/useOfflineDictionaryContext'
import { type KanjiData } from '../../types/kanji'
import { type KankenKanjiData } from '../../types/kanken'
import { parseKanjiSQLResult } from '../../utils/kanken/parseKanjiSQLresult'
import { getKanjiInfoSQL } from '../../utils/sql/getKanjiInfoSQL'
import { KanjiInfo } from './KanjiInfo'

export function KanjiInfoModal(props: {
  data: KankenKanjiData
  isOpen: boolean
  onClose: () => void
}) {
  const { isOpen, onClose, data } = props
  const [kanjiData, setKanjiData] = useState<KanjiData>()
  const { runSQL } = useOfflineDictionaryContext()

  useEffect(() => {
    if (!data) return
    runSQL?.({
      query: getKanjiInfoSQL(),
      variables: { $searchTerm: data.kanji }
    }).then((res) => {
      setKanjiData(parseKanjiSQLResult(res[0]))
    })
  }, [data])

  if (!data?.kanji) return null

  return (
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
            {kanjiData && <KanjiInfo data={kanjiData} />}
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
  )
}
