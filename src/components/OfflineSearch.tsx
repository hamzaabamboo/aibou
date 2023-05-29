import { Box, BoxProps, Heading, Input, Spinner, Text } from "@chakra-ui/react";
import debounce from "lodash/debounce";
import React, { useCallback, useEffect, useState } from "react";
import { useOfflineDictionary } from "../hooks/useOfflineDictionary";
import { JishoWord } from "../types/jisho";

export function OfflineSearch(
  props: {
    inputSize?: "small" | "large";
    onSelectItem: (word: JishoWord) => void;
    isPopup?: boolean;
    isShowPopup?: boolean;
    setShowPopup?: (status: boolean) => void;
  } & BoxProps
) {
  const {
    inputSize = "large",
    onSelectItem,
    isPopup = false,
    isShowPopup = true,
    setShowPopup,
    ...boxProps
  } = props;
  const [input, setInput] = useState("");
  const [keyword, _setKeyword] = useState("");
  const setKeyword = useCallback(debounce(_setKeyword, 1000), [_setKeyword]);
  const { data, isLoading } = useOfflineDictionary(keyword);
  useEffect(() => {
    if (input !== keyword) {
      setKeyword(input);
      setShowPopup?.(true);
    }
  }, [input, keyword, setKeyword, setShowPopup]);

  const searchResults = isLoading ? (
    <Spinner />
  ) : !data || data.length === 0 ? (
    <Text>Keyword not found</Text>
  ) : (
    <Text>{JSON.stringify(data)}</Text>
  );

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") setShowPopup?.(false);
  };

  return (
    <Box {...boxProps} position="relative">
      <Input
        p={2}
        width="full"
        value={input}
        fontSize={inputSize === "large" ? "4xl" : "lg"}
        fontWeight={inputSize === "large" ? "bold" : "semibold"}
        onFocus={() => setShowPopup?.(true)}
        onChange={(e) => setInput(e.currentTarget.value)}
        onKeyUp={(e) => handleKeyPress(e)}
        mb={2}
      />
      {keyword.length > 0 && !isLoading && isShowPopup && (
        <Box
          background="white"
          position={isPopup ? "absolute" : "initial"}
          p={isPopup ? "2" : "0"}
          w="full"
          borderRadius="md"
          shadow={isPopup ? "md" : "none"}
          zIndex={2}
        >
          {!isPopup && (
            <Heading fontSize="2xl" as="h3" mb={2}>
              Search Results
            </Heading>
          )}
          <Box>{searchResults}</Box>
        </Box>
      )}
    </Box>
  );
}
