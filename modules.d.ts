declare module "js-untar" {
  function untar(buffer: ArrayBuffer): Promise<Uint8Array[]>;
  export = untar;
}
