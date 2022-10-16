import {
  Button,
  Container,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { JishoSearch } from "../components/JishoSearch";
import { useDownloadOfflineDictionary } from "../hooks/useDownloadOfflineDictionary";
import { useLastUpdatedTime } from "../hooks/useLastUpdatedTime";
import { format } from "date-fns";
import { exportData } from "../utils/exportData";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { SyncSettings } from "../components/SyncSettings";
import { useSyncData } from "../hooks/useSyncData";

const Home: NextPage = () => {
  const { download } = useDownloadOfflineDictionary();
  const [lastSyncedTime] = useLocalStorage("lastSyncedTime", 0);
  const syncData = useSyncData();

  return (
    <Container>
      <Stack h="full" pt="8">
        <Heading>App Settings</Heading>
        <Stack>
          <HStack justifyContent="space-between">
            <Stack>
              <Text>Export Data (Experimental)</Text>
              {lastSyncedTime && (
                <Text>
                  Last updated at :{" "}
                  {format(new Date(lastSyncedTime), "dd/MM/yyyy HH:mm")}
                </Text>
              )}
            </Stack>
            <Button onClick={() => syncData(new Date(lastSyncedTime ?? 0))}>
              Export Data
            </Button>
          </HStack>
          <SyncSettings />
          <HStack justifyContent="space-between">
            <Text>Download offline dictionary (Work in progress)</Text>
            <Button isDisabled onClick={() => download()}>
              Download
            </Button>
          </HStack>
        </Stack>
      </Stack>
    </Container>
  );
};

export default Home;
