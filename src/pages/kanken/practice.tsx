import { Container, Heading, HStack, Stack } from '@chakra-ui/react'
import { useMemo } from 'react'

import { LoadingSpinner } from 'components/common/LoadingSpinner'
import { PracticeQuestion } from 'components/kanken/KankenQuestion'
import { QuizSettings } from 'components/kanken/QuizSettings'
import { Quiz } from 'components/quiz/Quiz'
import kankenData from 'constant/kanken-data.json'
import { useKeyValueData } from 'hooks/utils/useKeyValueData'
import {
  KankenData,
  KankenGrade,
  KankenKanjiData,
  KankenWordData,
  KankenYojijukugoData
} from 'types/kanken'

function KankenPractice() {
  const data = kankenData as KankenData
  const [{ data: type, isPending: typeLoading }] = useKeyValueData<
    'word' | 'kanji' | 'yojijukugo'
  >('kanken-practice-type', 'word')
  const [{ data: selectedGrade, isPending: gradeLoading }] = useKeyValueData<
    KankenGrade[]
  >('kanken-practice-selected-grade', ['3', '4', '5', '6', '7'])

  const allWords = useMemo(() => {
    if (type === 'word') {
      return selectedGrade
        ?.flatMap(
          (grade) =>
            data[grade]?.kanji?.flatMap((k) =>
              k.examples?.map((exampleWord) => ({
                grade,
                kanji: k.kanji,
                data: exampleWord
              }))
            ) ?? []
        )
        .filter((e) => !!e) as Array<PracticeQuestion<KankenWordData>>
    }
    if (type === 'yojijukugo') {
      return selectedGrade
        ?.flatMap(
          (grade) =>
            data[grade]?.yojijukugo?.flatMap((exampleWord) => ({
              grade,
              data: exampleWord
            })) ?? []
        )
        .filter((e) => !!e) as Array<PracticeQuestion<KankenYojijukugoData>>
    }
    return selectedGrade
      ?.flatMap(
        (grade) =>
          data[grade]?.kanji?.flatMap((k) => ({
            grade,
            kanji: k.kanji,
            data: k
          })) ?? []
      )
      .filter((e) => !!e) as Array<PracticeQuestion<KankenKanjiData>>
  }, [selectedGrade, type])

  if (typeLoading || gradeLoading) {
    return <LoadingSpinner />
  }

  return (
    <Container maxWidth={['full', null, '80vw']}>
      <Stack w="full" alignItems="center">
        <HStack mt="8">
          <Heading>漢検 Try Hard Practice</Heading>
        </HStack>
        <Stack w="full" spacing="0">
          <QuizSettings total={allWords.length} />
        </Stack>
        <Quiz
          quizId={`kanken-practice-${type}`}
          title="Kanken Practice"
          questions={allWords.map((word) => {
            if (type === 'kanji') {
              const w = word.data as KankenKanjiData
              return {
                question: w.kanji ?? '',
                answer: [
                  ...(w.onyomi?.split(',') ?? []),
                  ...(w.kunyomi?.split(',') ?? [])
                ]
              }
            }
            if (type === 'yojijukugo') {
              const w = word.data as KankenYojijukugoData
              return {
                question: w.word,
                answer: [w.reading]
              }
            }
            const w = word.data as KankenWordData
            return {
              question: w.word ?? '',
              answer: [w.reading ?? '']
            }
          })}
        />
      </Stack>
    </Container>
  )
}

export default KankenPractice
