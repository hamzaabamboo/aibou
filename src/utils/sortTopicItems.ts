import sortBy from 'lodash/sortBy'
import { type TopicItem } from '../types/topic'

export type SortTopicItemsBy = 'word' | 'createdAt'
export const sortTopicItems = (orderBy?: SortTopicItemsBy, isReversed?: boolean) => (data: TopicItem[]) => {
  if (!data) return []
  if (!sortBy) return data
  let r: TopicItem[] = []
  switch (orderBy) {
    case 'word':
      r = sortBy(data, (i) => i.word)
      break
    case 'createdAt':
      r = sortBy(data, (i) => i.createdAt)
      break
  }
  if (isReversed) return r?.reverse()
  return r
}
