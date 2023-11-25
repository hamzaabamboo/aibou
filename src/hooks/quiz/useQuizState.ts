import { useState } from 'react'

import { QuizData } from 'types/quizData'

import { useQuizData } from './useQuizData'

export interface QuizStateProps<Q, A = string> {
  quizId: string
  getNewQuestion: () => Promise<Q | undefined>
  getAnswers: (question: Q) => A[]
  checkAnswer?: (answerKey: A[], answer: A) => boolean
  defaultAnswer?: A
}
export const useQuizState = <Q, A = string>(props: QuizStateProps<Q, A>) => {
  const {
    quizId,
    getNewQuestion,
    getAnswers,
    checkAnswer,
    defaultAnswer = ''
  } = props
  const [answer, setAnswer] = useState<A>(defaultAnswer as A)
  const [showAnswer, setShowAnswer] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Q>()
  const [{ data: quizData }, { mutate: updateQuizData }] =
    useQuizData<Q>(quizId)
  const [isLoadingQuestion, setLoadingQuestion] = useState(false)

  const answerKey = currentQuestion ? getAnswers(currentQuestion) : []
  const isCorrectAnswer =
    !!currentQuestion &&
    !!answerKey &&
    (checkAnswer?.(answerKey, answer) ?? answerKey.includes(answer))
  const win = !!currentQuestion && isCorrectAnswer
  const giveUp = !!currentQuestion && !isCorrectAnswer && showAnswer
  const ended = win || giveUp

  const resetQuestion = () => {
    setCurrentQuestion(undefined)
    setShowAnswer(false)
    setAnswer(defaultAnswer as A)
  }

  const nextQuestion = async (submitAnswer = true) => {
    if (isLoadingQuestion) return
    setLoadingQuestion(true)
    try {
      if (submitAnswer && currentQuestion && quizData) {
        const newData: QuizData<Q> = {
          ...quizData,
          recentQuestions: [
            { question: currentQuestion, isCorrect: isCorrectAnswer },
            ...quizData.recentQuestions
          ].slice(0, 30),
          recentIncorrect: isCorrectAnswer
            ? quizData.recentIncorrect
            : [
                { question: currentQuestion, isCorrect: isCorrectAnswer },
                ...quizData.recentIncorrect
              ].slice(0, 30),
          stats: {
            correct: quizData.stats.correct + (isCorrectAnswer ? 1 : 0),
            skipped: quizData.stats.skipped + (!isCorrectAnswer ? 1 : 0)
          }
        }
        await updateQuizData(newData)
      }
      const theNextQuestion = await getNewQuestion()
      resetQuestion()
      setCurrentQuestion(theNextQuestion)
    } finally {
      setLoadingQuestion(false)
    }
  }

  const skipQuestion = async () => {
    await nextQuestion()
  }

  const resetStats = async () => {
    if (!quizData) return
    await updateQuizData({ ...quizData, stats: { correct: 0, skipped: 0 } })
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
    nextQuestion,
    skipQuestion,
    resetQuestion,
    quizData,
    resetStats
  }
}
