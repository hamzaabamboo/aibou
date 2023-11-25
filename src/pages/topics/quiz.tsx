import { Box, Button, Container, Link } from '@chakra-ui/react'
import { useRouter } from 'next/router'

import { ArrowBackIcon } from '@chakra-ui/icons'
import { LoadingSpinner } from 'components/common/LoadingSpinner'
import { Quiz } from 'components/quiz/Quiz'
import { useGetTopic } from 'hooks/topic/useGetTopic'
import { useGetTopicItems } from 'hooks/topic-item/useGetTopicItems'

function KankenPractice() {
  const { query } = useRouter()
  const topicId = query.id as string
  const { data: topic } = useGetTopic(topicId)
  const { data: words } = useGetTopicItems(topicId)

  if (!topic || !words) {
    return <LoadingSpinner />
  }

  return (
    <Container maxWidth={['full', null, '80vw']} pt={4}>
      <Box>
        <Link href={`/topics/details?id=${topicId}`}>
          <Button leftIcon={<ArrowBackIcon />} variant="link">
            Back to Topic
          </Button>
        </Link>
      </Box>
      <Quiz
        quizId={`topic-quiz-${topicId}`}
        title={`${topic.name} Practice`}
        questions={words.map((w) => ({
          question: w.word,
          answer: w.reading ? [w.reading] : undefined,
          data: w.jishoData
        }))}
      />
    </Container>
  )
}

export default KankenPractice
