import { useState } from 'react'

export interface QuizStateProps<Q, A = string> {
  getAnswers: (question: Q) => A[]
  checkAnswer?: (answerKey: A[], answer: A) => boolean
  defaultAnswer?: A
}
export const useQuizState = <Q, A = string>(props: QuizStateProps<Q, A>) => {
  const { getAnswers, checkAnswer, defaultAnswer = '' } = props
  const [answer, setAnswer] = useState<A>(defaultAnswer as A)
  const [showAnswer, setShowAnswer] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Q>()

  const answerKey = currentQuestion ? getAnswers(currentQuestion) : []
  const isCorrectAnswer = !!currentQuestion && !!answerKey && (checkAnswer?.(answerKey, answer) ?? answerKey.includes(answer))
  const win = !!currentQuestion && isCorrectAnswer
  const giveUp = !!currentQuestion && !isCorrectAnswer && showAnswer
  const ended = win || giveUp

  const resetQuestion = () => {
    setCurrentQuestion(undefined)
    setShowAnswer(false)
    setAnswer(defaultAnswer as A)
  }

  return {
    answer,
    setAnswer,
    showAnswer,
    setShowAnswer,
    currentQuestion,
    setCurrentQuestion,
    isCorrectAnswer,
    answerKey,
    win,
    giveUp,
    ended,
    resetQuestion
  }
}
