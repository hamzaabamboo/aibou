import { Stack } from '@chakra-ui/react'
import { type JishoWord } from '../../types/jisho'
import {
  type KankenGrade,
  type KankenKanjiData,
  type KankenWordData,
  type KankenYojijukugoData
} from '../../types/kanken'
import { KanjiDisplay } from '../jisho/KanjiDisplay'
import { SearchResultItem } from '../jisho/SearchResultItem'

export interface PracticeQuestion<Data extends KankenWordData | KankenKanjiData | KankenYojijukugoData = KankenWordData | KankenKanjiData | KankenYojijukugoData> {
  grade: KankenGrade
  kanji?: string
  data: Data
}

export interface KankenQuestionProps {
  type?: 'word' | 'kanji' | 'yojijukugo'
  mode?: 'reading' | 'writing'
  currentQuestion?: PracticeQuestion
  questionData?: JishoWord
  showAnswer?: boolean
}
export const KankenQuestion = (props: KankenQuestionProps) => {
  const { questionData, currentQuestion, showAnswer, type, mode } = props
  if (type === 'word') {
    const question = currentQuestion?.data as KankenWordData
    return (
    <Stack alignItems="center">
      {currentQuestion && (
        <KanjiDisplay
          data={{
            ...question,
            word: showAnswer
              ? question.word
              : question.word?.replaceAll(/./g, '＿')
          }}
        />
      )}
      {questionData && (
        <SearchResultItem
          isCard={false}
          item={{ ...questionData, japanese: [] }}
        />
      )}
    </Stack>
    )
  }
  return null
}
