import { useQuery } from '@tanstack/react-query'
import { useDBContext } from './contexts/useDBContext'

export const useLastUpdatedTopics = () => {
  const { db } = useDBContext()
  return useQuery(['fetchLastUpdatedTopics'], async () => {
    const data = await (
      await db?.topics.orderBy('lastUpdatedAt').reverse().limit(3).toArray()
    )?.values()
    return Array.from(data ?? []).filter(d => !d.isDeleted)
  }, { enabled: !!db })
}
