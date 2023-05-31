import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import uniq from 'lodash/uniq';
import values from 'lodash/values';
import { SqlValue } from "sql.js";
import { JishoWord } from "../types/jisho";

export const parseOfflineDBResult = (data: { columns: string[], values: SqlValue[][] }[], tags: Record<string,string>): JishoWord[] => {
    const rows = data.map(d => {
        const {columns, values} = d;
        return values.map(v => Object.fromEntries(columns.map((c,cidx) => [c, v[cidx]])))
    })
    const sortOrder = uniq(rows[0]?.map(r => r.wordId));
    const words = sortBy(values(groupBy(rows[0], "wordId")),s => sortOrder.indexOf(s[0].wordId)).map((entries) => {
        return {
            slug: entries[0].wordId,
            is_common: entries.some(i => i.kanjiCommon) ? 'true': 'false',
            japanese: values(groupBy(entries, (e) =>`${e.kanji}-${e.kana}`)).map(e => ({ word: e[0].kanji, reading: e[0].kana })),
            tags: [].map(t => tags[t] ?? t),
            senses: values(groupBy(entries, "senseId")).map(s => {
                const sense = s[0] as any;
                return ({
                    parts_of_speech: sense.partOfSpeech.split(",").map((t:string)  => tags[t] ?? t),
                    tags: sense.field.split(',').map((t:string) => tags[t] ?? t)+sense.misc?.split(",").map((t:string) => tags[t] ?? t),
                    antonyms: sense.antonyms?.split(','),
                    english_definitions: values(groupBy(s, "glossId")).map(s => s[0].meaning),
                    see_also: sense.related?.split(',')
                })
            }),
            attribution: {offlineDict: true, jisho: false, jmdict: true, jmnedict: false, dbpedia: false}
        } as JishoWord
    })
    return words
}
