import { KanjiReading } from "../types/jisho";
import { chakra, Text } from "@chakra-ui/react";

export const KanjiDisplay = (props: { data: KanjiReading }) => {
  const { data } = props;
  const { word, reading } = data;

  if (!word)
    return (
      <Text fontSize="3xl" fontWeight="bold">
        {reading}
      </Text>
    );

  return (
    <chakra.ruby fontSize="3xl" textAlign="center">
      <Text fontWeight="bold">{word}</Text>
      <chakra.rt>{reading}</chakra.rt>
      <chakra.rp>({reading})</chakra.rp>
    </chakra.ruby>
  );
};
