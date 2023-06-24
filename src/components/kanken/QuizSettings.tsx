import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  HStack,
  Stack
} from '@chakra-ui/react'
import kankenData from '../../constant/kanken-data.json'
import { useKeyValueData } from '../../hooks/utils/useKeyValueData'
import { type KankenGrade } from '../../types/kanken'
import { getGradeLabel } from '../../utils/kanken/getGradeLabel'

export const QuizSettings = (props: { total?: number }) => {
  const { total = 0 } = props
  const grades = Object.keys(kankenData) as KankenGrade[]
  const [{ data: type }, { mutate: setType }] =
    useKeyValueData<'word' | 'kanji' | 'yojijukugo'>(
      'kanken-practice-type',
      'word'
    )
  const [{ data: mode }, { mutate: setMode }] =
    useKeyValueData<'reading' | 'writing'>('kanken-practice-mode', 'writing')
  const [
    { data: selectedGrade },
    { mutate: setSelectGrade }
  ] = useKeyValueData<KankenGrade[]>('kanken-practice-selected-grade', [
    '3',
    '4',
    '5',
    '6',
    '7'
  ])

  return (
    <Accordion w="full" allowMultiple>
      <AccordionItem>
        <AccordionButton textAlign="center">
          Quiz Settings: {mode} / {type} / {grades.map(getGradeLabel).join(',')} / Total: {total} Items
        </AccordionButton>
        <AccordionPanel>
          <Stack alignItems="center">
            <ButtonGroup variant="outline" isAttached>
              <Button
                variant={type === 'word' ? 'solid' : 'outline'}
                colorScheme={type === 'word' ? 'green' : undefined}
                onClick={() => {
                  setType('word')
                }}
              >
                Word
              </Button>
              <Button
                variant={type === 'kanji' ? 'solid' : 'outline'}
                colorScheme={type === 'kanji' ? 'green' : undefined}
                onClick={() => {
                  setType('kanji')
                }}
              >
                Kanji
              </Button>
              <Button
                variant={type === 'yojijukugo' ? 'solid' : 'outline'}
                colorScheme={type === 'yojijukugo' ? 'green' : undefined}
                onClick={() => {
                  setType('yojijukugo')
                }}
              >
                Yojijukugo
              </Button>
            </ButtonGroup>
            <ButtonGroup variant="outline" isAttached>
              <Button
                variant={mode === 'writing' ? 'solid' : 'outline'}
                colorScheme={mode === 'writing' ? 'green' : undefined}
                onClick={() => {
                  setMode('writing')
                }}
              >
                Writing
              </Button>
              <Button
                variant={mode === 'reading' ? 'solid' : 'outline'}
                colorScheme={mode === 'reading' ? 'green' : undefined}
                onClick={() => {
                  setMode('reading')
                }}
              >
                Reading
              </Button>
            </ButtonGroup>
            <CheckboxGroup
              value={selectedGrade}
              onChange={(grades) => {
                setSelectGrade(grades as KankenGrade[])
              }}
            >
              <HStack w="full" spacing={4} justifyContent="center" my="4" flexWrap="wrap">
                {grades.sort().map((grade) => (
                  <Checkbox key={grade} value={grade}>
                    {getGradeLabel(grade)}
                  </Checkbox>
                ))}
              </HStack>
            </CheckboxGroup>
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
