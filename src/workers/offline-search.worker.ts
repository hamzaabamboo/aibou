import initSqlJs, { type Database } from 'sql.js'
import { isRomaji, toKana } from 'wanakana'
import { initDictionaryDB, type DictionaryDB } from '../utils/db/dictionary-db'
import { parseOfflineDBResult } from '../utils/parseOfflineDBResult'
import { getOfflineSearchSQL } from '../utils/sql/getOfflineSearchSQL'

let isInitialized = false
let indexedDB: DictionaryDB | undefined
let db: Database | undefined
let tagsData: Record<string, string> | undefined

export type WorkerActions = 'searchWord' | 'searchWords' | 'init'
export interface WorkerMessage {
  type: WorkerActions
  data: any
}

export type WorkerResponseType = 'searchWordResult' | 'searchWordsResult'
export interface WorkerResponse {
  type: WorkerResponseType
  value: any
}

let initializingPromise: Promise<Database> | undefined

const loadDictionaryFile = async () => {
  const db = (indexedDB != null) ? indexedDB : await initDictionaryDB()
  const data = await db.database.get({ id: 'latest' })
  if (data != null) {
    postMessage({
      type: 'message',
      value: 'Load data from DB'
    })
    return data.data
  }
  throw new Error('Dictionary not downloaded')
}

async function init (): Promise<Database> {
  if (isInitialized) return db as Database
  if (initializingPromise) return await initializingPromise
  const SQL = await initSqlJs({ locateFile: file => '/sql-wasm.wasm' })
  const data = await loadDictionaryFile()
  postMessage({
    type: 'message',
    value: 'Loading Database'
  })
  console.log('Dictionary Loaded')
  db = new (SQL as any).Database(new Uint8Array(data)) as Database
  db.exec(`
      PRAGMA page_size=4096;
      PRAGMA journal_mode=MEMORY;
    `)
  isInitialized = true
  initializingPromise = undefined
  console.log('Initialized')
  return db
}

initializingPromise = init()

addEventListener('message', async ({ data }: MessageEvent<WorkerMessage>) => {
  switch (data.type) {
    case 'searchWord': {
      console.time('Offline Search')
      if (db == null) db = await init()
      const searchTerm = isRomaji(data.data) && /^[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f]+$/.test(toKana(data.data)) ? toKana(data.data) : data.data
      const res = await db.exec(getOfflineSearchSQL(searchTerm), { $searchTerm: `${searchTerm}` })
      if (tagsData == null) {
        tagsData = Object.fromEntries(await db.exec('SELECT * FROM tags')[0].values)
      }
      console.timeEnd('Offline Search')
      postMessage({ type: 'searchWordResult', data: parseOfflineDBResult(res, tagsData!) })
      break
    }
    case 'searchWords': {
      console.time('Offline Search (multiple)')
      if (db == null) db = await init()
      if (tagsData == null) {
        tagsData = Object.fromEntries(await db.exec('SELECT * FROM tags')[0].values)
      }
      const words = data.data
      const results = []
      for (const word of words) {
        const searchTerm = isRomaji(word) && /^[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f]+$/.test(toKana(word)) ? toKana(word) : word
        const res = await db.exec(getOfflineSearchSQL(searchTerm, 8), { $searchTerm: `${searchTerm}` })
        results.push({ word, results: parseOfflineDBResult(res, tagsData!) })
      }
      console.timeEnd('Offline Search (multiple)')
      postMessage({ type: 'searchWordsResult', data: results })
    }
  }
})
