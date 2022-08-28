import omit from "lodash/omit";
import { Topic, TopicItem } from "../types/topic";
import { db } from "./db";

export type ExportDataType = {
  topics: Topic[];
  topicItem: Omit<TopicItem, "jishoData">[];
  timestamp: number;
};
export const exportData = async () => {
  const topics = await db?.topics.toArray();
  const topicEntries = await db?.topicEntries.toArray();

  const seralizedData = {
    topics: topics?.map((t) => seralizeTopic(t)),
    topicItem: topicEntries?.map((t) => seralizeTopicItem(t)),
    timestamp: new Date().valueOf(),
  };

  console.log(seralizedData);
};

export const importData = async (
  data: ExportDataType,
  options?: { replace?: boolean }
) => {
  const { topics, topicItem, timestamp } = data;
  const { replace } = options ?? {};
  return {};
};

export const seralizeTopic = (topic: Topic) => {
  return omit(topic, [""]);
};
export const seralizeTopicItem = (topicItem: TopicItem) => {
  return omit(topicItem, ["jishoData"]);
};
