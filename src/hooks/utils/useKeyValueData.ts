import {
  type UseMutationResult, type UseQueryResult, useMutation, useQuery, useQueryClient
} from '@tanstack/react-query'
import { useDBContext } from '../contexts/useDBContext'

export const useKeyValueData = <T extends object | string | number | boolean>(
  key: string,
  defaultValue: T
) => {
  const { db } = useDBContext()
  const queryClient = useQueryClient()
  const data = useQuery(['fetchKeyData', key], async () => {
    try {
      const data = await db?.keyValues.get(key)
      if (data == null) {
        await db?.keyValues.add({ key, value: defaultValue })
        return defaultValue
      }
      return data.value
    } catch (error) {
      await db?.keyValues.add({ key, value: defaultValue })
      return defaultValue
    }
  })

  const setData = useMutation(
    async (data: T) => {
      await db?.keyValues.update(key, { key, value: data })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['fetchKeyData', key])
      }
    }
  )

  return [data ?? {}, setData ?? {}] as [UseQueryResult<T>, UseMutationResult]
}
