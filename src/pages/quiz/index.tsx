import {
  Box,
  Button,
  Container,
  Heading,
  ListItem,
  Stack,
  Text,
  UnorderedList
} from '@chakra-ui/react'
import Link from 'next/link'

import { ArrowBackIcon } from '@chakra-ui/icons'
import { readFile } from 'fs/promises'
import { join } from 'path'

type QuizData = Record<
  string,
  {
    label: string
    url: string
    quizzes: Record<string, { question: string[]; answer: string[] }[]>
  }
>

export const getStaticProps = async () => {
  const file = await readFile(
    join(__dirname, '../../../src/constant/quiz/quiz-index.json'),
    'utf-8'
  )
  const data = JSON.parse(file) as QuizData
  const subKeys = Object.entries(data).map(([key, value]) => ({
    key,
    label: value.label,
    url: value.url,
    quizzes: value.quizzes
  }))
  return {
    props: {
      links: subKeys
    }
  }
}
export default function QuizPage(props: {
  links: { key: string; label: string; url: string; quizzes: string[] }[]
}) {
  const { links } = props

  return (
    <Container maxWidth={['full', null, '80vw']} pt={4}>
      <Stack>
        <Box>
          <Link href="/quiz">
            <Button leftIcon={<ArrowBackIcon />} variant="link">
              Back to Topic
            </Button>
          </Link>
        </Box>
        <Heading>Quiz</Heading>
        <UnorderedList>
          {links.map((l, idx) => (
            <ListItem key={idx}>
              <Link href={l.url}>
                <Text size="2xl">{l.label}</Text>
              </Link>
              <UnorderedList>
                {l.quizzes.map((a, i) => (
                  <ListItem key={i}>
                    <Link key={idx} href={`/quiz/${l.key}---${a}`}>
                      <Text size="lg">{a}</Text>
                    </Link>
                  </ListItem>
                ))}
              </UnorderedList>
            </ListItem>
          ))}
        </UnorderedList>
      </Stack>
    </Container>
  )
}
