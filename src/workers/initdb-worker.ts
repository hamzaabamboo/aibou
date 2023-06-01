import axios from 'axios'
import pako from 'pako'
import { initDictionaryDB, type DictionaryDB } from '../utils/db/dictionary-db'

const JMDICT_FILE = `/${encodeURIComponent(
    'offline-dict.sqlite.gz'
  )}`

const indexedDB: DictionaryDB | undefined = undefined

const downloadDatabase = async () => {
  postMessage({
    type: 'message',
    value: 'Downloading database'
  })
  const { data: downloadData } = await axios.get(JMDICT_FILE, {
    responseType: 'arraybuffer',
    onDownloadProgress: (progress: ProgressEvent) => {
      postMessage({
        type: 'downloadProgress',
        value: Math.floor((progress.loaded / progress.total) * 100) / 100
      })
    }
  })

  postMessage({
    type: 'message',
    value: 'Decompressing'
  })
  const decompress = pako.inflate(downloadData as ArrayBuffer)
  return decompress
}

const checkIfDownloaded = async () => {
  const db = (indexedDB != null) ? indexedDB : await initDictionaryDB()
  const data = await db.database.where({ id: 'latest' }).count()
  if (data) return true
}

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
  const file = await downloadDatabase()
  await db.database.add({ id: 'latest', data: file.buffer })
  return file
}

const deleteDictionaryFile = async () => {
  const db = (indexedDB != null) ? indexedDB : await initDictionaryDB()
  await db.database.delete('latest')
}

export type WorkerActions = 'download' | 'check' | 'error' | 'delete'
export interface WorkerMessage {
  type: WorkerActions
  data: any
}

export type WorkerResponseType = 'checkResult' | 'message' | 'downloadProgress'
export interface WorkerResponse {
  type: WorkerResponseType
  value: any
}

addEventListener('message', async ({ type, data }: MessageEvent<WorkerMessage>) => {
  switch (data.type) {
    case 'download': {
      console.log('Downlaod LAH!!!!')
      await loadDictionaryFile()
      const res = await checkIfDownloaded()
      postMessage({
        type: 'checkResult',
        value: res
      })
      break
    }
    case 'delete': {
      await deleteDictionaryFile()
      const res = await checkIfDownloaded()
      postMessage({
        type: 'checkResult',
        value: res
      })
      break
    }
    case 'check': {
      const res = await checkIfDownloaded()
      postMessage({
        type: 'checkResult',
        value: res
      })
      break
    }
  }
})
