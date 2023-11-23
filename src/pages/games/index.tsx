import { Container, Heading, HStack, Link, Stack, Text } from '@chakra-ui/react'

function GamesPage() {
  return (
    <Container pt={8}>
      <Stack>
        <HStack justifyContent="space-between" mb={2}>
          <Heading>Games</Heading>
        </HStack>
        <Stack>
          <Link href="/games/kanji-cross">
            <Text size="xl">Kanji Cross</Text>
          </Link>
        </Stack>
      </Stack>
    </Container>
  )
}

export default GamesPage
