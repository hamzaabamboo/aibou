import initSqlJs, { Database } from 'sql.js';
import { DictionaryDB, initDictionaryDB } from '../utils/dictionaryDB';
import { parseOfflineDBResult } from '../utils/parseOfflineDBResult';
import { getOfflineSearchSQL } from '../utils/sql/getOfflineSearchSQL';

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
    throw new Error("Dictionary not downloaded")
}

async function init() : Database {
  if (isInitialized) return db as Database;
  console.log("Initializing Database")
  let SQL = await initSqlJs({ locateFile: file => `/sql-wasm.wasm` });
  const data = await loadDictionaryFile();
     postMessage({
        type: 'message',
        value: "Loading Database",
    });
    console.log("Dictionary Loaded")
    db = new (SQL as any).Database(new Uint8Array(data)) as Database;
    db.exec(`
      PRAGMA page_size=8192;
      PRAGMA journal_mode=MEMORY;
    `);
    isInitialized = true;
    console.log("Initialized")
  return db as Database;
}

export type WorkerActions = 'searchWord' | 'init'
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
           console.log("Start Searching")
           if (!db) db = await init();
           console.time()
           console.log(getOfflineSearchSQL(data.data))
            const res = await db.exec(getOfflineSearchSQL(data.data), { $searchTerm:`${data.data}`})
            console.timeEnd()
            postMessage({ type: 'searchWordResult', data: parseOfflineDBResult(res)})
            console.log("Done")
         break;   
        }
    }
})