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
  onResetCounter
}: {
  data: QuestionModel<QuizQuestion>
  onResetCounter?: () => void
}) {
  const { openSearchModal } = usePopupSearchContext()
  const total = data.size()
  // const percentage = Math.round((quizData.stats.correct * 100) / total)

  return (
    <Accordion w="full" allowMultiple>
      <AccordionItem>
        <AccordionButton textAlign="center">
          Conquest Data: ({total} remaining)
          {/* Stats: {total} Total / {quizData.stats.correct} Correct ({percentage}
          %) / {quizData.stats.skipped} Skipped */}
        </AccordionButton>
        <AccordionPanel>
          <Stack>
            <Heading size="sm">Words Learning</Heading>
            <HStack w="full" flexWrap="wrap">
              {data.learning().map((q, idx) => (
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
