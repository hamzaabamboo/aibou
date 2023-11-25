import { useQuery } from '@tanstack/react-query'

import { useDBContext } from 'hooks/contexts/useDBContext'

export const useLastUpdatedTopics = () => {
  const { db } = useDBContext()
  return useQuery({
    queryKey: ['fetchLastUpdatedTopics'],
    queryFn: async () => {
      const data = await (
        await db?.topics.orderBy('lastUpdatedAt').reverse().limit(3).toArray()
      )?.values()
      return Array.from(data ?? []).filter((d) => !d.isDeleted)
    },
    enabled: !!db
  })
}
