import { useQuery } from '@tanstack/react-query'

import { useDBContext } from '../contexts/useDBContext'

export const useGetTopicsList = () => {
  const { db } = useDBContext()
  return useQuery({
    queryKey: ['fetchTopicsList'],
    queryFn: async () => {
      const data = await db?.topics.orderBy('lastUpdatedAt').reverse().toArray()
      return (data ?? []).filter((f) => !f.isDeleted)
    },
    enabled: db !== undefined
  })
}
