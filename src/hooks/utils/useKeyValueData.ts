import {
  useMutation,
  type UseMutationResult,
  useQuery,
  useQueryClient,
  type UseQueryResult
} from '@tanstack/react-query'

import { initDexie } from 'utils/db/db'

import { useDBContext } from '../contexts/useDBContext'

export const useKeyValueData = <T extends object | string | number | boolean>(
  key: string,
  defaultValue: T
) => {
  const { db } = useDBContext()
  const queryClient = useQueryClient()
  const data = useQuery<T>({
    queryKey: ['fetchKeyData', key],
    queryFn: async () => {
      const database = db ?? (await initDexie())
      try {
        const storedData = await database?.keyValues.get(key)
        if (storedData == null) {
          await database?.keyValues.add({ key, value: defaultValue })
          return defaultValue
        }
        return (storedData.value as T) ?? defaultValue
      } catch (error) {
        await database?.keyValues.add({ key, value: defaultValue })
        return defaultValue
      }
    },
    enabled: db !== undefined,
    refetchOnWindowFocus: true
  })

  if (data.error) {
    console.log(data.error)
  }

  const setData = useMutation({
    mutationFn: async (newData: T) => {
      await db?.keyValues.update(key, { key, value: newData })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fetchKeyData', key] })
    }
  })

  return [data ?? {}, setData ?? {}] as [UseQueryResult<T>, UseMutationResult]
}
