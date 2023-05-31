import { Box, HStack, Text } from "@chakra-ui/react";

export const Footer = () => {
  return (
    <Box as="footer" width="100vw" bgColor="gray.100">
      <HStack py="2" justifyContent="center">
        <Text>© 2022-2023 ハムP | Source Code</Text>
      </HStack>
    </Box>
  );
};
