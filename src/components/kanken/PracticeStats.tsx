import { Accordion, AccordionButton, AccordionItem, AccordionPanel, Button, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { type QuizData } from '../../types/quizData'
import { type PracticeQuestion } from './KankenQuestion'

export const PracticeStats = ({ quizData, onResetCounter }: { quizData: QuizData<PracticeQuestion>, onResetCounter?: () => void }) => {
  const total = quizData.stats.correct + quizData.stats.skipped
  const percentage = Math.round(quizData.stats.correct * 100 / total)

  const getQuestion = (q: PracticeQuestion) => {
    if (!q.data) return
    if ('kanji' in q.data) return q.data.kanji
    if ('word' in q.data) return q.data.word
  }
  return (
        <Accordion w="full" allowMultiple>
          <AccordionItem>
            <AccordionButton textAlign="center">
              Stats: {total} Total / {quizData.stats.correct} Correct ({percentage}%) / {quizData.stats.skipped} Skipped
            </AccordionButton>
            <AccordionPanel>
           <Stack>
           <Heading size="md">Recent Questions</Heading>
              <HStack w="full" flexWrap="wrap">
                {quizData.recentQuestions.map((q, idx) => <Text key={idx}>{getQuestion(q.question)}</Text>)}
              </HStack>
              <Heading size="md">Recent Incorrect</Heading>
              <HStack w="full" flexWrap="wrap">
                {quizData.recentIncorrect.map((q, idx) => <Text key={idx}>{getQuestion(q.question)}</Text>)}
              </HStack>
              <Button width="fit-content" onClick={onResetCounter ?? (() => {})} colorScheme='red'>Reset Counter</Button>
           </Stack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
  )
}
