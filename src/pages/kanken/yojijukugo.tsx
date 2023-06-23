import { Container, Divider, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import kankenData from '../../constant/kanken-data.json'
import { getGradeLabel } from '../../utils/kanken/getGradeLabel'

const KankenYojijukugo = () => {
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
  </Stack>
  </Container>
}

export default KankenYojijukugo
