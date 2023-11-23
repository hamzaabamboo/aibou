import orderBy from 'lodash/orderBy'

import { type JishoWord } from '../types/jisho'
import { similarity } from './stringSimilarity'

export const sortJishoReadings = (data: JishoWord, term: string): JishoWord => {
  const sortedReadings = term
    ? orderBy(
        data?.japanese,
        (w) =>
          Math.max(
            w.word ? similarity(w.word, term) : -Infinity,
            w.reading ? similarity(w.reading, term) : -Infinity
          ),
        'desc'
      )
    : data?.japanese
  return {
    ...data,
    japanese: sortedReadings
  }
}
