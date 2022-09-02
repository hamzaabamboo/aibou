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
import { exportData } from "../utils/exportData";

const Home: NextPage = () => {
  const { download } = useDownloadOfflineDictionary();

  return (
    <Container>
      <Stack h="full" pt="8">
        <Heading>App Settings</Heading>
        <Stack>
          <HStack justifyContent="space-between">
            <Text>Export Data (Experimental)</Text>
            <Button onClick={() => exportData()}>Export Data</Button>
          </HStack>
          <HStack justifyContent="space-between">
            <Text>Download offline dictionary</Text>
            <Button onClick={() => download()}>Download Dictionary</Button>
          </HStack>
        </Stack>
      </Stack>
    </Container>
  );
};

export default Home;
