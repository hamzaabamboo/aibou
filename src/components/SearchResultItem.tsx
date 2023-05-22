import {
  UnorderedList,
  ListItem,
  Stack,
  HStack,
  StackProps,
  Text,
  Box,
} from "@chakra-ui/react";
import { JishoWord } from "../types/jisho";
import { KanjiDisplay } from "./KanjiDisplay";
import { PartOfSpeechLabel } from "./PartOfSpeechLabel";
import { sortBy } from "lodash";
import { similarity } from "../utils/stringSimilarity";
import { orderBy } from "lodash";

export type SearchResultItemProps = {
  item: JishoWord;
  showMeaning?: boolean;
  isCard?: boolean;
} & StackProps;

export const SearchResultItem = (props: SearchResultItemProps) => {
  const { item, showMeaning = true, isCard = true, ...stackProps } = props;

  const word = item.japanese;

  return (
    <Stack
      alignItems="flex-start"
      shadow={isCard ? "md" : "none"}
      borderRadius={isCard ? "md" : "none"}
      h="full"
      p={2}
      {...stackProps}
    >
      <HStack flexWrap="wrap" alignItems="flex-end" spacing="1">
        <KanjiDisplay data={word[0]} />
        {word.length > 0 &&
          word
            .slice(1)
            .map((item, idx) => <KanjiDisplay key={idx} data={item} isSmall />)}
      </HStack>
      {showMeaning && (
        <Box>
          <UnorderedList>
            {item.senses.map((i, idx) => {
              return (
                <ListItem key={idx}>
                  <Text>
                    <HStack as="span" spacing="1" display="inline" mr={2}>
                      {i.parts_of_speech.map((i, idx) => (
                        <PartOfSpeechLabel key={idx} partOfSpeech={i} />
                      ))}
                    </HStack>
                    {i.english_definitions.join(", ")}
                  </Text>
                </ListItem>
              );
            })}
          </UnorderedList>
        </Box>
      )}
    </Stack>
  );
};
