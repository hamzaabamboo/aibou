import { type } from 'os'
import { ArrowBackIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Grid,
  GridItem,
  HStack,
  Heading,
  Stack
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { isKana, isRomaji, toHiragana } from 'wanakana'
import { BigTextInput } from '../../../components/common/BigTextInput'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { KanjiDisplay } from '../../../components/jisho/KanjiDisplay'
import { SearchResultItem } from '../../../components/jisho/SearchResultItem'
import { KanjiInfo } from '../../../components/kanken/KanjiInfo'
import { PracticeStats } from '../../../components/kanken/PracticeStats'
import { useOfflineDictionaryContext } from '../../../hooks/contexts/useOfflineDictionaryContext'
import { useGetTopic } from '../../../hooks/topic/useGetTopic'
import { useGetTopicItems } from '../../../hooks/useGetTopicItems'
import { useQuizState } from '../../../hooks/useQuizState'
import { useKeyValueData } from '../../../hooks/utils/useKeyValueData'
import { type JishoWord } from '../../../types/jisho'
import { type KanjiData } from '../../../types/kanji'
import { type TopicItem } from '../../../types/topic'
import { parseKanjiSQLResult } from '../../../utils/kanken/parseKanjiSQLresult'
import { getKanjiInfoSQL } from '../../../utils/sql/getKanjiInfoSQL'

const KankenPractice = () => {
  const answerInputRef = useRef<HTMLInputElement>(null)
  const questionBoxRef = useRef<HTMLDivElement>(null)
  const [{ data: mode, isLoading: modeLoading }, { mutate: setMode }] =
    useKeyValueData<'reading' | 'writing'>('quiz-practice-mode', 'writing')
  const { query, push } = useRouter()
  const topicId = query.id as string

  const [questionData, setQuestionData] = useState<JishoWord>()
  const [answerExplanations, setAnswerExplanations] = useState<KanjiData[]>()
  const { runSQL, searchTerms } = useOfflineDictionaryContext()

  const {
    data: topic,
    refetch,
    isLoading: isLoadingTopic
  } = useGetTopic(topicId)
  const { data: words, isLoading: isLoadingItems } = useGetTopicItems(topicId)

  const allWords = words

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
  } = useQuizState<TopicItem, string>({
    quizId: `topic-quiz-${topicId}-${type}`,
    getNewQuestion: async () => {
      setAnswerExplanations(undefined)
      const prompt =
        allWords?.[Math.round(Math.random() * (allWords?.length - 1))]
      const searchResults = (await searchTerms?.([prompt?.word ?? ''])) ?? []
      setQuestionData(searchResults[0].results[0])
      setTimeout(() => {
        answerInputRef.current?.focus()
        questionBoxRef.current?.scrollIntoView()
      }, 0)
      return prompt as TopicItem
    },
    getAnswers: (question) =>
      mode === 'reading'
        ? question.jishoData?.japanese.map((e) => e.reading) ?? []
        : [
            question.word,
            ...(question?.jishoData?.japanese.map((e) => e.word) ?? []).filter(
              (e) => !!e && e !== question.word
            )
          ],
    checkAnswer: (answers, answer) => {
      return answers
        .map(
          (t) =>
            toHiragana(t ?? '')
              .replace(/（.*?）/, '')
              .split('.')[0]
        )
        .includes(toHiragana(answer))
    },
    defaultAnswer: ''
  })

  const fetchKanjiMeanings = async () => {
    const data = currentQuestion?.word ?? ''
    const letters =
      data.split('').filter((e) => !(isKana(e) || isRomaji(e))) ?? []
    const r = []
    for (const letter of letters) {
      const res = await runSQL?.({
        query: getKanjiInfoSQL(),
        variables: { $searchTerm: letter }
      })
      r.push(...(res?.map(parseKanjiSQLResult) ?? []))
    }
    setAnswerExplanations(r)
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

  if (modeLoading) {
    return <LoadingSpinner />
  }

  return (
    <>
      <Container maxWidth={['full', null, '80vw']}>
        <Box>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            onClick={async () => await push('/topics')}
          >
            Back to Topic
          </Button>
        </Box>
        <Stack w="full" alignItems="center">
          <HStack mt="8">
            <Heading>{topic?.name} Practice</Heading>
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
            {quizData && (
              <PracticeStats
                getQuestionString={(q) => {
                  return q.word
                }}
                quizData={quizData}
                onResetCounter={resetStats}
              />
            )}
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
          <Stack ref={questionBoxRef} alignItems="center">
            {currentQuestion && (
              <KanjiDisplay
                data={{
                  reading:
                    !(ended || showAnswer) && mode === 'reading'
                      ? ''
                      : currentQuestion?.jishoData?.japanese[0].reading,
                  word:
                    ended || showAnswer || mode === 'reading'
                      ? currentQuestion.word ??
                        currentQuestion?.jishoData?.japanese[0].reading
                      : currentQuestion.word?.replaceAll(/./g, '＿')
                }}
              />
            )}
            {(questionData ?? currentQuestion?.jishoData) && (
              <SearchResultItem
                isCard={false}
                item={{
                  ...(questionData ??
                    (currentQuestion?.jishoData as JishoWord)),
                  japanese: []
                }}
              />
            )}
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
      </Container>
    </>
  )
}

export default KankenPractice
