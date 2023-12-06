import { shuffle } from 'lodash'
import { QuestionScore } from 'types/conquestData'

const randInt = (min: number, max: number) =>
  Math.round(Math.random() * (max - min)) + min

export class QuestionModel<QuestionType> {
  static INTERVAL = 5

  static GRADUATE_LEVEL = 3

  private queue: QuestionScore<QuestionType>[] = []

  private learnedItems: QuestionScore<QuestionType>[] = []

  constructor(
    private questions: QuestionType[],
    private mode: 'normal' | 'random' | 'conquest' = 'normal',
    saveData:
      | {
          queue: QuestionScore<QuestionType>[]
          learned?: QuestionScore<QuestionType>[]
        }
      | undefined = undefined,
    private onSaveData?: (
      queue: QuestionScore<QuestionType>[],
      learned: QuestionScore<QuestionType>[]
    ) => void
  ) {
    this.initializeQueue(saveData)
  }

  static getData<QuestionType>(question: QuestionScore<QuestionType>) {
    return question?.data
  }

  private handleSave() {
    // console.log(
    //   this.queue
    //     .map((t) => `${t.data.question}(${t.level})`)

    //     .join(',')
    // )
    this.onSaveData?.(this.queue, this.learnedItems)
  }

  initializeQueue(dataToLoad?: {
    queue?: QuestionScore<QuestionType>[]
    learned?: QuestionScore<QuestionType>[]
  }) {
    if (dataToLoad?.queue && dataToLoad?.queue?.length > 0) {
      this.queue = dataToLoad.queue
      this.learnedItems = dataToLoad.learned ?? []
    } else {
      this.queue = shuffle(this.questions.map((data) => ({ level: 0, data })))
      this.learnedItems = []
    }
  }

  nextQuestion() {
    const question = this.queue.shift()
    if (!question) return
    this.queue.splice(randInt(0, this.queue.length), 0, question)
    this.handleSave()
  }

  correctAnswer() {
    if (this.mode === 'random') {
      this.nextQuestion()
      return
    }
    const question = this.queue.shift()
    if (!question) {
      this.handleSave()
      return
    }
    if (this.mode === 'conquest') {
      if (
        question.level === 0 ||
        question.level >= QuestionModel.GRADUATE_LEVEL
      ) {
        this.handleSave()
        this.learnedItems.push(question)
        return
      }
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
    } else {
      this.queue.splice(
        randInt(question.level + 1 * QuestionModel.INTERVAL, this.queue.length),
        0,
        question
      )
    }
    this.handleSave()
  }

  wrongAnswer() {
    if (this.mode === 'random') {
      this.nextQuestion()
      return
    }
    const question = this.queue.shift()
    if (!question) return
    question.level = question.level === 0 ? 1 : Math.min(1, question.level - 1)
    this.queue.splice(randInt(3, 3 + QuestionModel.INTERVAL), 0, question)
    this.handleSave()
  }

  currentQuestion() {
    return QuestionModel.getData(this.queue[0])
  }

  upcomingQuestion() {
    return QuestionModel.getData(this.queue[1])
  }

  size() {
    return this.questions.length
  }

  remaining() {
    return this.queue.length
  }

  learning() {
    return this.queue
      .filter((q) => q.level > 0 && q.level <= QuestionModel.GRADUATE_LEVEL)
      .sort((b, a) => b.level - a.level)
      .map(QuestionModel.getData)
  }

  learned() {
    return this.learnedItems.map(QuestionModel.getData)
  }

  reset() {
    this.initializeQueue()
    this.handleSave()
  }
}
