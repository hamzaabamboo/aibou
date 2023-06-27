export interface QuizData<T = Record<string, unknown> > {
  id: string
  recentQuestions: Array<QuizAnswer<T>>
  recentIncorrect: Array<QuizAnswer<T>>
  stats: {
    correct: number
    skipped: number
  }
}

export interface QuizAnswer<T = Record<string, unknown>> {
  question: T
  isCorrect: boolean
}