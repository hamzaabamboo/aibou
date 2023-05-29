import initSqlJs, { Database } from 'sql.js';
import { isRomaji, toKana } from 'wanakana';
import { DictionaryDB, initDictionaryDB } from '../utils/dictionaryDB';
import { parseOfflineDBResult } from '../utils/parseOfflineDBResult';
import { getOfflineSearchSQL } from '../utils/sql/getOfflineSearchSQL';

let isInitialized = false;
let indexedDB: DictionaryDB|undefined = undefined; 
let db: Database | undefined;
let tagsData: Record<string,string> | undefined = undefined;

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

async function init() : Promise<Database> {
  if (isInitialized) return db as Database;
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
          console.time("Offline Search")
           if (!db) db = await init();
            const searchTerm = isRomaji(data.data) && /^[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f]+$/.test(toKana(data.data)) ? toKana(data.data) : data.data
            const res = await db.exec(getOfflineSearchSQL(searchTerm), { $searchTerm:`${searchTerm}`})
            if (!tagsData) {
              tagsData = Object.fromEntries(await db.exec('SELECT * FROM tags')[0].values)
            }
            console.timeEnd("Offline Search")
            postMessage({ type: 'searchWordResult', data: parseOfflineDBResult(res, tagsData!)})
         break;   
        }
    }
})