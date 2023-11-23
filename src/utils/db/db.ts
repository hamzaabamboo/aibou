import Dexie, { type Table } from 'dexie'

import { type QuizData } from '../../types/quizData'
import { type Topic, type TopicItem } from '../../types/topic'

export class AibouDB extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  topics!: Table<Topic>

  topicEntries!: Table<TopicItem>

  keyValues!: Table<{ key: string; value: object | string | number | boolean }>

  quiz!: Table<QuizData>

  constructor() {
    super('aibou-app')
    this.version(5).stores({
      topics: '+= 1id, name, createdAt, lastUpdatedAt, isDeleted',
      topicEntries:
        '+= 1id, topicId, word, createdAt,lastUpdatedAt, isDeleted, *tags',
      keyValues: '&key',
      quiz: 'id'
    })
  }
}

// eslint-disable-next-line import/no-mutable-exports
export let db: AibouDB | undefined

export const initDexie = async () => {
  db = new AibouDB()
  await db.open()
  return db
}
