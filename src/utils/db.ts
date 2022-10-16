import Dexie, { Table } from "dexie";
import { Topic, TopicItem } from "../types/topic";

export class AibouDB extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  topics!: Table<Topic>;
  topicEntries!: Table<TopicItem>;
  keyValues!: Table<{ key: string; value: object | string }>;

  constructor() {
    super("aibou-app");
    this.version(3).stores({
      topics: "++id, name, createdAt, lastUpdatedAt",
      topicEntries: "++id, topicId, word, createdAt,lastUpdatedAt, *tags",
      keyValues: "&key",
    });
  }
}

export let db: AibouDB | undefined;

export const initDexie = () => {
  db = new AibouDB();
  db.open();
  return db;
};
