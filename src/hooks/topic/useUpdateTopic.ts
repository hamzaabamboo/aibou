import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type Topic } from '../../types/topic'
import { useDBContext } from '../contexts/useDBContext'

export const useUpdateTopic = (topicId: string) => {
  const { db } = useDBContext()
  const queryClient = useQueryClient()
  return useMutation(

    {
      mutationFn: async (data: Partial<Topic>) => {
        const idNumber = Number(topicId)
        await db?.topics.update(isNaN(idNumber) ? topicId : idNumber, {
          ...data,
          lastUpdatedAt: new Date()
        })
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['fetchTopic', topicId] })
      }
    }
  )
}
