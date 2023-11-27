import { shuffle } from 'lodash'

const randInt = (min: number, max: number) =>
  Math.round(Math.random() * (max - min)) + min
interface QuestionScore<Q> {
  level: number
  data: Q
}
export class QuestionModel<QuestionType> {
  static INTERVAL = 5

  static GRADUATE_LEVEL = 3

  private queue: QuestionScore<QuestionType>[] = []

  constructor(
    questions: QuestionType[],
    private mode: 'normal' | 'random' | 'conquest' = 'normal'
  ) {
    this.queue = shuffle(questions.map((data) => ({ level: 0, data })))
  }

  static getData<QuestionType>(question: QuestionScore<QuestionType>) {
    return question.data
  }

  nextQuestion() {
    const question = this.queue.shift()
    if (!question) return
    this.queue.splice(randInt(0, this.queue.length), 0, question)
  }

  correctAnswer() {
    if (this.mode === 'random') {
      this.nextQuestion()
      return
    }
    const question = this.queue.shift()
    if (!question) return
    if (this.mode === 'conquest') {
      if (
        question.level === 0 ||
        question.level === QuestionModel.GRADUATE_LEVEL - 1
      )
        return
      question.level += 1
      this.queue.splice(
        randInt(
          question.level - 1 * QuestionModel.INTERVAL,
          Math.max(
            question.level + 1 * QuestionModel.INTERVAL,
            this.queue.length
          )
        ),
        0,
        question
      )
      return
    }
    this.queue.splice(
      randInt(question.level + 1 * QuestionModel.INTERVAL, this.queue.length),
      0,
      question
    )
  }

  wrongAnswer() {
    if (this.mode === 'random') {
      this.nextQuestion()
      return
    }
    const question = this.queue.shift()
    if (!question) return
    if (this.mode === 'conquest') {
      question.level = 1
    }
    this.queue.splice(randInt(0, QuestionModel.INTERVAL), 0, question)
  }

  currentQuestion() {
    return QuestionModel.getData(this.queue[0])
  }

  size() {
    return this.queue.length
  }

  learning() {
    return this.queue
      .filter((q) => q.level !== 0 && q.level <= QuestionModel.GRADUATE_LEVEL)
      .map(QuestionModel.getData)
  }
}
