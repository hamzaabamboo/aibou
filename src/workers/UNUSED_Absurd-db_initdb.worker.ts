import initSqlJs, { Database } from '@jlongster/sql.js';
import { SQLiteFS } from 'absurd-sql';
import IndexedDBBackend from 'absurd-sql/dist/indexeddb-backend';
import axios from 'axios';
import pako from 'pako';
// import initSqlJs, { Database } from 'sql.js';

const JMDICT_FILE = `/${encodeURIComponent(
    'offline-dict.sqlite.gz',
  )}`;
// const JMDICT_FILE = `/${encodeURIComponent(
//         'offline-dict.sqlite',
//       )}`;

async function init() {
  let SQL = await initSqlJs({ locateFile: file => `/sql-wasm.wasm` });
  const FS = (SQL as any).FS
  let sqlFS = new SQLiteFS(FS, new IndexedDBBackend());
  (SQL as any).register_for_idb(sqlFS);

  FS.mkdir('/sql');
  FS.mount(sqlFS, {}, '/sql');

  console.log('Downloading Database File')
  const { data: downloadData } = await axios.get(JMDICT_FILE, {
    responseType: 'arraybuffer',
    onDownloadProgress: (progress: ProgressEvent) => {
      postMessage({
        type: 'downloadProgress',
        value: Math.floor((progress.loaded / progress.total) * 100) / 100,
      });
    },
  });

  console.log('Decompressing')
  const decompress = pako.inflate(downloadData as ArrayBuffer);
  console.log('Writing File', decompress);
  const stream = FS.open('/sql/db.sqlite', 'w+');
  await stream.node.contents.write(decompress, 0, decompress.length, 0);
  FS.close(stream);

    // FS.writeFile('/sql/db.sqlite',decompress );
  console.log('Loading DB')
//   let db: Database = new (SQL as any).Database(new Uint8Array(decompress));
  let db: Database = new (SQL as any).Database('/sql/db.sqlite', {
    filename: true
  });
  db.exec(`
    PRAGMA page_size=8192;
    PRAGMA journal_mode=MEMORY;
  `);
  return db;
}

async function runQueries() {
  let db = await init();

  let stmt = db.prepare(`SELECT * FROM kanji`);
  stmt.step();
  console.log('Result:', stmt.getNormalizedSQL());
  stmt.free();
}

runQueries();