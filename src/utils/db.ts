import Dexie, { Table } from "dexie";
import { Topic, TopicItem } from "../types/topic";

export class AibouDB extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  topics!: Table<Topic>;
  topicEntries!: Table<TopicItem>;

  constructor() {
    super("aibou-app");
    console.log("Initialized!!!");
    this.version(1).stores({
      topics: "++id, name, createdAt",
      topicEntries: "++id, topicId, word, *tags",
    });
  }
}

export let db: AibouDB | undefined;

export const initDexie = () => {
  db = new AibouDB();
  db.open();
  return db;
};
