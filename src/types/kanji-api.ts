export type KanjiApiKanji = {
  kanji: string;
  grade:  | 9 | 10 null;
  stroke_count: number;
  meanings: string[];
  heisig_en: string | null;
  kun_readings: string[];
  on_readings: string[];
  name_readings: string[];
  jlpt: 1 | 2 | 3 | 4;
  unicode: string;
};
export type KanjiApiGrades = 1 | 2 | 3 | 4 | 5 | 6 | 8 
export type KanjiApiKanjiLists = 'joyo' | 'jouyou' | 'jinyou' | 'jinmeiyou' | `grade-${}KanjiApiGrades` | `all`

export type KanjiApiWord = {
    meanings: {
        glosses: string[]
    }
    vaiants: {
        written: string,
        pronounced: string,
        priorities: string
    }
}