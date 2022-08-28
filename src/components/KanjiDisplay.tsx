import { KanjiReading } from "../types/jisho";
import { chakra, Text } from "@chakra-ui/react";

export const KanjiDisplay = (props: {
  data: Partial<KanjiReading>;
  isSmall?: boolean;
}) => {
  const { data, isSmall = false } = props;
  const { word, reading } = data;

  const fontSize = isSmall ? "lg" : "3xl";
  const fontWeight = isSmall ? "normal" : "bold";

  if (!word)
    return (
      <Text fontSize={fontSize} fontWeight={fontWeight}>
        {reading}
      </Text>
    );

  return (
    <chakra.ruby fontSize={fontSize} textAlign="center">
      <Text fontWeight={fontWeight}>{word}</Text>
      <chakra.rt>{reading}</chakra.rt>
      <chakra.rp>({reading})</chakra.rp>
    </chakra.ruby>
  );
};
