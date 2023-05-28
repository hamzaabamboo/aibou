import initSqlJs, { Database } from 'sql.js';
import { DictionaryDB, initDictionaryDB } from '../utils/dictionaryDB';

let isInitialized = false;
let indexedDB: DictionaryDB|undefined = undefined; 
let db: Database | undefined;

const loadDictionaryFile = async () => {
    const db = indexedDB ? indexedDB : await initDictionaryDB() 
    const data = await db.database.get({id: 'latest'})
    if (data) {
         postMessage({
        type: 'message',
        value: "Load data from DB",
    });
        return data.data;
    }
    throw new Error(" Dictionary not downloaded")
}

async function init() {
  if (isInitialized) return ;
  let SQL = await initSqlJs({ locateFile: file => `/sql-wasm.wasm` });
  const data = await loadDictionaryFile();
     postMessage({
        type: 'message',
        value: "Loading Database",
    });
    db = new (SQL as any).Database(new Uint8Array(data));
    if (!db) return;
  db.exec(`
    PRAGMA page_size=8192;
    PRAGMA journal_mode=MEMORY;
  `);
  isInitialized = true;
  return db;
}

export type WorkerActions = 'searchWord'
export type WorkerMessage = {
  type: WorkerActions;
  data: any
}

export type WorkerResponseType = 'searchWordResult'
export type WorkerResponse = {
  type: WorkerResponseType;
  value: any
}

init();

addEventListener('message', async ({ type,data }: MessageEvent<WorkerMessage>) => {
    switch (data.type) {
        case "searchWord": {
            console.log(data)
            const res = await db?.exec(`SELECT * FROM word_kanji WHERE text LIKE '%${data.data}%' `)
            console.log(res)
            postMessage({ type: 'searchWordResult', data: res[0]})
         break;   
        }
    }
})