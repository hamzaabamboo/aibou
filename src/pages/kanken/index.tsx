import {
  Box,
  Container,
  Divider,
  Grid,
  GridItem,
  Heading,
  HStack,
  Link,
  Stack,
  Text
} from '@chakra-ui/react'
import { useState } from 'react'

import { toKatakana } from 'wanakana'

import { GradePicker } from '../../components/kanken/GradePicker'
import { KanjiInfoModal } from '../../components/kanken/KanjiInfoModal'
import kankenData from '../../constant/kanken-data.json'
import {
  type KankenData,
  type KankenGrade,
  type KankenKanjiData
} from '../../types/kanken'

function KanjiItem({
  data
}: {
  data: { onyomi?: string; kunyomi?: string; kanji?: string }
}) {
  const { onyomi, kunyomi, kanji } = data
  return (
    <Stack alignItems="center" spacing="sm" h="full">
      <Box flex="1" h="full" textAlign="center">
        {onyomi && <Text>{toKatakana(onyomi)}</Text>}
        {kunyomi && <Text>{kunyomi}</Text>}
      </Box>
      <Text fontSize="5xl" fontWeight="400" fontFamily="serif">
        {kanji}
      </Text>
    </Stack>
  )
}

function KankenGrind() {
  // const data = kankenData
  const grades = Object.keys(kankenData) as KankenGrade[]
  const [selectedGrade, setSelectGrade] = useState<KankenGrade>(grades[0])
  const [selectedKanji, setSelectedKanji] = useState<KankenKanjiData>()
  const kanjis =
    (kankenData as unknown as KankenData)[selectedGrade].kanji ?? []
  const { length } = kanjis
  return (
    <>
      <Container maxWidth={['full', null, '80vw']}>
        <Stack w="full" alignItems="center">
          <HStack mt="8">
            <Heading>漢検 Try Hard</Heading>
          </HStack>
          <Link href="/kanken/practice">Practice</Link>
          <GradePicker
            grades={grades}
            selectedGrade={selectedGrade}
            onSelectGrade={setSelectGrade}
          />
          <Divider />
          <Text my={4}>計{length}字</Text>
          {selectedGrade && (
            <Grid
              templateColumns={[
                'repeat(4, 1fr)',
                'repeat(5, 1fr)',
                'repeat(8, 1fr)',
                'repeat(10, 1fr)'
              ]}
              gap={6}
            >
              {kanjis.map((k, idx) => (
                <GridItem
                  key={idx}
                  shadow="md"
                  rounded="md"
                  onClick={() => {
                    setSelectedKanji(k)
                  }}
                >
                  <KanjiItem data={k} />
                </GridItem>
              ))}
            </Grid>
          )}
        </Stack>
      </Container>
      {selectedKanji && (
        <KanjiInfoModal
          data={selectedKanji}
          isOpen={!!selectedKanji}
          onClose={() => {
            setSelectedKanji(undefined)
          }}
        />
      )}
    </>
  )
}

export default KankenGrind
