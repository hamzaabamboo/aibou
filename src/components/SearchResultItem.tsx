import {
  UnorderedList,
  ListItem,
  Stack,
  StackProps,
  Text,
  Box,
} from "@chakra-ui/react";
import { JishoWord } from "../types/jisho";
import { KanjiDisplay } from "./KanjiDisplay";
import { PartOfSpeechLabel } from "./PartOfSpeechLabel";

export const SearchResultItem = (props: { item: JishoWord } & StackProps) => {
  const { item, ...stackProps } = props;

  return (
    <Stack
      alignItems="flex-start"
      shadow="md"
      borderRadius="md"
      p={2}
      {...stackProps}
    >
      <KanjiDisplay data={item.japanese[0]} />
      <Box>
        <UnorderedList>
          {item.senses.map((i, idx) => {
            return (
              <ListItem key={idx}>
                <Text>
                  <Stack direction="row" spacing="1" display="inline" mr={2}>
                    {i.parts_of_speech.map((i, idx) => (
                      <PartOfSpeechLabel key={idx} partOfSpeech={i} />
                    ))}
                  </Stack>
                  {i.english_definitions.join(", ")}
                </Text>
              </ListItem>
            );
          })}
        </UnorderedList>
      </Box>
    </Stack>
  );
};
