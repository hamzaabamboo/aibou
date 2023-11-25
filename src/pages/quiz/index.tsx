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
import nandoku from 'constant/quiz/nandoku.json'

const links = Object.keys(nandoku)

export default function QuizPage() {
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
            <Link key={idx} href={`/quiz/${l}`}>
              <ListItem>
                <Text size="lg">{l}</Text>
              </ListItem>
            </Link>
          ))}
        </UnorderedList>
      </Stack>
    </Container>
  )
}
