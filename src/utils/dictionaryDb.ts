import Dexie, { Table } from "dexie";
import {
  DictionaryGloss,
  DictionaryKana,
  DictionaryKanji,
  DictionarySense,
  DictionaryWord,
} from "../types/jmdict";

export class DictionaryDB extends Dexie {
  senses!: Table<DictionarySense>;
  kanjis!: Table<DictionaryKanji>;
  kanas!: Table<DictionaryKana>;
  words!: Table<DictionaryWord>;
  glosses!: Table<DictionaryGloss>;

  constructor() {
    super("aibou-app-dictionary");
    this.version(1).stores({
      words: "&id, *kanjiIds, *senseIds, *kanaIds",
      kanjis: "&id, wordId, text, common, *tags",
      kanas: "&id, wordId, text, common, *tags, *kanjiIds",
      senses: "&id, wordId, *glossesId",
      glosses: "&id, wordId, senseId, type, text",
    });
  }
}

export let dictionaryDB: DictionaryDB | undefined;

export const initDictionaryDB = async () => {
  dictionaryDB = new DictionaryDB();
  await dictionaryDB.open();
  return dictionaryDB;
};
