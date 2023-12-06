import {
  Button,
  ButtonGroup,
  Grid,
  GridItem,
  Heading,
  HStack,
  Stack,
  Switch,
  Text
} from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'

import { BigTextInput } from 'components/common/BigTextInput'
import { LoadingSpinner } from 'components/common/LoadingSpinner'
import { KanjiDisplay } from 'components/jisho/KanjiDisplay'
import { SearchResultItem } from 'components/jisho/SearchResultItem'
import { KanjiInfo } from 'components/kanken/KanjiInfo'
import { PracticeStats } from 'components/kanken/PracticeStats'
import { useOfflineDictionaryContext } from 'hooks/contexts/useOfflineDictionaryContext'
import { useConquestData } from 'hooks/quiz/useConquestData'
import { useQuizState } from 'hooks/quiz/useQuizState'
import { useGetSearchMultiple } from 'hooks/search/useGetSearchMultiple'
import { useLocalStorage } from 'hooks/useLocalStorage'
import { useKeyValueData } from 'hooks/utils/useKeyValueData'
import { isEqual, uniq, uniqWith } from 'lodash'
import { JishoWord } from 'types/jisho'
import { KanjiData } from 'types/kanji'
import { QuizQuestion } from 'types/quizData'
import { parseKanjiSQLResult } from 'utils/kanken/parseKanjiSQLresult'
import { QuestionModel } from 'utils/QuestionModel'
import { getKanjiInfoSQL } from 'utils/sql/getKanjiInfoSQL'
import { isKana, isRomaji, toHiragana } from 'wanakana'

