import { Box, HStack, Text } from '@chakra-ui/react'

export function Footer() {
  return (
    <Box as="footer" width="100vw" bgColor="gray.100">
      <HStack py="2" justifyContent="center">
        <Text>
          © 2022-2023 ハムP, Dictionary and Quiz Data belongs to respective
          owner | Source Code
        </Text>
      </HStack>
    </Box>
  )
}
