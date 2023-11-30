import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'

import { type JishoWord } from '../../types/jisho'

interface RunSQLParams {
  query: string
  variables?: Record<string, unknown>
}

export interface OfflineDictionary {
  worker?: Worker
  runSQL?: (
    params: RunSQLParams
  ) => Promise<Array<{ columns: any[]; values: any[] }>>
  searchTerms?: (
    params: string[]
  ) => Promise<Array<{ word: string; results: JishoWord[] }>>
  isBusy?: boolean
}
export const OfflineDictionaryContext = createContext<OfflineDictionary>({})

export function OfflineDictionaryProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [worker, setWorker] = useState<Worker>()
  const [isBusy, setBusy] = useState(false)

  useEffect(() => {
    const w = new Worker(
      new URL('../../workers/offline-search.worker.ts', import.meta.url)
    )
    setWorker(w)
    return () => {
      w.terminate()
    }
  }, [])

  const searchTerms = useCallback(
    async (params: string[]) =>
      new Promise<Array<{ word: string; results: JishoWord[] }>>((resolve) => {
        if (isBusy) throw new Error('Worker is busy')
        if (!worker) throw new Error('Not Ready')
        worker.postMessage({
          type: 'searchWords',
          data: params
        })
        worker.onmessage = ({ data }) => {
          if (data.type === 'searchWordsResult') {
            resolve(data.data)
            setBusy(false)
          }
        }
      }),
    [worker, isBusy]
  )

  const runSQL = useCallback(
    async (params: RunSQLParams) => {
      if (isBusy) throw new Error('Worker is busy')
      try {
        const res = await new Promise<Array<{ columns: any[]; values: any[] }>>(
          (resolve, reject) => {
            if (!worker) return
            setBusy(true)
            worker.postMessage({
              type: 'runSQL',
              data: params
            })

            worker.onmessage = ({ data }) => {
              if (data.type === 'runSQLResult') {
                resolve(data.data)
              } else if (data.type === 'runSQLError') {
                reject(data.data)
              }
            }
          }
        )
        return res
      } finally {
        setBusy(false)
      }
    },
    [worker, isBusy]
  )

  const contexts = useMemo(
    () => ({ worker, runSQL, searchTerms }),
    [worker, runSQL, searchTerms]
  )

  return (
    <OfflineDictionaryContext.Provider value={contexts}>
      {children}
    </OfflineDictionaryContext.Provider>
  )
}
