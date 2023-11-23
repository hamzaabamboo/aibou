import React, { createContext, useEffect, useMemo, useState } from 'react'

import { type AibouDB, initDexie } from '../../utils/db/db'

export interface DBContextData {
  isLoading?: boolean
  isInitialized?: boolean
  db?: AibouDB
}
export const DBContext = createContext<DBContextData>({})

export function DBContextProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setLoading] = useState(false)
  const [db, setDB] = useState<AibouDB | undefined>()

  const initializeDB = async () => {
    setLoading(true)
    const newDb = await initDexie()
    setDB(newDb)
    setLoading(false)
    return newDb
  }

  useEffect(() => {
    initializeDB()
  }, [])

  const context = useMemo(
    () => ({ isLoading, isInitialized: !(db == null), db }),
    [db, isLoading]
  )

  return <DBContext.Provider value={context}>{children}</DBContext.Provider>
}
