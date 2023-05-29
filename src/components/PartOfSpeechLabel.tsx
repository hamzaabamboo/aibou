import { Tag } from "@chakra-ui/react";
import { PartOfSpeech } from "../types/jisho";

export const parsePartOfSpeech = (partOfSpeech: PartOfSpeech) => {
  switch (partOfSpeech) {
    case PartOfSpeech.Noun:
      return "n";
    case PartOfSpeech.PrenominallyNoun:
    case PartOfSpeech.NounWithNo:
      return null;
    case PartOfSpeech.SuruVerb:
    case PartOfSpeech.SuruVerbIncluded:
      return "v-する";
    case PartOfSpeech.IchidanVerb:
      return "v-る";
    case PartOfSpeech.GodanVerU:
    case PartOfSpeech.GodanVerbMu:
    case PartOfSpeech.GodanVerbSu:
    case PartOfSpeech.GodanVerbRu:
      return "v-いる";
    case PartOfSpeech.TransitiveVerb:
      return "自";
    case PartOfSpeech.IntransitiveVerb:
      return "他";
    case PartOfSpeech.IAdj:
      return "い-adj";
    case PartOfSpeech.OldNaAdj:
    case PartOfSpeech.NaAdj:
      return "な-adj";
    case PartOfSpeech.Adverb:
      return "adv";
    case PartOfSpeech.AdverbTo:
      return "と-adv";
    case PartOfSpeech.Expressions:
      return "Expressions";
    case PartOfSpeech.WikipediaDefinition:
      return "wiki";
    default:
      return partOfSpeech;
  }
};
export function PartOfSpeechLabel(props: { partOfSpeech: PartOfSpeech }) {
  const { partOfSpeech } = props;

  const text = parsePartOfSpeech(partOfSpeech);

  const color = (() => {
    switch (partOfSpeech) {
      case PartOfSpeech.Noun:
      case PartOfSpeech.NounWithNo:
      case PartOfSpeech.PrenominallyNoun:
        return "green";
      case PartOfSpeech.SuruVerb:
      case PartOfSpeech.SuruVerbIncluded:
      case PartOfSpeech.IchidanVerb:
      case PartOfSpeech.GodanVerU:
      case PartOfSpeech.GodanVerbMu:
      case PartOfSpeech.GodanVerbSu:
      case PartOfSpeech.GodanVerbRu:
      case PartOfSpeech.TransitiveVerb:
      case PartOfSpeech.IntransitiveVerb:
        return "purple";
      case PartOfSpeech.IAdj:
      case PartOfSpeech.NaAdj:
      case PartOfSpeech.OldNaAdj:
        return "yellow";
      case PartOfSpeech.Adverb:
      case PartOfSpeech.AdverbTo:
        return "cyan";
      case PartOfSpeech.Expressions:
        return "red";
      case PartOfSpeech.WikipediaDefinition:
        return "wiki.";
      default:
        return "gray";
    }
  })();

  if (!text) return null;

  return (
    <Tag colorScheme={color} my="1">
      {text}
    </Tag>
  );
}
