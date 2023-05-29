import Dexie, { Table } from 'dexie';
import { Topic, TopicItem } from '../types/topic';

export class AibouDB extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  topics!: Table<Topic>;

  topicEntries!: Table<TopicItem>;

  keyValues!: Table<{ key: string; value: object | string | number| boolean }>;

  constructor() {
    super('aibou-app');
    this.version(4).stores({
      topics: '++id, name, createdAt, lastUpdatedAt, isDeleted',
      topicEntries:
        '++id, topicId, word, createdAt,lastUpdatedAt, isDeleted, *tags',
      keyValues: '&key',
    });
  }
}

export let db: AibouDB | undefined;

export const initDexie = () => {
  db = new AibouDB();
  db.open();
  return db;
};
