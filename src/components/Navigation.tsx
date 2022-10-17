import { HStack, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";

export const Navigation = () => {
  const router = useRouter();
  return (
    <HStack
      border="md"
      width="100xw"
      py={2}
      px={4}
      justifyContent="space-between"
      alignItems="center"
      shadow="md"
    >
      <Text fontSize="3xl" fontWeight="bold" onClick={() => router.push("/")}>
        相棒
      </Text>
      <HStack cursor="pointer">
        <Text onClick={() => router.push("/topics")}>Topics</Text>
        <Text onClick={() => router.push("/settings")}>Settings</Text>
      </HStack>
    </HStack>
  );
};
