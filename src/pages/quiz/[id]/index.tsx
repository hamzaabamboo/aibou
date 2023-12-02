import { Box, Button, Center, Container, Stack } from '@chakra-ui/react'
import { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { ArrowBackIcon } from '@chakra-ui/icons'
import { Quiz } from 'components/quiz/Quiz'
import { readFile } from 'fs/promises'
import { capitalize } from 'lodash'
import { join } from 'path'

type QuizData = {
  label: string
  url: string
  quizzes: Record<string, { question: string[]; answer: string[] }[]>
}

export const getStaticPaths: GetStaticPaths = async () => {
  const file = await readFile(
    join(__dirname, '../../../../src/constant/quiz/quiz-index.json'),
    'utf-8'
  )
  const data = JSON.parse(file)
  const subKeys = Object.entries(data).flatMap(([key, value]) =>
    (value as { quizzes: string[] }).quizzes.map((quiz) => `${key}---${quiz}`)
  )
  return {
    paths: subKeys.map((id) => ({
      params: {
        id
      }
    })),
    fallback: false
  }
}

export const getStaticProps = (async (context) => {
  const { id } = context.params ?? {}
  const [provider, quiz] = id?.split('---') ?? []
  const file = await readFile(
    join(__dirname, `../../../../src/constant/quiz/${provider}.json`),
    'utf-8'
  )
  const data = JSON.parse(file) as QuizData

  return { props: { questions: data.quizzes[quiz] } }
}) satisfies GetStaticProps<
  {
    questions: { question: string[]; answer: string[] }[]
  },
  { id: string }
>

export default function QuizDetail({
  questions
}: {
  questions: { question: string[]; answer: string[] }[]
}) {
  const { query } = useRouter()
  const id = query.id as string

  if (!questions) {
    return (
      <Center>
        <Stack>Quiz Not found</Stack>
        <Link href="/quiz">Back</Link>
      </Center>
    )
  }
  return (
    <Container maxWidth={['full', null, '80vw']} pt={4}>
      <Stack>
        <Box>
          <Link href="/quiz">
            <Button leftIcon={<ArrowBackIcon />} variant="link">
              Back to Quizzes
            </Button>
          </Link>
        </Box>
        <Quiz
          quizId={`quiz-${id}`}
          title={`${capitalize(id.split('---')[1])} Practice`}
          questions={questions.flatMap((w) =>
            w.question.map((q) => ({
              ...w,
              question: q,
              answer: w.answer
            }))
          )}
        />
      </Stack>
    </Container>
  )
}
