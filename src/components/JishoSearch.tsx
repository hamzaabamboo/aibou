import {
  Box,
  BoxProps,
  Heading,
  Input,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useState } from "react";
import { useJishoSearch } from "../hooks/useJishoSearch";
import { JishoWord } from "../types/jisho";
import { KanjiDisplay } from "./KanjiDisplay";
import { SearchResultItem } from "./SearchResultItem";

export const JishoSearch = (
  props: {
    inputSize?: "small" | "large";
    onSelectItem: (word: JishoWord) => void;
  } & BoxProps
) => {
  const { inputSize = "large", onSelectItem, ...boxProps } = props;
  const [input, setInput] = useState("");
  const [keyword, _setKeyword] = useState("");
  const setKeyword = useCallback(
    (word: string) => debounce(_setKeyword, 500)(word),
    [_setKeyword]
  );
  const { data, isLoading } = useJishoSearch(keyword);

  useEffect(() => {
    if (input !== keyword) {
      setKeyword(input);
    }
  }, [input, keyword, setKeyword]);

  const searchResults = isLoading ? (
    <Spinner />
  ) : !data || data.length === 0 ? (
    <Text>Keyword not found</Text>
  ) : (
    <Stack>
      {data?.map((item) => {
        return (
          <SearchResultItem
            key={item.slug}
            item={item}
            onClick={() => onSelectItem(item)}
          />
        );
      })}
    </Stack>
  );

  return (
    <Box {...boxProps}>
      <Input
        p={2}
        width="full"
        value={input}
        fontSize={inputSize === "large" ? "4xl" : "lg"}
        fontWeight={inputSize === "large" ? "bold" : "semibold"}
        onChange={(e) => setInput(e.currentTarget.value)}
        mb={2}
      />
      {keyword.length > 0 && !isLoading && (
        <>
          <Heading fontSize="2xl" as="h3" mb={2}>
            Search Results
          </Heading>
          <Box>{searchResults}</Box>
        </>
      )}
    </Box>
  );
};
