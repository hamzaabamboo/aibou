import { useMutation, useQueryClient } from '@tanstack/react-query'
import { nanoid } from 'nanoid'
import { useDBContext } from '../contexts/useDBContext'

export const useAddTopic = () => {
  const { db } = useDBContext()
  const queryClient = useQueryClient()
  return useMutation(
    async (data: { name: string, description?: string }) => {
      try {
        await db?.topics.add({
          ...data,
          id: nanoid(5),
          createdAt: new Date(),
          lastUpdatedAt: new Date()
        })
      } catch (e) {
        console.error('Error adding')
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['fetchTopicsList'])
      }
    }
  )
}
