import omit from "lodash/omit";
import { Topic, TopicItem } from "../types/topic";
import { db } from "./db";

export type ExportDataType = {
  topics: Topic[];
  topicItem: Omit<TopicItem, "jishoData">[];
  timestamp: number;
};
const fixMissingData = async () => {
  console.log("Fixing missing data...");
  const topics =
    (await db?.topics.toArray())?.filter((t) => !t.lastUpdatedAt) ?? [];
  const topicEntries =
    (await db?.topicEntries.toArray())?.filter((t) => !t.lastUpdatedAt) ?? [];
  await db?.topics.bulkPut(
    topics.map((d) => ({ ...d, lastUpdatedAt: d.createdAt }))
  );
  await db?.topicEntries.bulkPut(
    topicEntries.map((d) => ({ ...d, lastUpdatedAt: d.createdAt }))
  );
};
export const getNewData = async (lastUpdated: Date = new Date(0)) => {
  // Add last updated date for existing data

  const d = await db?.topics.limit(1).toArray();
  if (d && d.length > 0 && !d[0].lastUpdatedAt) {
    await fixMissingData();
  }

  const topics = await db?.topics
    .where("lastUpdatedAt")
    .aboveOrEqual(lastUpdated)
    .toArray();
  const topicEntries = await db?.topicEntries
    .where("lastUpdatedAt")
    .aboveOrEqual(lastUpdated)
    .toArray();

  const serializedData = {
    topics: topics?.map((t) => seralizeTopic(t)),
    topicItem: topicEntries?.map((t) => seralizeTopicItem(t)),
    timestamp: new Date().valueOf(),
  };

  return serializedData;
};

export const importData = async (
  data: ExportDataType,
  options?: { replace?: boolean }
) => {
  const { topics, topicItem, timestamp } = data;
  const { replace } = options ?? {};

  await db?.topics.bulkPut(
    topics.map((d) => ({
      ...d,
      createdAt: new Date(d.createdAt),
      lastUpdatedAt: new Date(d.lastUpdatedAt),
    }))
  );
  await db?.topicEntries.bulkPut(
    topicItem.map((d) => ({
      ...d,
      createdAt: new Date(d.createdAt),
      lastUpdatedAt: new Date(d.lastUpdatedAt),
    }))
  );
  return timestamp;
};

export const seralizeTopic = (topic: Topic) => {
  return omit(topic, [""]);
};
export const seralizeTopicItem = (topicItem: TopicItem) => {
  return omit(topicItem, ["jishoData"]);
};
