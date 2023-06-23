import { Stack } from '@chakra-ui/react'
import { type JishoWord } from '../../types/jisho'
import { type KanjiData } from '../../types/kanji'
import {
  type KankenGrade,
  type KankenKanjiData,
  type KankenWordData,
  type KankenYojijukugoData
} from '../../types/kanken'
import { KanjiDisplay } from '../jisho/KanjiDisplay'
import { SearchResultItem } from '../jisho/SearchResultItem'
import { KanjiInfo } from './KanjiInfo'

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
  answerExplanations?: KanjiData[]
}
export const KankenQuestion = (props: KankenQuestionProps) => {
  const { questionData, currentQuestion, showAnswer = false, answerExplanations, type, mode } = props
  if (type === 'word' || type === 'yojijukugo') {
    const question = currentQuestion?.data as KankenWordData
    return (
    <Stack alignItems="center">
      {currentQuestion && (
        <KanjiDisplay
          data={{
            reading: !showAnswer && mode === 'reading' ? '' : question.reading,
            word: showAnswer || mode === 'reading'
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
  const question = currentQuestion?.data as KankenWordData
  return (
      <Stack alignItems="center">
        {currentQuestion && (
          <KanjiDisplay
            data={{
              reading: !showAnswer && mode === 'reading' ? '' : question.reading,
              word: showAnswer || mode === 'reading'
                ? question.word
                : question.word?.replaceAll(/./g, '＿')
            }}
          />
        )}
        {answerExplanations && (
          <KanjiInfo data={answerExplanations[0]} hideCharacter={mode === 'writing' ? !showAnswer : false} hideReadings={ mode === 'reading' ? !showAnswer : false} hideOtherInfo={!showAnswer}/>
        )}
      </Stack>
  )
}
