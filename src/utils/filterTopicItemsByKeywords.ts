import { TopicItem } from '../types/topic';

export const checkString = (s: string, substring: string) => s !== undefined && s?.toLowerCase().indexOf(substring) !== -1;
export const filterTopicItemsByKeywords = (filter?: string) => (data: TopicItem[]) => {
  if (!data) return [];
  if (!filter) return data;
  return data.filter((item) => (
    // Filter word itself
    checkString(item.word, filter)
        // Filter meanings/ writing
        || item.jishoData?.japanese.some(
          (j) => checkString(j.reading, filter) || checkString(j.word, filter),
        )
        // Filter english definition
        || item.jishoData?.senses.some((s) => s.english_definitions.some((d) => checkString(d, filter)))
  ));
};
