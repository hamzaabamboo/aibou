import {
  ArrowBackIcon,
  ArrowDownIcon,
  ArrowForwardIcon,
  ArrowUpIcon
} from '@chakra-ui/icons'
import { Button, HStack, Heading, Input, Spinner, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { SearchResultItem } from '../../components/jisho/SearchResultItem'
import { WordInfoModal } from '../../components/jisho/WordInfoModal'
import { useOfflineDictionaryContext } from '../../hooks/contexts/useOfflineDictionaryContext'
import { type JishoWord } from '../../types/jisho'
import { type TopicItem } from '../../types/topic'
import { getKanjiCrossPrompt } from '../../utils/sql/getKanjiCrossPrompt'

export const KanjiCross = () => {
  const { runSQL, worker } = useOfflineDictionaryContext()
  const [prompt, setPrompt] = useState<string[][] | undefined>()
  const [answer, setAnswer] = useState('')
  const [wordData, setWordData] = useState<Array<Partial<TopicItem>>>()
  const [isShowHint, setShowHint] = useState(false)
  const [isShowAnswer, setShowAnswer] = useState(false)
  const [selectedWord, setSelectedWord] = useState<JishoWord | undefined>()

  const win = !!prompt && answer === prompt[0][0]
  const giveUp = !!prompt && answer !== prompt[0][0] && isShowAnswer
  const showAnswer = !!prompt && (answer === prompt[0][0] || isShowAnswer)
  const ended = win || giveUp

  const getPrompt = async () => {
    if (!runSQL) return
    const p = await runSQL({
      query: getKanjiCrossPrompt(),
      variables: {}
    })
    setPrompt((p as any[])[0].values)
  }

  const getHintData = async () => {
    const words = prompt?.map((p) => p[1]) ?? []
    const searchResults: any[] = await new Promise((resolve) => {
      if (!worker) return
      worker.postMessage({
        type: 'searchWords',
        data: words
      })
      worker.onmessage = ({ data }) => {
        data.type === 'searchWordsResult' && resolve(data.data)
      }
    })
    const res = searchResults.map((result: any, i) => {
      return {
        word: words[i],
        jishoData: result.results.find((m: JishoWord) =>
          m.japanese.some((w) => w.word === words[i] || w.reading === words[i])
        )
      }
    })
    setWordData(res)
    setShowHint(true)
  }

  useEffect(() => {
    getPrompt()
  }, [runSQL])

  useEffect(() => {
    if (prompt === undefined) {
      setAnswer('')
      setWordData(undefined)
      setShowHint(false)
      setShowAnswer(false)
    }
  }, [prompt])

  useEffect(() => {
    if (ended && !wordData) {
      getHintData()
    }
  }, [ended, wordData])

  const getNotPrompt = (s: string[]) => (s[1][0] === s[0] ? s[1][1] : s[1][0])
  const isInOrder = (s: string[]) => s[0] !== s[1][0]

  const getNewWord = () => {
    setPrompt(undefined)
    getPrompt()
  }

  if (!prompt) {
    return (
      <Stack mt={10} alignItems="center" w="full" h="full">
        <Spinner size="xl"/>
        <Text>Loading...</Text>
      </Stack>
    )
  }

  return (
    <>
      <Stack mt={10} alignItems="center" w="full" px={4}>
        <Heading>Kanji Cross Game !</Heading>
        <Stack justifyContent="center" alignItems="center">
          <Kanji character={getNotPrompt(prompt[0])} />
          <Arrow reverse={isInOrder(prompt[0])} />
          <HStack>
            <Kanji character={getNotPrompt(prompt[1])} />
            <Arrow reverse={!isInOrder(prompt[1])} direction="row" />
            <Input
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value)
              }}
              isDisabled={ended}
              color={win ? 'green' : giveUp ? 'red' : undefined}
              boxSize={20}
              maxLength={1}
              fontSize="3em"
            />
            <Arrow reverse={isInOrder(prompt[2])} direction="row" />
            <Kanji character={getNotPrompt(prompt[2])} />
          </HStack>
          <Arrow reverse={!isInOrder(prompt[3])} />
          <Kanji character={getNotPrompt(prompt[3])} />
        </Stack>
        <HStack>
          <Button
            onClick={() => {
              getNewWord()
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
            onClick={() => {
              getHintData()
            }}
          >
            Show Hint
          </Button>
        </HStack>
        {win && <Text>You Win!</Text>}
        {giveUp && <Text verticalAlign="middle"> The Answer is <Text as="span" fontSize="3em">{prompt[0][0]}</Text></Text>}
        {(isShowHint || giveUp) && wordData && (
          <Stack alignItems="stretch">
            {wordData.map(data => {
              if (showAnswer) {
                return data
              }
              if (!data.jishoData) return data
              return {
                ...data,
                jishoData: {
                  ...data.jishoData,
                  japanese: [{ ...data.jishoData.japanese[0], word: data.jishoData.japanese[0].word.replace(prompt[0][0], '＿') }]
                }
              }
            }).map(
              (w) =>
                w.jishoData && (
                  <SearchResultItem
                    onClick={() => {
                      showAnswer && setSelectedWord(w.jishoData)
                    }}
                    item={w.jishoData}
                    key={w.word}
                    hideFurigana={!showAnswer}
                    hideAlternatives={!showAnswer}
                  />
                )
            )}
          </Stack>
        )}
      </Stack>
      {selectedWord != null && (
        <WordInfoModal
          isOpen={!!selectedWord}
          item={{
            topicId: '',
            word:
              selectedWord.japanese[0].word ?? selectedWord.japanese[0].reading,
            jishoData: selectedWord,
            createdAt: new Date(),
            lastUpdatedAt: new Date()
          }}
          onClose={() => {
            setSelectedWord(undefined)
          }}
          isAddable
        />
      )}
    </>
  )
}

const Kanji = ({ character }: { character: string }) => {
  return <Text fontSize="3em">{character}</Text>
}

const Arrow = ({
  direction,
  reverse
}: {
  direction?: 'row'
  reverse: boolean
}) => {
  if (direction === 'row') {
    if (reverse) return <ArrowBackIcon boxSize={10} />
    return <ArrowForwardIcon boxSize={10} />
  }
  if (reverse) return <ArrowDownIcon boxSize={10} />
  return <ArrowUpIcon boxSize={10} />
}

export default KanjiCross
