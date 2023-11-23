import { useMutation, useQueryClient } from '@tanstack/react-query'

import { type TopicItem } from '../../types/topic'
import { useDBContext } from '../contexts/useDBContext'

export const useUpdateTopicItem = () => {
  const { db } = useDBContext()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<TopicItem>) => {
      const { id, topicId } = data
      if (!id || !topicId) return
      await db?.topicEntries.update(id, {
        ...data,
        lastUpdatedAt: new Date()
      })

      const topicIdNumber = Number(topicId)
      await db?.topics.update(
        Number.isNaN(topicIdNumber) ? topicId : topicIdNumber,
        {
          lastUpdatedAt: new Date()
        }
      )
      return topicId
    },
    onSuccess: (topicId) => {
      queryClient.invalidateQueries({ queryKey: ['fetchTopic', topicId] })
      queryClient.invalidateQueries({ queryKey: ['fetchTopicItems', topicId] })
    }
  })
}
