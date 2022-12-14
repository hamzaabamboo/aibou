import axios from "axios";
import { Table } from "dexie";
import groupBy from "lodash/groupBy";
import pako from "pako";
import { JMDictFile } from "../types/jmdict";
import { initDictionaryDB } from "../utils/dictionaryDb";
import { normalizeDictionary } from "../utils/normalizeDictionary";

const JMDICT_FILE = `/${encodeURIComponent(
  "jmdict-eng-3.1.0+20201001122454.json.tgz"
)}`;

function chunkInsert<
  O extends { id: string },
  T extends Table<O>["bulkPut"],
  P extends Parameters<T>[0]
>(inputFn: (params: P) => ReturnType<T>, data: P) {
  const groups = Object.values(
    groupBy(
      data.map((d, idx) => ({ ...d, idx })),
      ({ id }) => Math.floor(Number(id) / 10000)
    )
  );
  return groups
    .map((group) => () => inputFn(group as any))
    .reduce((p, c) => p.then(() => c()), Promise.resolve({}));
}

type WorkerEvent = {
  type: "download" | "extract";
  data?: any;
};
addEventListener("message", async ({ data }: MessageEvent<WorkerEvent>) => {
  const { type, data: inputData } = data;
  console.log(data);
  if (type === "download") {
    const { data: downloadData } = await axios.get(JMDICT_FILE, {
      responseType: "arraybuffer",
      onDownloadProgress: (progress: ProgressEvent) => {
        postMessage({
          type: "downloadProgress",
          value: Math.floor((progress.loaded / progress.total) * 100) / 100,
        });
      },
    });

    const decompress = pako.inflate(downloadData as ArrayBuffer);
    postMessage({
      type: "downloadCompleted",
      value: decompress.buffer,
    });
  }
  if (type === "extract") {
    const enc = new TextDecoder("utf-8");
    const dict = JSON.parse(enc.decode(inputData as ArrayBuffer)) as JMDictFile;
    postMessage({
      type: "extractComplete",
    });

    const { kanjis, kanas, senses, glosses, words } = normalizeDictionary(dict);

    const db = await initDictionaryDB();

    postMessage({
      type: "importDB",
    });

    try {
      await chunkInsert((d) => db.words.bulkPut(d), words);
      postMessage({
        type: "importProgress",
        value: "added words",
      });
      await chunkInsert((d) => db.glosses.bulkPut(d), glosses);
      postMessage({
        type: "importProgress",
        value: "added glosses",
      });
      await chunkInsert((d) => db.kanjis.bulkPut(d), kanjis);
      postMessage({
        type: "importProgress",
        value: "added kanjis",
      });
      await chunkInsert((d) => db.kanas.bulkPut(d), kanas);
      postMessage({
        type: "importProgress",
        value: "added kanas",
      });
      await chunkInsert((d) => db.senses.bulkPut(d), senses);
      postMessage({
        type: "importProgress",
        value: "added senses",
      });
    } catch (error) {
      console.log("fuck", error);
    }

    postMessage({
      type: "importFinished",
    });

    postMessage({
      type: "completed",
    });
  }
});

export default {};
