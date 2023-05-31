import React, { createContext, useEffect, useState } from 'react'
import { type AibouDB, initDexie } from '../../utils/db/db'

export interface DBContextData {
  isLoading?: boolean
  isInitialized?: boolean
  db?: AibouDB
}
export const DBContext = createContext<DBContextData>({})

export const DBContextProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const [isLoading, setLoading] = useState(false)
  const [db, setDB] = useState<AibouDB | undefined>()

  const initializeDB = async () => {
    setLoading(true)
    const db = await initDexie()
    setDB(db)
    setLoading(false)
    return db
  }

  useEffect(() => {
    initializeDB()
  }, [])

  return (
    <DBContext.Provider value={{ isLoading, isInitialized: !(db == null), db }}>
      {children}
    </DBContext.Provider>
  )
}
