import React, { createContext, useCallback, useEffect, useState } from 'react'
import { type JishoWord } from '../../types/jisho'

interface RunSQLParams {
  query: string
  variables?: Record<string, unknown>
}

export interface OfflineDictionary {
  worker?: Worker
  runSQL?: (params: RunSQLParams) => Promise<Array<{ columns: any[], values: any[] }>>
  searchTerms?: (params: string[]) => Promise<Array<{ word: string, results: JishoWord[] }>>
  isBusy?: boolean
}
export const OfflineDictionaryContext = createContext<OfflineDictionary>({})

export const OfflineDictionaryProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
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

  const searchTerms = useCallback(async (params: string[]) => {
    return await new Promise<Array<{ word: string, results: JishoWord[] }>>((resolve) => {
      if (isBusy) throw new Error('Worker is busy')
      if (!worker) return
      worker.postMessage({
        type: 'searchWords',
        data: params
      })
      worker.onmessage = ({ data }) => {
        data.type === 'searchWordsResult' && resolve(data.data)
      }
    })
  }, [worker])

  const runSQL = useCallback(
    async (params: RunSQLParams) => {
      if (isBusy) throw new Error('Worker is busy')
      try {
        const res = await new Promise<Array<{ columns: any[], values: any[] }>>((resolve, reject) => {
          if (!worker) return
          setBusy(true)
          worker.postMessage({
            type: 'runSQL',
            data: params
          })

          worker.onmessage = ({ data }) => {
            data.type === 'runSQLResult' && resolve(data.data)
            data.type === 'runSQLError' && reject(data.data)
          }
        })
        return res
      } finally {
        setBusy(false)
      }
    }, [worker])

  return (
    <OfflineDictionaryContext.Provider value={{ worker, runSQL, searchTerms }}>
      {children}
    </OfflineDictionaryContext.Provider>
  )
}
