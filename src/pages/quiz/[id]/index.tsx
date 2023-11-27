import { Center, Container, Stack } from '@chakra-ui/react'
import { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Quiz } from 'components/quiz/Quiz'
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

export const getStaticPaths: GetStaticPaths = async () => {
  const file = await readFile(
    join(__dirname, '../../../../src/constant/quiz-data.json'),
    'utf-8'
  )
  const data = JSON.parse(file) as QuizData
  const subKeys = Object.entries(data).flatMap(([key, value]) =>
    Object.keys(value.quizzes).map((quiz) => `${key}---${quiz}`)
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
  const file = await readFile(
    join(__dirname, '../../../../src/constant/quiz-data.json'),
    'utf-8'
  )
  const data = JSON.parse(file) as QuizData
  const [provider, quiz] = id?.split('---') ?? []
  return { props: { questions: data[provider].quizzes[quiz] } }
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
        <Quiz
          quizId={`quiz-${id}`}
          title={`${id} Practice`}
          questions={questions.flatMap((w) =>
            w.question.map((q) => ({
              question: q,
              answer: w.answer
            }))
          )}
        />
      </Stack>
    </Container>
  )
}
