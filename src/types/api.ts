// import { type JishoWord } from './jisho'

// interface OldSearchAPIResults {
//   results: JishoWord[]
// }

export type SearchApiResults = {
  word_id: string
  kanji: string
  reading: string
  dictionary_id: number
  heading: string
  id: number
  text: string
}[]
