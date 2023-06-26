import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type QuizData } from '../types/quizData'
import { useDBContext } from './contexts/useDBContext'

export const useQuizData = (quizId: string) => {
  const { db } = useDBContext()
  const queryClient = useQueryClient()
  const quizData = useQuery<QuizData>(['fetchQuizData', quizId], async () => {
    const defaultQuiz = { id: quizId, recentQuestions: [], recentIncorrect: [], stats: { correct: 0, skipped: 0 } }
    try {
      const data = await db?.quiz.get(quizId)
      if (data == null) {
        await db?.quiz.add(defaultQuiz)
        return defaultQuiz
      }
      return data ?? defaultQuiz
    } catch (error) {
      await db?.quiz.add(defaultQuiz)
      return defaultQuiz
    }
  }, { enabled: !!db })

  const editQuizData = useMutation(
    async (data: QuizData) => {
      await db?.quiz.update(quizId, { ...data, id: quizId })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['fetchQuizData', quizId])
      }
    }
  )

  return [quizData ?? {}, editQuizData ?? {}] as [typeof quizData, typeof editQuizData]
}
