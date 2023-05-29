import Dexie, { Table } from 'dexie';

export class DictionaryDB extends Dexie {
  database!: Table<{ id: string, data: ArrayBuffer}>;

  constructor() {
    super('aibou-app-dictionary');
    this.version(1).stores({
      database: '&id',
    });
  }
}

export let dictionaryDB: DictionaryDB | undefined;

export const initDictionaryDB = async () => {
  dictionaryDB = new DictionaryDB();
  await dictionaryDB.open();
  return dictionaryDB;
};
