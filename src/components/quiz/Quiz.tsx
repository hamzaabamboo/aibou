import {
  Button,
  ButtonGroup,
  Grid,
  GridItem,
  Heading,
  HStack,
  Stack,
  Switch
} from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'

import { BigTextInput } from 'components/common/BigTextInput'
import { LoadingSpinner } from 'components/common/LoadingSpinner'
import { KanjiDisplay } from 'components/jisho/KanjiDisplay'
import { SearchResultItem } from 'components/jisho/SearchResultItem'
import { KanjiInfo } from 'components/kanken/KanjiInfo'
import { PracticeStats } from 'components/kanken/PracticeStats'
import { useOfflineDictionaryContext } from 'hooks/contexts/useOfflineDictionaryContext'
import { useQuizState } from 'hooks/quiz/useQuizState'
import { useGetSearchMultiple } from 'hooks/search/useGetSearchMultiple'
import { useLocalStorage } from 'hooks/useLocalStorage'
import { useKeyValueData } from 'hooks/utils/useKeyValueData'
import { isEqual, uniq, uniqWith } from 'lodash'
import { JishoWord } from 'types/jisho'
import { KanjiData } from 'types/kanji'
import { parseKanjiSQLResult } from 'utils/kanken/parseKanjiSQLresult'
import { getKanjiInfoSQL } from 'utils/sql/getKanjiInfoSQL'
import { isKana, isRomaji, toHiragana } from 'wanakana'

interface QuizQuestion {
  question: string
  answer?: string
  data?: JishoWord
}

export function Quiz({
  title,
  questions,
  quizId
}: {
  title: string
  questions: QuizQuestion[]
  quizId: string
}) {
  const answerInputRef = useRef<HTMLInputElement>(null)
  const questionBoxRef = useRef<HTMLDivElement>(null)
  const [{ data: mode, isPending: modeLoading }, { mutate: setMode }] =
    useKeyValueData<'reading' | 'writing'>('quiz-practice-mode', 'writing')

  const [questionData, setQuestionData] = useState<JishoWord>()
  const [answerExplanations, setAnswerExplanations] = useState<KanjiData[]>()
  const [showMeaning, setShowMeaning] = useLocalStorage<boolean>(
    'quiz-show-meaning',
    false
  )
  const { runSQL } = useOfflineDictionaryContext()
  const searchTerms = useGetSearchMultiple()

  const allWords = questions

  const getQuestionData = async (question: string): Promise<JishoWord> => {
    const results = (await searchTerms?.([question]))?.[0].results ?? []
    return {
      ...results[0],
      japanese: uniqWith(
        results.flatMap((w) => w.japanese),
        isEqual
      ),
      senses: uniqWith(
        results.flatMap((w) => w.senses),
        isEqual
      )
    }
  }

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
  } = useQuizState<QuizQuestion, string>({
    quizId: `${quizId}-${mode}`,
    getNewQuestion: async () => {
      setAnswerExplanations(undefined)
      const prompt =
        allWords?.[Math.round(Math.random() * ((allWords?.length ?? 1) - 1))]
      const data = prompt.data
        ? prompt.data
        : await getQuestionData(prompt.question ?? '')
      setQuestionData(data)
      setTimeout(() => {
        answerInputRef.current?.focus()
        questionBoxRef.current?.scrollIntoView()
      }, 0)
      return { ...prompt, data } as QuizQuestion
    },
    getAnswers: (question) =>
      uniq(
        mode === 'reading'
          ? question.data?.japanese.map((e) => e.reading) ?? []
          : [
              question.question,
              ...(question?.data?.japanese.map((e) => e.word) ?? []).filter(
                (e) => !!e && e !== question.question
              )
            ]
      ),
    checkAnswer: (answers, answerToCheck) =>
      answers
        .map(
          (t) =>
            toHiragana(t ?? '')
              .replace(/（.*?）/, '')
              .split('.')[0]
        )
        .includes(toHiragana(answerToCheck)),
    defaultAnswer: ''
  })

  const fetchKanjiMeanings = async () => {
    const data = currentQuestion?.question ?? ''
    const letters =
      data.split('').filter((e) => !(isKana(e) || isRomaji(e))) ?? []
    const r: KanjiData[] = []
    await Promise.all(
      letters.map(async (letter) => {
        const res = await runSQL?.({
          query: getKanjiInfoSQL(),
          variables: { $searchTerm: letter }
        })
        r.push(...(res?.map(parseKanjiSQLResult) ?? []))
      })
    )
    setAnswerExplanations(r)
  }

  useEffect(() => {
    if (!allWords) return
    resetQuestion()
    nextQuestion(false)
  }, [allWords, mode])

  useEffect(() => {
    if (ended && !answerExplanations) {
      fetchKanjiMeanings()
    }
  }, [ended])

  useEffect(() => {
    const handleKeystroke = (event: KeyboardEvent) => {
      // Next question
      if (event.key === 'Enter' && ended) {
        nextQuestion()
        event.stopPropagation()
      }
    }
    window.addEventListener('keypress', handleKeystroke)
    return () => {
      window.removeEventListener('keypress', handleKeystroke)
    }
  }, [ended])

  const color = (() => {
    if (win) return 'green'
    if (giveUp) return 'red'
    return undefined
  })()

  if (modeLoading) {
    return <LoadingSpinner />
  }

  return (
    <Stack w="full" alignItems="center">
      <HStack mt="8">
        <Heading>{title}</Heading>
      </HStack>
      <Stack w="full" alignItems="center">
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
      </Stack>
      <Stack ref={questionBoxRef} alignItems="center" width="full">
        {currentQuestion && (
          <KanjiDisplay
            isVeryBig
            data={{
              reading:
                !(ended || showAnswer) && mode === 'reading'
                  ? ''
                  : currentQuestion?.data?.japanese[0].reading,
              word:
                ended || showAnswer || mode === 'reading'
                  ? currentQuestion.question ??
                    currentQuestion?.data?.japanese[0].reading
                  : currentQuestion.question?.replaceAll(/./g, '＿')
            }}
          />
        )}
        <BigTextInput
          ref={answerInputRef}
          value={(ended ? answerKey.join(', ') : answer) ?? ''}
          onChange={(e) => {
            setAnswer(e.target.value)
          }}
          isDisabled={ended}
          color={color}
          w="full"
          textAlign="center"
        />
      </Stack>
      <Switch
        checked={showMeaning ?? false}
        onChange={(e) => {
          setShowMeaning(e.target.checked)
        }}
      >
        Show Meaning
      </Switch>
      {(questionData ?? currentQuestion?.data) && (
        <SearchResultItem
          isCard={false}
          showMeaning={
            ((ended && !!answerExplanations) || showMeaning) ?? false
          }
          item={{
            ...(questionData ?? (currentQuestion?.data as JishoWord)),
            japanese: []
          }}
        />
      )}
      <HStack>
        <Button
          onClick={() => {
            nextQuestion()
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
      {quizData && (
        <PracticeStats
          getQuestionString={(q) => q.question}
          quizData={quizData}
          onResetCounter={resetStats}
        />
      )}
      {ended && answerExplanations && (
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
  )
}
