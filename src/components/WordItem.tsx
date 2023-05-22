import { JishoWord, KanjiReading } from "../types/jisho";
import { KanjiDisplay } from "./KanjiDisplay";
import { SearchResultItem, SearchResultItemProps } from "./SearchResultItem";

export const WordItem = (
  props: { item?: JishoWord; word: string } & Omit<
    SearchResultItemProps,
    "item"
  >
) => {
  const { item, showMeaning, word, ...rest } = props;
  return item ? (
    <SearchResultItem
      item={item}
      showMeaning={showMeaning}
      isCard={false}
      {...rest}
    />
  ) : (
    <KanjiDisplay data={{ word: word }} />
  );
};
