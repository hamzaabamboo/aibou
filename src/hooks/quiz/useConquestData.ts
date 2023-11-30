import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useDBContext } from 'hooks/contexts/useDBContext'
import { ConquestData, QuestionScore } from 'types/conquestData'

export const useConquestData = <T = Record<string, unknown>>(
  quizId: string
) => {
  const { db } = useDBContext()
  const queryClient = useQueryClient()
  const conquestData = useQuery<ConquestData<T>>({
    queryKey: ['fetchConquestData', quizId],
    queryFn: async () => {
      const defaultQuiz: ConquestData<T> = {
        id: quizId,
        queue: []
      }
      try {
        const data = (await db?.conquest.get(
          quizId
        )) as unknown as ConquestData<T>
        if (data == null) {
          await db?.conquest.add(defaultQuiz as ConquestData)
          return defaultQuiz
        }
        return data ?? defaultQuiz
      } catch (error) {
        await db?.conquest.add(defaultQuiz as ConquestData)
        return defaultQuiz
      }
    },
    enabled: !!db && !!quizId
  })

  const editConquestData = useMutation({
    mutationFn: async (data: QuestionScore<T>[]) => {
      if (!quizId) return
      await db?.conquest.update(quizId, { queue: data, id: quizId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fetchConquestData', quizId] })
    }
  })

  return [conquestData ?? {}, editConquestData ?? {}] as const
}
