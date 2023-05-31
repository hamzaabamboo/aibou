import { useContext } from 'react'
import { DBContext } from './DBContext'

export const useDBContext = () => useContext(DBContext)
