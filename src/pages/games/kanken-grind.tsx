import { Box, Container, Divider, Grid, GridItem, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { toKatakana } from 'wanakana'
import kankenData from '../../constant/kanken-data.json'

const getGradeLabel = (grade: string) => {
  switch (grade) {
    case '2-5': return '準2級'
    default: return grade + '級'
  }
}
const KankenGrind = () => {
  // const data = kankenData
  const grades = Object.keys(kankenData) as Array<keyof typeof kankenData>
  const [selectedGrade, setSelectGrade] = useState<keyof typeof kankenData>(grades[0])
  return <Container maxWidth="80vw">
    <Stack w="full" alignItems="center">
    <HStack mt="8">
        <Heading>漢検 Try Hard</Heading>
    </HStack>
    <HStack w="full" justifyContent="space-between" my="4">
        {grades.sort().map(grade => <Text key={grade} fontSize="xl" fontWeight={grade === selectedGrade ? 'bold' : 'normal'} onClick={() => { setSelectGrade(grade) }}>{getGradeLabel(grade)}</Text>)}
    </HStack>
    <Divider/>
    {selectedGrade && <Grid templateColumns={['repeat(5, 1fr)', 'repeat(8, 1fr)', 'repeat(10, 1fr)']} gap={6}>{kankenData[selectedGrade].kanji.map((k, idx) => {
      return (<GridItem key={idx}><KanjiItem data={k}/></GridItem>)
    })}</Grid>}
  </Stack>
  </Container>
}

const KanjiItem = ({ data }: { data: { onyomi?: string, kunyomi?: string, kanji?: string } }) => {
  const { onyomi, kunyomi, kanji } = data
  return <Stack alignItems="center" spacing="sm" h="full">
        <Box flex="1" h="full" textAlign="center">
        <Text>{toKatakana(onyomi)}</Text>
        <Text >{kunyomi}</Text>
        </Box>
        <Text fontSize="5xl" fontWeight="400">{kanji}</Text>
    </Stack>
}

export default KankenGrind
