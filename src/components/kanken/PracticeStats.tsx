import { Accordion, AccordionButton, AccordionItem, AccordionPanel, Stack } from '@chakra-ui/react'
import { type QuizData } from '../../types/quizData'

export const PracticeStats = ({ quizData }: { quizData: QuizData }) => {
  const total = quizData.stats.correct + quizData.stats.skipped
  const percentage = Math.round(quizData.stats.correct * 100 / total)
  return (
        <Accordion w="full" allowMultiple>
          <AccordionItem>
            <AccordionButton textAlign="center">
              Stats: {total} Total / {quizData.stats.correct} Correct ({percentage}%) / {quizData.stats.skipped} Skipped
            </AccordionButton>
            <AccordionPanel>
              <Stack alignItems="center">

              </Stack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
  )
}
