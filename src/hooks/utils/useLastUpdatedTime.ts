import { useQuery } from '@tanstack/react-query'
import { max } from 'lodash'
import { db } from '../../utils/db/db'

export const useLastUpdatedTime = () => useQuery({
  queryKey: ['lastUpdatedData'],
  queryFn: async () => max([
    (
      await db?.topics.orderBy('lastUpdatedAt').last()
    )?.lastUpdatedAt.valueOf(),
    (
      await db?.topicEntries.orderBy('lastUpdatedAt').last()
    )?.lastUpdatedAt.valueOf()
  ])
})
