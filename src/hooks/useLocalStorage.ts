import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState
} from 'react'

import { LocalStorage } from '../utils/localStorage'

export const useLocalStorage = function <T>(
  key: string,
  initial: T | null = null
): [T | null, Dispatch<SetStateAction<T | null>>] {
  const storage = useRef(new LocalStorage<T>(key))
  const [data, setData] = useState<T | null>(initial)

  const setNewData: Dispatch<SetStateAction<T | null>> = (
    s: SetStateAction<T | null>
  ) => {
    const newData = typeof s === 'function' ? (s as any).call(s, data) : s
    storage.current.value = newData
    setData(newData)
  }

  const updateValue = (updateKey: string) => (storageEvent: StorageEvent) => {
    if (storageEvent.key === updateKey) {
      setData(JSON.parse(storageEvent.newValue ?? ''))
    }
  }

  useEffect(() => {
    setNewData(storage.current.value ?? initial)
  }, [])

  useEffect(() => {
    window.addEventListener('storage', updateValue(key))
    return () => {
      window.removeEventListener('storage', updateValue(key))
    }
  }, [key])

  return [data, setNewData]
}
