import { Heading, HStack, Stack, Text } from '@chakra-ui/react'
import { type KanjiData } from '../../types/kanji'

export const KanjiInfo = (props: { data: KanjiData }) => {
  const { data } = props
  return <Stack>
                 <HStack justifyContent="center">
                <Text fontSize="5xl">{data.kanji}</Text>
              </HStack>
    <Heading size="sm">Readings</Heading>
    {data?.onyomi && (
      <Text>Onyomi: {data.onyomi.replaceAll(',', ', ')}</Text>
    )}
    {data?.kunyomi && (
      <Text>
        Kunyomi: {data.kunyomi.replaceAll(',', ', ')}
      </Text>
    )}
    <Heading size="sm">Meanings</Heading>
    {data?.meanings &&
      data.meanings.map((m, idx) => (
        <Text key={idx}>{m.replaceAll(',', ', ')}</Text>
      ))}
    <Heading size="sm">Other info</Heading>
    {data?.radicals && (
      <Text>Parts: {data.radicals.replaceAll(',', ', ')}</Text>
    )}
      {data?.radicalName && (
      <Text>Radical: {data.radicalName}</Text>
      )}
    {data?.strokeCounts && (
      <Text>Stroke Counts: {data.strokeCounts}</Text>
    )}
    {data?.jlptLevel && (
      <Text>JLPT Level: N{data.jlptLevel}</Text>
    )}
    {data?.grade && (
      <Text>Grade: Grade {data.grade}</Text>
    )}
  </Stack>
}
