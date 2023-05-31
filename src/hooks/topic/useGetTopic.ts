import { useQuery } from '@tanstack/react-query'
import { type Topic } from '../../types/topic'
import { useDBContext } from '../contexts/useDBContext'

export const useGetTopic = (topicId: string) => {
  const { db } = useDBContext()
  return useQuery(
    ['fetchTopic', topicId],
    async (): Promise<Topic | undefined> => {
      const idNumber = Number(topicId)
      try {
        const data = (await db?.topics.get(topicId)) ??
     (!isNaN(idNumber) ? (await db?.topics.get(idNumber)) : undefined) ??
        undefined
        return data
      } catch (error) {
        return undefined
      }
    },
    { enabled: !!topicId && (db !== null) }
  )
}