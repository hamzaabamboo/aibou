import {
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  Container,
  Grid,
  GridItem,
  HStack,
  Heading,
  Input,
  Stack,
  Text
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { toHiragana } from 'wanakana'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { KanjiInfo } from '../../components/kanken/KanjiInfo'
import {
  KankenQuestion,
  type PracticeQuestion
} from '../../components/kanken/KankenQuestion'
import kankenData from '../../constant/kanken-data.json'
import { useOfflineDictionaryContext } from '../../hooks/contexts/useOfflineDictionaryContext'
import { useKeyValueData } from '../../hooks/utils/useKeyValueData'
import { type JishoWord } from '../../types/jisho'
import { type KanjiData } from '../../types/kanji'
import {
  type KankenData,
  type KankenGrade,
  type KankenKanjiData,
  type KankenWordData,
  type KankenYojijukugoData
} from '../../types/kanken'
import { getGradeLabel } from '../../utils/kanken/getGradeLabel'
import { parseKanjiSQLResult } from '../../utils/kanken/parseKanjiSQLresult'
import { getKanjiInfoSQL } from '../../utils/sql/getKanjiInfoSQL'

const KankenPractice = () => {
  const data = kankenData as KankenData
  const grades = Object.keys(kankenData) as KankenGrade[]
  const [{ data: type, isLoading: typeLoading }, { mutate: setType }] =
    useKeyValueData<'word' | 'kanji' | 'yojijukugo'>(
      'kanken-practice-type',
      'word'
    )
  const [{ data: mode, isLoading: modeLoading }, { mutate: setMode }] =
    useKeyValueData<'reading' | 'writing'>('kanken-practice-mode', 'writing')
  const [
    { data: selectedGrade, isLoading: gradeLoading },
    { mutate: setSelectGrade }
  ] = useKeyValueData<KankenGrade[]>('kanken-practice-selected-grade', [
    '3',
    '4',
    '5',
    '6',
    '7'
  ])
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion>()
  const [questionData, setQuestionData] = useState<JishoWord>()
  const [showAnswer, setShowAnswer] = useState(false)
  const [answer, setAnswer] = useState('')
  const [answerExplanations, setAnswerExplanations] = useState<KanjiData[]>()
  const { worker, runSQL } = useOfflineDictionaryContext()

  const allWords = useMemo(() => {
    if (type === 'word') {
      return selectedGrade?.flatMap(
        (grade) =>
          data[grade]?.kanji?.flatMap((k) =>
            k.examples?.map((data) => ({ grade, kanji: k.kanji, data }))
          ) ?? []
      ) as Array<PracticeQuestion<KankenWordData>>
    } else if (type === 'yojijukugo') {
      return selectedGrade?.flatMap(
        (grade) =>
          data[grade]?.yojijukugo?.flatMap((data) => ({ grade, data })) ?? []
      ) as Array<PracticeQuestion<KankenYojijukugoData>>
    }
    return selectedGrade?.flatMap(
      (grade) =>
        data[grade]?.kanji?.flatMap((k) => ({
          grade,
          kanji: k.kanji,
          data: k
        })) ?? []
    ) as Array<PracticeQuestion<KankenKanjiData>>
  }, [selectedGrade, type])

  const answerKey =
    mode === 'reading'
      ? type === 'kanji'
        ? (currentQuestion?.data as KankenKanjiData)?.onyomi?.split(', ').concat((currentQuestion?.data as KankenKanjiData)?.kunyomi?.split(', ').map(i => i.split('.')[0]) ?? []) ?? []
        : [(currentQuestion?.data as KankenWordData)?.reading]
      : type === 'kanji'
        ? [currentQuestion?.kanji]
        : [(currentQuestion?.data as KankenWordData)?.word]
  const win = !!currentQuestion && answerKey.map(t => toHiragana(t ?? '').replace(/\(.*?\)/, '')).includes(toHiragana(answer))
  const giveUp = !!currentQuestion && !answerKey.map(t => toHiragana(t ?? '')).includes(answer) && showAnswer
  const ended = win || giveUp

  console.log(currentQuestion, answerKey, answer)

  const fetchKanjiMeanings = async () => {
    if (type === 'word' || type === 'yojijukugo') {
      const data = currentQuestion?.data as
        | KankenWordData
        | KankenYojijukugoData
      const letters = data.word?.split('') ?? []
      const r = []
      for (const letter of letters) {
        const res = await runSQL?.({
          query: getKanjiInfoSQL(),
          variables: { $searchTerm: letter }
        })
        r.push(...(res?.map(parseKanjiSQLResult) ?? []))
      }
      setAnswerExplanations(r)
    } else {
      const res = await runSQL?.({
        query: getKanjiInfoSQL(),
        variables: { $searchTerm: currentQuestion?.kanji }
      })
      setAnswerExplanations(res?.map(parseKanjiSQLResult))
    }
  }

  const getQuestion = async () => {
    setAnswerExplanations(undefined)
    setShowAnswer(false)
    setAnswer('')
    const prompt = allWords?.[Math.round(Math.random() * allWords?.length)]

    if (type === 'word' || type === 'yojijukugo') {
      const p = prompt as PracticeQuestion<
      KankenWordData | KankenYojijukugoData
      >
      const searchResults: any[] = await new Promise((resolve) => {
        if (!worker) return
        worker.postMessage({
          type: 'searchWords',
          data: [p?.data.word]
        })
        worker.onmessage = ({ data }) => {
          data.type === 'searchWordsResult' && resolve(data.data)
        }
      })
      setQuestionData(searchResults[0].results[0])
    }
    setCurrentQuestion(prompt)
  }

  useEffect(() => {
    getQuestion()
  }, [allWords, mode])

  useEffect(() => {
    fetchKanjiMeanings()
  }, [currentQuestion])

  if (typeLoading || modeLoading || gradeLoading) {
    return <LoadingSpinner />
  }

  return (
    <>
      <Container maxWidth="80vw">
        <Stack w="full" alignItems="center">
          <HStack mt="8">
            <Heading>漢検 Try Hard Practice</Heading>
          </HStack>
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
            <HStack w="full" spacing={4} justifyContent="center" my="4">
              {grades.sort().map((grade) => (
                <Checkbox key={grade} value={grade}>
                  {getGradeLabel(grade)}
                </Checkbox>
              ))}
              <Text>Total: {allWords?.length ?? 0} Items</Text>
            </HStack>
          </CheckboxGroup>
          <KankenQuestion
            type={type}
            mode={mode}
            currentQuestion={currentQuestion}
            questionData={questionData}
            answerExplanations={answerExplanations}
            showAnswer={ended || showAnswer}
          />
          <Input
            value={(ended ? answerKey.join(', ') : answer) ?? ''}
            onChange={(e) => {
              setAnswer(e.target.value)
            }}
            isDisabled={ended}
            color={win ? 'green' : giveUp ? 'red' : undefined}
            w="full"
            textAlign="center"
            fontSize="2em"
          />
          <HStack>
            <Button
              onClick={() => {
                getQuestion()
              }}
            >
              New Question
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                setShowAnswer(true)
              }}
            >
              Show Answer
            </Button>
          </HStack>
          {ended && type !== 'kanji' && answerExplanations && (
            <Grid
              templateColumns={['repeat(2, 1fr)', null, 'repeat(4, 1fr)']}
              gap={6}
            >
              {answerExplanations.map((item) => (
                <GridItem key={item.kanji}>
                  <KanjiInfo data={item} />
                </GridItem>
              ))}
            </Grid>
          )}
        </Stack>
      </Container>
    </>
  )
}

export default KankenPractice