import { ConquestStats } from './ConquestStats'

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
    useKeyValueData<'reading' | 'writing'>('quiz-practice-mode', 'reading')
  const [
    { data: questionMode, isLoading: isLoadingQuestionMode },
    { mutate: setQuestionMode }
  ] = useKeyValueData<'normal' | 'conquest' | 'random'>(
    `${quizId}-shuffle-mode`,
    'normal'
  )

  const [questionData, setQuestionData] = useState<JishoWord>()
  const [answerExplanations, setAnswerExplanations] = useState<KanjiData[]>()
  const [showMeaning, setShowMeaning] = useLocalStorage<boolean>(
    'quiz-show-meaning',
    false
  )
  const { runSQL } = useOfflineDictionaryContext()
  const searchTerms = useGetSearchMultiple()
  const [
    { data: conquestData, isLoading: loadingSaveData },
    { mutate: saveConquestData }
  ] = useConquestData<QuizQuestion>(
    mode && questionMode ? `${quizId}-${mode}-${questionMode}` : ''
  )

  const [questionsManager, setQuestionManager] = useState(
    new QuestionModel<QuizQuestion>([], questionMode)
  )

  const wordDataCache = useRef<Record<string, JishoWord>>({})

  const fetchQuestionData = async (
    question: string
  ): Promise<JishoWord | undefined> => {
    const results = (await searchTerms?.([question]))?.[0].results
    if (!results || results.length === 0) return undefined
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

  const getQuestionData = async (
    question: string
  ): Promise<JishoWord | undefined> => {
    if (question in wordDataCache.current) {
      return wordDataCache.current[question]
    }
    return fetchQuestionData(question)
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
    skipQuestion,
    resetQuestion,
    quizData,
    resetStats
  } = useQuizState<QuizQuestion, string>({
    quizId: mode ? `${quizId}-${mode}` : ``,
    getNewQuestion: async () => {
      if (!questionsManager || questionsManager.remaining() === 0)
        return undefined
      setAnswerExplanations(undefined)
      const prompt = questionsManager.currentQuestion()
      const data = prompt.data
        ? prompt.data
        : await getQuestionData(prompt.question ?? '')
      if (!data) {
        return { ...prompt }
      }
      setQuestionData(data)
      try {
        const upcoming = questionsManager.upcomingQuestion().question
        fetchQuestionData(upcoming).then((res) => {
          if (res) wordDataCache.current[upcoming] = res
        })
      } catch {
        // Do nothing
      }
      setTimeout(() => {
        answerInputRef.current?.focus()
        questionBoxRef.current?.scrollIntoView()
      }, 0)
      return { ...prompt, data } as QuizQuestion
    },
    getAnswers: (question) =>
      uniq(
        mode === 'reading'
          ? question.answer ??
              question.data?.japanese.map((e) => e.reading) ??
              []
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
    onCorrectAnswer: () => {
      questionsManager.correctAnswer()
    },
    onWrongAnswer: () => {
      questionsManager.wrongAnswer()
    },
    defaultAnswer: ''
  })

  const fetchKanjiMeanings = async () => {
    const data = currentQuestion?.question ?? ''
    const letters =
      data.split('').filter((e) => !(isKana(e) || isRomaji(e))) ?? []
    const r: KanjiData[] = []
    try {
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
    } catch {
      // Do nothing
    }
  }

  const handleResetConquest = () => {
    setQuestionManager(
      new QuestionModel(
        questions,
        questionMode,
        undefined,
        (queue, learned) => {
          saveConquestData({
            queue,
            learned
          })
        }
      )
    )
    wordDataCache.current = {}
    resetQuestion()
  }

  useEffect(() => {
    if (
      isLoadingQuestionMode ||
      loadingSaveData ||
      !questionMode ||
      !conquestData?.queue
    )
      return

    setQuestionManager(
      new QuestionModel(
        questions,
        questionMode,
        conquestData,
        (queue, learned) => {
          saveConquestData({ queue, learned })
        }
      )
    )
    wordDataCache.current = {}
  }, [
    questions,
    questionMode,
    isLoadingQuestionMode,
    conquestData,
    saveConquestData,
    loadingSaveData
  ])

  useEffect(() => {
    if (
      loadingSaveData ||
      isLoadingQuestionMode ||
      !questionsManager ||
      questionsManager.remaining() === 0 ||
      !!currentQuestion ||
      !searchTerms
    )
      return
    nextQuestion(false)
  }, [
    questionsManager,
    mode,
    loadingSaveData,
    isLoadingQuestionMode,
    currentQuestion,
    searchTerms
  ])

  useEffect(() => {
    if (ended && !answerExplanations) {
      fetchKanjiMeanings()
    }
    const handleKeystroke = (event: KeyboardEvent) => {
      // Next question
      if (event.key === 'Enter' && ended) {
        nextQuestion()
        event.stopPropagation()
      } else if (event.key === ';' && event.ctrlKey) {
        setShowAnswer(true)
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

  if (modeLoading || loadingSaveData) {
    return <LoadingSpinner />
  }

  return (
    <Stack w="full" alignItems="center">
      <Stack mt="8" alignItems="center">
        <Heading>{title}</Heading>
        <Text>
          {questionsManager.remaining()}{' '}
          {questionMode === 'conquest' ? 'remaining' : 'items'}{' '}
        </Text>
      </Stack>
      <Stack ref={questionBoxRef} alignItems="center" width="full">
        {currentQuestion && (
          <KanjiDisplay
            isVeryBig
            data={{
              reading:
                !(ended || showAnswer) && mode === 'reading'
                  ? ''
                  : currentQuestion.answer?.[0] ??
                    currentQuestion?.data?.japanese[0].reading,
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
        <HStack>
          <Button
            onClick={() => {
              skipQuestion()
            }}
          >
            Skip
          </Button>
          <Button
            colorScheme={ended ? 'green' : 'red'}
            onClick={() => {
              if (ended) {
                nextQuestion()
              } else {
                setShowAnswer(true)
              }
            }}
          >
            {ended ? 'Next Question' : 'Give Up'}
          </Button>
        </HStack>
      </Stack>
      {(questionData ?? currentQuestion?.data) && (
        <SearchResultItem
          isCard={false}
          showMeaning={(ended || showMeaning) ?? false}
          item={{
            ...(questionData ?? (currentQuestion?.data as JishoWord)),
            japanese: []
          }}
        />
      )}
      {quizData && (
        <PracticeStats
          getQuestionString={(q) => q.question}
          quizData={quizData}
          onResetCounter={resetStats}
        />
      )}
      <ConquestStats
        data={questionsManager}
        questions={questions}
        onResetConquest={handleResetConquest}
      />
      <Stack w="full" alignItems="center">
        <HStack>
          <ButtonGroup variant="outline" isAttached>
            <Button
              variant={mode === 'reading' ? 'solid' : 'outline'}
              colorScheme={mode === 'reading' ? 'green' : undefined}
              onClick={() => {
                setMode('reading')
              }}
            >
              Reading
            </Button>
            <Button
              variant={mode === 'writing' ? 'solid' : 'outline'}
              colorScheme={mode === 'writing' ? 'green' : undefined}
              onClick={() => {
                setMode('writing')
              }}
            >
              Writing
            </Button>
          </ButtonGroup>
          <Switch
            checked={showMeaning ?? undefined}
            onChange={(e) => {
              setShowMeaning(e.target.checked)
            }}
          >
            Show Meaning
          </Switch>
        </HStack>
        <ButtonGroup variant="outline" isAttached>
          <Button
            variant={questionMode === 'normal' ? 'solid' : 'outline'}
            colorScheme={questionMode === 'normal' ? 'green' : undefined}
            onClick={() => {
              setQuestionMode('normal')
            }}
          >
            Progressive
          </Button>
          <Button
            variant={questionMode === 'random' ? 'solid' : 'outline'}
            colorScheme={questionMode === 'random' ? 'green' : undefined}
            onClick={() => {
              setQuestionMode('random')
            }}
          >
            Random
          </Button>
          <Button
            variant={questionMode === 'conquest' ? 'solid' : 'outline'}
            colorScheme={questionMode === 'conquest' ? 'green' : undefined}
            onClick={() => {
              setQuestionMode('conquest')
            }}
          >
            Conquest
          </Button>
        </ButtonGroup>
      </Stack>
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
