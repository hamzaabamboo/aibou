import {
  useMutation, useQuery, useQueryClient,
  type UseMutationResult, type UseQueryResult
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
        const data = await db?.keyValues.get(key)
        if (data == null) {
          await db?.keyValues.add({ key, value: defaultValue })
          return defaultValue
        }
        return data.value as T ?? defaultValue
      } catch (error) {
        await db?.keyValues.add({ key, value: defaultValue })
        return defaultValue
      }
    },
    enabled: !!db
  })

  const setData = useMutation(
    {
      mutationFn: async (data: T) => {
        await db?.keyValues.update(key, { key, value: data })
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['fetchKeyData', key] })
      }
    }
  )

  return [data ?? {}, setData ?? {}] as [UseQueryResult<T>, UseMutationResult]
}
