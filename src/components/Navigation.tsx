import { HStack, Icon, IconButton, Text } from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { useSyncData } from "../hooks/useSyncData";

export const Navigation = () => {
  const router = useRouter();
  const { syncEnabled, sync } = useSyncData();
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
        {syncEnabled && (
          <IconButton
            aria-label="sync"
            onClick={() => sync()}
            icon={<RepeatIcon />}
          />
        )}
      </HStack>
    </HStack>
  );
};
