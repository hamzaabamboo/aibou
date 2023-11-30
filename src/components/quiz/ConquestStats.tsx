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

import { QuestionModel } from 'utils/QuestionModel'

import { usePopupSearchContext } from '../../hooks/contexts/usePopupSearchContext'
import { QuizQuestion } from '../../types/quizData'

export function ConquestStats({
  data,
  questions,
  onResetCounter
}: {
  data: QuestionModel<QuizQuestion>
  questions: QuizQuestion[]
  onResetCounter?: () => void
}) {
  const { openSearchModal } = usePopupSearchContext()
  const remaining = data.remaining()
  const total = data.size()
  const percentage = Math.round((remaining * 100) / total)

  const learningQuestions = data.learning().map((l) => l.question)
  const learnedQuestions = questions.filter(
    (q) => !learningQuestions.includes(q.question)
  )

  return (
    <Accordion w="full" allowMultiple>
      <AccordionItem>
        <AccordionButton textAlign="center">
          Conquest Data: {remaining} / {total} remaining ({percentage}%)
        </AccordionButton>
        <AccordionPanel>
          <Stack>
            <Heading size="sm">Words Learning</Heading>
            <HStack w="full" flexWrap="wrap">
              {learningQuestions.map((q, idx) => (
                <Text
                  key={idx}
                  onClick={() => {
                    openSearchModal?.(q)
                  }}
                >
                  {q}
                </Text>
              ))}
            </HStack>
            <Heading size="sm">Learned</Heading>
            <HStack w="full" flexWrap="wrap">
              {learnedQuestions.map((q, idx) => (
                <Text
                  key={idx}
                  onClick={() => {
                    openSearchModal?.(q.question)
                  }}
                >
                  {q.question}
                </Text>
              ))}
            </HStack>
            {/* <Heading size="md">Recent Incorrect</Heading> */}
            <Button
              width="fit-content"
              onClick={onResetCounter ?? (() => {})}
              colorScheme="red"
              disabled
            >
              Reset Counter
            </Button>
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
