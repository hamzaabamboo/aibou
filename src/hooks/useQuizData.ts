import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type QuizData } from '../types/quizData'
import { useDBContext } from './contexts/useDBContext'

export const useQuizData = <T = Record<string, unknown>>(quizId: string) => {
  const { db } = useDBContext()
  const queryClient = useQueryClient()
  const quizData = useQuery<QuizData<T>>({
    queryKey: ['fetchQuizData', quizId],
    queryFn: async () => {
      const defaultQuiz: QuizData<T> = { id: quizId, recentQuestions: [], recentIncorrect: [], stats: { correct: 0, skipped: 0 } }
      try {
        const data = await db?.quiz.get(quizId) as unknown as QuizData<T>
        if (data == null) {
          await db?.quiz.add(defaultQuiz as QuizData)
          return defaultQuiz
        }
        return data ?? defaultQuiz
      } catch (error) {
        await db?.quiz.add(defaultQuiz as QuizData)
        return defaultQuiz
      }
    },
    enabled: !!db
  })

  const editQuizData = useMutation(
    {
      mutationFn: async (data: QuizData<T>) => {
        await db?.quiz.update(quizId, { ...data, id: quizId })
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['fetchQuizData', quizId] })
      }
    }
  )

  return [quizData ?? {}, editQuizData ?? {}] as [typeof quizData, typeof editQuizData]
}
