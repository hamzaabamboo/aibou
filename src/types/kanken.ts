export type KankenGrade = '1' | '1-5' | '2' | '2-5' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'
export interface KankenWordData { reading?: string, word?: string }
export interface KankenKanjiData { onyomi?: string, kunyomi?: string, kanji?: string, example?: KankenWordData[] }
export interface KankenYojijukugoData { word: string, reading: string, meaning?: string }
export interface KankenGradeData {
  kanji?: KankenKanjiData[]
  yojijukugo?: KankenYojijukugoData[]
}

export type KankenData = Record<KankenGrade, KankenGradeData>
