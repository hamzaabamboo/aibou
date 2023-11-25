import { Center, Container, Stack } from '@chakra-ui/react'
import { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Quiz } from 'components/quiz/Quiz'
import nandoku from 'constant/quiz/nandoku.json'

export const getStaticPaths: GetStaticPaths = () => ({
  paths: Object.keys(nandoku).map((id) => ({
    params: {
      id
    }
  })),
  fallback: false
})

export const getStaticProps = (async (context) => {
  const { id } = context.params ?? {}
  return { props: { questions: nandoku[id as 'bird'] ?? [] } }
}) satisfies GetStaticProps<
  {
    questions: (typeof nandoku)['bird']
  },
  { id: string }
>

export default function QuizDetail({
  questions
}: {
  questions: (typeof nandoku)['bird']
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
