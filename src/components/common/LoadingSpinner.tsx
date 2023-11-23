import { Spinner, Stack, Text } from '@chakra-ui/react'

export function LoadingSpinner() {
  return (
    <Stack mt={10} alignItems="center" w="full" h="full">
      <Spinner size="xl" />
      <Text>Loading...</Text>
    </Stack>
  )
}
