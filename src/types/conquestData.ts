export interface QuestionScore<Q> {
  level: number
  data: Q
}

export interface ConquestData<Q = unknown> {
  id: string
  queue: QuestionScore<Q>[]
  learned?: QuestionScore<Q>[]
}
