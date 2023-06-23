import groupBy from 'lodash/groupBy'
import { type KanjiData } from '../../types/kanji'

export const parseKanjiSQLResult = (sqlResult: { columns: any[], values: any[] }): KanjiData => {
  const results = sqlResult.values.map((r) => {
    const [
      kanji,
      type,
      readings,
      id,
      meanings,
      radicals,
      jlptLevel,
      grade,
      radicalName,
      frequency,
      strokeCounts
    ] = r
    return {
      kanji,
      type,
      readings,
      id,
      radicals,
      meanings,
      jlptLevel,
      grade,
      radicalName,
      frequency,
      strokeCounts
    }
  }) ?? []
  const { kanji, jlptLevel, grade, radicals, radicalName, frequency, strokeCounts } =
      results[0]
  return {
    kanji,
    onyomi: results.find((r) => r.type === 'ja_on')?.readings,
    kunyomi: results.find((r) => r.type === 'ja_kun')?.readings,
    meanings: Object.values(groupBy(results, 'id')).map(
      (i) => i[0].meanings
    ),
    jlptLevel,
    grade,
    radicals,
    radicalName,
    frequency,
    strokeCounts
  }
}
