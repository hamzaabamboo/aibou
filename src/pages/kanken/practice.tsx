import {
  Button,
  Container,
  Grid,
  GridItem,
  HStack,
  Heading,
  Stack
} from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toHiragana, toKatakana } from 'wanakana'
import { BigTextInput } from '../../components/common/BigTextInput'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { KanjiInfo } from '../../components/kanken/KanjiInfo'
import {
  KankenQuestion,
  type PracticeQuestion
} from '../../components/kanken/KankenQuestion'
import { PracticeStats } from '../../components/kanken/PracticeStats'
import { QuizSettings } from '../../components/kanken/QuizSettings'
import kankenData from '../../constant/kanken-data.json'
import { useOfflineDictionaryContext } from '../../hooks/contexts/useOfflineDictionaryContext'
import { useQuizState } from '../../hooks/useQuizState'
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
import { parseKanjiSQLResult } from '../../utils/kanken/parseKanjiSQLresult'
import { getKanjiInfoSQL } from '../../utils/sql/getKanjiInfoSQL'

const KankenPractice = () => {
  const answerInputRef = useRef<HTMLInputElement>(null)
  const questionBoxRef = useRef<HTMLDivElement>(null)
  const data = kankenData as KankenData
  const [{ data: type, isLoading: typeLoading }] =
    useKeyValueData<'word' | 'kanji' | 'yojijukugo'>(
      'kanken-practice-type',
      'word'
    )
  const [{ data: mode, isLoading: modeLoading }] =
    useKeyValueData<'reading' | 'writing'>('kanken-practice-mode', 'writing')
  const [
    { data: selectedGrade, isLoading: gradeLoading }
  ] = useKeyValueData<KankenGrade[]>('kanken-practice-selected-grade', [
    '3',
    '4',
    '5',
    '6',
    '7'
  ])

  const [questionData, setQuestionData] = useState<JishoWord>()
  const [answerExplanations, setAnswerExplanations] = useState<KanjiData[]>()
  const { worker, runSQL, searchTerms } = useOfflineDictionaryContext()

  const allWords = useMemo(() => {
    if (type === 'word') {
      return selectedGrade?.flatMap(
        (grade) =>
          data[grade]?.kanji?.flatMap((k) =>
            k.examples?.map((data) => ({ grade, kanji: k.kanji, data }))
          ) ?? []
      ).filter(e => !!e) as Array<PracticeQuestion<KankenWordData>>
    } else if (type === 'yojijukugo') {
      return selectedGrade?.flatMap(
        (grade) =>
          data[grade]?.yojijukugo?.flatMap((data) => ({ grade, data })) ?? []
      ).filter(e => !!e) as Array<PracticeQuestion<KankenYojijukugoData>>
    }
    return selectedGrade?.flatMap(
      (grade) =>
        data[grade]?.kanji?.flatMap((k) => ({
          grade,
          kanji: k.kanji,
          data: k
        })) ?? []
    ).filter(e => !!e) as Array<PracticeQuestion<KankenKanjiData>>
  }, [selectedGrade, type])

  const {
    currentQuestion,
    answerKey,
    answer,
    setAnswer,
    ended,
    showAnswer,
    setShowAnswer,
    win,
    giveUp,
    nextQuestion,
    resetQuestion,
    quizData,
    resetStats
  } = useQuizState<PracticeQuestion, string>({
    quizId: `kanken-practice-${type}-${mode}`,
    getNewQuestion: async () => {
      setAnswerExplanations(undefined)
      const prompt = allWords?.[Math.round(Math.random() * (allWords?.length - 1))]
      if ('word' in prompt.data) {
        const searchResults = await searchTerms?.([prompt.data.word ?? '']) ?? []
        setQuestionData(searchResults[0].results[0])
      } else {
        await fetchKanjiMeanings(prompt?.kanji)
      }
      setTimeout(() => {
        answerInputRef.current?.focus()
        questionBoxRef.current?.scrollIntoView()
      }, 0)
      return prompt
    },
    getAnswers: (question) => {
      const answers = mode === 'reading'
        ? type === 'kanji'
          ? (question.data as KankenKanjiData)?.onyomi?.split(', ').map(l => toKatakana(l)).concat((question.data as KankenKanjiData)?.kunyomi?.split(', ') ?? []) ?? []
          : [(question.data as KankenWordData)?.reading]
        : type === 'kanji'
          ? [question.kanji]
          : [(question.data as KankenWordData)?.word]
      return answers.filter(a => !!a) as string[]
    },
    checkAnswer: (answers, answer) => {
      return answers.map(t => toHiragana(t ?? '').replace(/（.*?）/, '').split('.')[0]).includes(toHiragana(answer))
    },
    defaultAnswer: ''
  })

  const fetchKanjiMeanings = async (word?: string) => {
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
        variables: { $searchTerm: word ?? currentQuestion?.kanji }
      })
      setAnswerExplanations(res?.map(parseKanjiSQLResult))
    }
  }

  useEffect(() => {
    if (!allWords) return
    resetQuestion()
    void nextQuestion(false)
  }, [allWords, mode])

  useEffect(() => {
    if (ended && !answerExplanations) {
      void fetchKanjiMeanings()
    }
  }, [ended])

  useEffect(() => {
    const handleKeystroke = (event: KeyboardEvent) => {
      // Next question
      if (event.key === 'Enter' && ended) {
        void nextQuestion()
        event.stopPropagation()
      }
    }
    window.addEventListener('keypress', handleKeystroke)
    return () => {
      window.removeEventListener('keypress', handleKeystroke)
    }
  }, [ended])

  if (typeLoading || modeLoading || gradeLoading) {
    return <LoadingSpinner />
  }

  return (
    <>
      <Container maxWidth={['full', null, '80vw']}>
        <Stack w="full" alignItems="center">
          <HStack mt="8">
            <Heading>漢検 Try Hard Practice</Heading>
          </HStack>
          <Stack w="full" spacing="0">
            <QuizSettings total={allWords.length}/>
            {quizData && <PracticeStats getQuestionString={(q) => {
              if (!q.data) return '-'
              if ('kanji' in q.data) return q.data.kanji ?? '-'
              if ('word' in q.data) return q.data.word ?? '-'
              return '-'
            }}
            quizData={quizData} onResetCounter={resetStats}/>}
          </Stack>
          <BigTextInput
          ref={answerInputRef}
            value={(ended ? answerKey.join(', ') : answer) ?? ''}
            onChange={(e) => {
              setAnswer(e.target.value)
            }}
            isDisabled={ended}
            color={win ? 'green' : giveUp ? 'red' : undefined}
            w="full"
            textAlign="center"
          />
          <HStack>
            <Button
              onClick={() => {
                void nextQuestion()
              }}
            >
              New Question
            </Button>
            <Button
              colorScheme="red"
              disabled={ended}
              onClick={() => {
                setShowAnswer(true)
              }}
            >
              Show Answer
            </Button>
          </HStack>
          <KankenQuestion
            ref={questionBoxRef}
            type={type}
            mode={mode}
            currentQuestion={currentQuestion}
            questionData={questionData}
            answerExplanations={answerExplanations}
            showAnswer={ended || showAnswer}
          />
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
