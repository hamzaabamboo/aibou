import { Container, Heading, Stack, Text } from "@chakra-ui/react";
import type { NextPage } from "next";
import { JishoSearch } from "../components/JishoSearch";

const Home: NextPage = () => {
  return (
    <Container>
      <Stack justifyContent="center" alignItems="center" h="full" pt="8">
        <Heading>相棒/ Aibou</Heading>
        <Text>Japanese-language learning companion</Text>
        <JishoSearch onSelectItem={console.log} />
      </Stack>
    </Container>
  );
};

export default Home;
