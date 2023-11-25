import {
  useMutation,
  type UseMutationResult,
  useQuery,
  useQueryClient,
  type UseQueryResult
} from '@tanstack/react-query'

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
      try {
        const storedData = await db?.keyValues.get(key)
        if (storedData == null) {
          await db?.keyValues.add({ key, value: defaultValue })
          return defaultValue
        }
        return (storedData.value as T) ?? defaultValue
      } catch (error) {
        await db?.keyValues.add({ key, value: defaultValue })
        return defaultValue
      }
    },
    enabled: !!db,
    refetchOnWindowFocus: false
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
