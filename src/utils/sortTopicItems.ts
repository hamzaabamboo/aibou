import { TopicItem } from "../types/topic";
import sortBy from "lodash/sortBy";

export type SortTopicItemsBy = "word" | "createdAt";
export const sortTopicItems =
  (orderBy?: SortTopicItemsBy, isReversed?: boolean) => (data: TopicItem[]) => {
    if (!data) return [];
    if (!sortBy) return data;
    let r: TopicItem[] = [];
    switch (orderBy) {
      case "word":
        r = sortBy(data, (i) => i.word);
        break;
      case "createdAt":
        r = sortBy(data, (i) => i.createdAt);
        break;
    }
    if (isReversed) return r?.reverse();
    else return r;
  };
