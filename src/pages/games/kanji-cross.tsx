import {
  Button,
  Container,
  Heading,
  HStack,
  Input,
  Stack,
  Text
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'

import {
  ArrowBackIcon,
  ArrowDownIcon,
  ArrowForwardIcon,
  ArrowUpIcon
} from '@chakra-ui/icons'

import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { SearchResultItem } from '../../components/jisho/SearchResultItem'
import { useOfflineDictionaryContext } from '../../hooks/contexts/useOfflineDictionaryContext'
import { usePopupSearchContext } from '../../hooks/contexts/usePopupSearchContext'
import { useQuizState } from '../../hooks/useQuizState'
import { type JishoWord } from '../../types/jisho'
import { type TopicItem } from '../../types/topic'
import { getKanjiCrossPrompt } from '../../utils/sql/getKanjiCrossPrompt'

function Kanji({ character }: { character: string }) {
  return <Text fontSize="3em">{character}</Text>
}

function Arrow({
  direction,
  reverse
}: {
  direction?: 'row'
  reverse: boolean
}) {
  if (direction === 'row') {
    if (reverse) return <ArrowBackIcon boxSize={10} />
    return <ArrowForwardIcon boxSize={10} />
  }
  if (reverse) return <ArrowDownIcon boxSize={10} />
  return <ArrowUpIcon boxSize={10} />
}

export default KanjiCross

export function KanjiCross() {
  const { runSQL, worker } = useOfflineDictionaryContext()
  const { showWordInfo } = usePopupSearchContext()
  const [wordData, setWordData] = useState<Array<Partial<TopicItem>>>()
  const [isShowHint, setShowHint] = useState(false)

  const {
    currentQuestion,
    answer,
    setAnswer,
    win,
    giveUp,
    showAnswer,
    ended,
    setShowAnswer,
    nextQuestion
  } = useQuizState<string[][], string>({
    quizId: 'kanji-cross',
    getNewQuestion: async () => {
      const p = await runSQL?.({
        query: getKanjiCrossPrompt(),
        variables: {}
      })
      setShowHint(false)
      setWordData(undefined)
      return (p as any[])[0].values
    },
    getAnswers: (question) => [question[0][0]],
    defaultAnswer: ''
  })

  const getHintData = async () => {
    const words = currentQuestion?.map((p) => p[1]) ?? []
    const searchResults: any[] = await new Promise((resolve) => {
      if (!worker) return
      worker.postMessage({
        type: 'searchWords',
        data: words
      })
      worker.onmessage = ({ data }) => {
        if (data.type === 'searchWordsResult') resolve(data.data)
      }
    })
    const res = searchResults.map((result: any, i) => ({
      word: words[i],
      jishoData: result.results.find((m: JishoWord) =>
        m.japanese.some((w) => w.word === words[i] || w.reading === words[i])
      )
    }))
    setWordData(res)
    setShowHint(true)
  }

  useEffect(() => {
    nextQuestion()
  }, [runSQL])

  useEffect(() => {
    if (ended && !wordData) {
      getHintData()
    }
  }, [ended, wordData])

  const getNotPrompt = (s: string[]) => (s[1][0] === s[0] ? s[1][1] : s[1][0])
  const isInOrder = (s: string[]) => s[0] !== s[1][0]

  const color = (() => {
    if (win) return 'green'
    if (giveUp) return 'red'
    return undefined
  })()

  if (!currentQuestion) {
    return <LoadingSpinner />
  }

  return (
    <Container>
      <Stack mt={10} alignItems="center" w="full" px={4}>
        <Heading>Kanji Cross Game !</Heading>
        <Stack justifyContent="center" alignItems="center">
          <Kanji character={getNotPrompt(currentQuestion[0])} />
          <Arrow reverse={isInOrder(currentQuestion[0])} />
          <HStack>
            <Kanji character={getNotPrompt(currentQuestion[1])} />
            <Arrow reverse={!isInOrder(currentQuestion[1])} direction="row" />
            <Input
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value)
              }}
              isDisabled={ended}
              color={color}
              boxSize={20}
              maxLength={1}
              fontSize="3em"
            />
            <Arrow reverse={isInOrder(currentQuestion[2])} direction="row" />
            <Kanji character={getNotPrompt(currentQuestion[2])} />
          </HStack>
          <Arrow reverse={!isInOrder(currentQuestion[3])} />
          <Kanji character={getNotPrompt(currentQuestion[3])} />
        </Stack>
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
            onClick={() => {
              setShowAnswer(true)
            }}
          >
            View Answer
          </Button>
          <Button
            colorScheme="yellow"
            disabled={isShowHint}
            onClick={() => {
              getHintData()
            }}
          >
            Show Hint
          </Button>
        </HStack>
        {win && <Text>You Win!</Text>}
        {giveUp && (
          <Text verticalAlign="middle">
            {' '}
            The Answer is{' '}
            <Text as="span" fontSize="3em">
              {currentQuestion[0][0]}
            </Text>
          </Text>
        )}
        {(isShowHint || giveUp) && wordData && (
          <Stack alignItems="stretch">
            {wordData
              .map((data) => {
                if (ended) {
                  return data
                }
                if (!data.jishoData) return data
                return {
                  ...data,
                  jishoData: {
                    ...data.jishoData,
                    japanese: [
                      {
                        ...data.jishoData.japanese[0],
                        word: data.jishoData.japanese[0].word.replace(
                          currentQuestion[0][0],
                          '＿'
                        )
                      }
                    ]
                  }
                }
              })
              .map(
                (w) =>
                  w.jishoData && (
                    <SearchResultItem
                      onClick={() => {
                        if (showAnswer && w.jishoData)
                          showWordInfo?.(w.jishoData)
                      }}
                      item={w.jishoData}
                      key={w.word}
                      hideFurigana={!ended}
                      hideAlternatives={!ended}
                    />
                  )
              )}
          </Stack>
        )}
      </Stack>
    </Container>
  )
}
