import React, { createContext, useCallback, useEffect, useState } from 'react'

interface RunSQLParams {
  query: string
  variables?: Record<string, unknown>
}

export interface OfflineDictionary {
  worker?: Worker
  runSQL?: (params: RunSQLParams) => Promise<any[][]>
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

  const runSQL = useCallback(
    async (params: RunSQLParams) => {
      if (isBusy) throw new Error('Worker is busy')
      try {
        const res = await new Promise<any[][]>((resolve, reject) => {
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
    <OfflineDictionaryContext.Provider value={{ worker, runSQL }}>
      {children}
    </OfflineDictionaryContext.Provider>
  )
}
