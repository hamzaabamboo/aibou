declare module "js-untar" {
  function untar(buffer: ArrayBuffer): Promise<Uint8Array[]>;
  export = untar;
}

declare module "absurd-sql" {
  class SQLiteFS {
    constructor(fs: any, backend: any) {}
  }
  export { SQLiteFS };
}

declare module "absurd-sql/dist/indexeddb-backend" {
  export = class IndexedDBBackend {

  }
}

declare module 'absurd-sql/dist/indexeddb-main-thread' {
  function initBackend(worker: any): void
  export {
    initBackend
  };
}

