import groupBy from 'lodash/groupBy'
import sortBy from 'lodash/sortBy'
import uniq from 'lodash/uniq'
import values from 'lodash/values'
import { type SqlValue } from 'sql.js'

import { type JishoWord } from '../types/jisho'

export const parseOfflineDBResult = (
  data: Array<{ columns: string[]; values: SqlValue[][] }>,
  tags: Record<string, string>
): JishoWord[] => {
  const rows = data.map((d) => {
    const { columns, values: columnValues } = d
    return columnValues.map((v) =>
      Object.fromEntries(columns.map((c, cidx) => [c, v[cidx]]))
    )
  })
  const sortOrder = uniq(rows[0]?.map((r) => r.wordId))
  const words = sortBy(values(groupBy(rows[0], 'wordId')), (s) =>
    sortOrder.indexOf(s[0].wordId)
  ).map((entries) => {
    const jishoWord: JishoWord = {
      slug: entries[0].wordId as string,
      is_common: entries.some((i) => i.kanjiCommon) ? 'true' : 'false',
      japanese: values(groupBy(entries, (e) => `${e.kanji}-${e.kana}`)).map(
        (e) => ({ word: e[0].kanji as string, reading: e[0].kana as string })
      ),
      tags: [].map((t) => tags[t] ?? t),
      senses: values(groupBy(entries, 'senseId')).map((s) => {
        const sense = s[0] as any
        return {
          parts_of_speech: sense.partOfSpeech
            .split(',')
            .map((t: string) => tags[t] ?? t),
          tags:
            sense.field.split(',').map((t: string) => tags[t] ?? t) +
            (sense.misc?.split(',').map((t: string) => tags[t] ?? t) ?? ''),
          antonyms: sense.antonyms?.split(','),
          english_definitions: values(groupBy(s, 'glossId')).map(
            (glossSense) => glossSense[0].meaning as string
          ),
          see_also: sense.related?.split(',')
        }
      }),
      attribution: {
        offlineDict: true,
        jisho: false,
        jmdict: true,
        jmnedict: false,
        dbpedia: false
      }
    }
    return jishoWord
  })
  return words
}
