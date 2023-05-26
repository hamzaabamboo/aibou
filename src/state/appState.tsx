import { atom, useAtom } from 'jotai';

type AppState = {
  isStoragePersistant?: boolean;
};
const appStore = atom<AppState>({});

export const useAppState = () => useAtom(appStore);
