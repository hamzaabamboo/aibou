import { atom, useAtom } from 'jotai'

interface AppState {
  isStoragePersistant?: boolean
}
const appStore = atom<AppState>({})

export const useAppState = () => useAtom(appStore)
