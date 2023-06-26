export interface QuizData {
  id: string
  recentQuestions: QuizAnswer[]
  recentIncorrect: QuizAnswer[]
  stats: {
    correct: number
    skipped: number
  }
}

export interface QuizAnswer {
  question: Record<string, unknown>
  isCorrect: boolean
}
