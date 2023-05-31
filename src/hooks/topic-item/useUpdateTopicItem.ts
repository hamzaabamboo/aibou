import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type TopicItem } from '../../types/topic'
import { useDBContext } from '../contexts/useDBContext'

export const useUpdateTopicItem = () => {
  const { db } = useDBContext()
  const queryClient = useQueryClient()
  return useMutation(
    async (data: Partial<TopicItem>) => {
      const { id, topicId } = data
      if (!id || !topicId) return
      await db?.topicEntries.update(id, {
        ...data,
        lastUpdatedAt: new Date()
      })

      const topicIdNumber = Number(topicId)
      await db?.topics.update(isNaN(topicIdNumber) ? topicId : topicIdNumber, {
        lastUpdatedAt: new Date()
      })
      return topicId
    },
    {
      onSuccess: (topicId) => {
        queryClient.invalidateQueries(['fetchTopic', topicId])
        queryClient.invalidateQueries(['fetchTopicItems', topicId])
      }
    }
  )
}
