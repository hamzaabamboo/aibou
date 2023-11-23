import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Button,
  Heading,
  HStack,
  Stack,
  Text
} from '@chakra-ui/react'

import { usePopupSearchContext } from '../../hooks/contexts/usePopupSearchContext'
import { type QuizData } from '../../types/quizData'

export function PracticeStats<T>({
  quizData,
  onResetCounter,
  getQuestionString
}: {
  quizData: QuizData<T>
  getQuestionString: (question: T) => string
  onResetCounter?: () => void
}) {
  const { openSearchModal } = usePopupSearchContext()
  const total = quizData.stats.correct + quizData.stats.skipped
  const percentage = Math.round((quizData.stats.correct * 100) / total)

  return (
    <Accordion w="full" allowMultiple>
      <AccordionItem>
        <AccordionButton textAlign="center">
          Stats: {total} Total / {quizData.stats.correct} Correct ({percentage}
          %) / {quizData.stats.skipped} Skipped
        </AccordionButton>
        <AccordionPanel>
          <Stack>
            <Heading size="md">Recent Questions</Heading>
            <HStack w="full" flexWrap="wrap">
              {quizData.recentQuestions.map((q, idx) => (
                <Text
                  key={idx}
                  onClick={() => {
                    openSearchModal?.(getQuestionString(q.question))
                  }}
                >
                  {getQuestionString(q.question)}
                </Text>
              ))}
            </HStack>
            <Heading size="md">Recent Incorrect</Heading>
            <HStack w="full" flexWrap="wrap">
              {quizData.recentIncorrect.map((q, idx) => (
                <Text
                  key={idx}
                  onClick={() => {
                    openSearchModal?.(getQuestionString(q.question))
                  }}
                >
                  {getQuestionString(q.question)}
                </Text>
              ))}
            </HStack>
            <Button
              width="fit-content"
              onClick={onResetCounter ?? (() => {})}
              colorScheme="red"
            >
              Reset Counter
            </Button>
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
