import { ArrowBackIcon, ArrowDownIcon, ArrowForwardIcon, ArrowUpIcon } from '@chakra-ui/icons'
import { Button, HStack, Heading, Input, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useOfflineDictionaryContext } from '../../hooks/contexts/useOfflineDictionaryContext'

export const KanjiCross = () => {
  const { worker } = useOfflineDictionaryContext()
  const [prompt, setPrompt] = useState()
  const [answer, setAnswer] = useState('')

  const getPrompt = async () => {
    const p = await new Promise((resolve) => {
      if (!worker) return
      worker.postMessage({
        type: 'generateCrossPrompt'
      })
      worker.onmessage = ({ data }) => { data.type === 'generateCrossPromptResult' && resolve(data.data) }
    })
    setPrompt((p as any[])[0].values)
  }
  useEffect(() => {
    getPrompt()
  }, [worker])

  const getNotPrompt = (s: string[]) => s[1][0] === s[0] ? s[1][1] : s[1][0]
  const isInOrder = (s: string[]) => s[0] !== s[1][0]

  const getNewWord = () => {
    setPrompt(undefined)
    getPrompt()
    setAnswer('')
  }

  if (!prompt) return <Stack mt={10} alignItems="center" w="full" ><Text>Loading...</Text></Stack>

  return <Stack mt={10} alignItems="center" w="full" >
        <Heading>Kanji Cross Game !</Heading>
        <Stack justifyContent="center" alignItems="center">
            <Kanji character={getNotPrompt(prompt[0])}/>
            <Arrow reverse={isInOrder(prompt[0])} />
            <HStack>
                <Kanji character={getNotPrompt(prompt[1])}/>
                <Arrow reverse={!isInOrder(prompt[2])} direction="row" />
                <Input value={answer} onChange={(e) => { setAnswer(e.target.value) }} boxSize={20} maxLength={1} fontSize="3em"/>
                <Arrow reverse={isInOrder(prompt[2])} direction="row"/>
                <Kanji character={getNotPrompt(prompt[2])}/>
            </HStack>
            <Arrow reverse={!isInOrder(prompt[3])} />
            <Kanji character={getNotPrompt(prompt[3])}/>
        </Stack>
        <HStack><Button onClick={() => { getNewWord() }}>Try Again</Button><Button onClick={() => { alert(prompt[0][0]) }}>View Answer</Button></HStack>
        {answer === prompt[0][0] && <Text>You Win!</Text>}
    </Stack>
}

const Kanji = ({ character }: { character: string }) => {
  return <Text fontSize="3em">{character}</Text>
}
const Arrow = ({ direction, reverse }: { direction?: 'row', reverse: boolean }) => {
  if (direction === 'row') {
    if (reverse) return <ArrowBackIcon boxSize={10}/>
    return <ArrowForwardIcon boxSize={10}/>
  }
  if (reverse) return <ArrowDownIcon boxSize={10}/>
  return <ArrowUpIcon boxSize={10}/>
}

export default KanjiCross
