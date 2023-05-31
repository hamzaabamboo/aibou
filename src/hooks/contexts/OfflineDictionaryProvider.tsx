import React, { createContext, useEffect, useState } from 'react'

export interface OfflineDictionary {
  worker?: Worker
  performTask?: (postMessage: Parameters<Worker['postMessage']>, onMessage: Worker['onmessage']) => Promise<void>
}
export const OfflineDictionaryContext = createContext<OfflineDictionary>({})

export const OfflienDictionaryProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const [worker, setWorker] = useState<Worker>()
  const [isBusy, setStatus] = useState(false)

  useEffect(() => {
    const w = new Worker(
      new URL('../../workers/offline-search.worker.ts', import.meta.url)
    )
    setWorker(w)
    return () => {
      w.terminate()
    }
  }, [])

  // TODO: Some kind of wrapper;
  const performTask = (postMessage: Parameters<Worker['postMessage']>, onMessage: Worker['onmessage']) => {
  }

  return (
    <OfflineDictionaryContext.Provider value={{ worker }}>
      {children}
    </OfflineDictionaryContext.Provider>
  )
}
