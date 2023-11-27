import { groupBy, isEqual, partition, uniqWith } from 'lodash'

import { SearchApiResults } from './api'
import { type OfflineDictPartOfSpeech } from './offlineDictPartsOfSpeech'

export type PartOfSpeech = JishoPartOfSpeech | OfflineDictPartOfSpeech

export interface JishoWord {
  slug?: string
  is_common: string
  tags: string[]
  jlpt?: 'jlpt-n5' | 'jlpt-n4' | 'jlpt-n3' | 'jlpt-n2' | 'jlpt-n1'
  japanese: KanjiReading[]
  senses: Array<{
    english_definitions: string[]
    parts_of_speech: PartOfSpeech[]
    links?: string[]
    tags: string[]
    restrictions?: string[]
    see_also?: string[]
    antonyms?: string[]
    source?: string[]
    info?: string[]
  }>
  attribution: {
    offlineDict?: boolean
    jmdict?: boolean
    jmnedict?: boolean
    dbpedia?: boolean
    jisho?: boolean
    dictionary_id?: number
  }
}

export interface KanjiReading {
  word: string
  reading: string
}

export enum JishoPartOfSpeech {
  Noun = 'Noun',
  NounWithNo = "Noun which may take the genitive case particle 'no'",
  PrenominallyNoun = 'Noun or verb acting prenominally',
  SuruVerb = 'Suru verb',
  SuruVerbIncluded = 'Suru verb - included',
  IchidanVerb = 'Ichidan verb',
  GodanVerU = 'Godan verb with u ending',
  GodanVerbSu = 'Godan verb with su ending',
  GodanVerbMu = 'Godan verb with mu ending',
  GodanVerbRu = 'Godan verb with ru ending',
  TransitiveVerb = 'Transitive verb',
  IntransitiveVerb = 'Intransitive verb',
  Adverb = 'Adverb (fukushi)',
  AdverbTo = "Adverb taking the 'to' particle",
  WikipediaDefinition = 'Wikipedia definition',
  IAdj = 'I-adjective (keiyoushi)',
  NaAdj = 'Na-adjective (keiyodoshi)',
  OldNaAdj = 'Archaic/formal form of na-adjective',
  Expressions = 'Expressions (phrases, clauses, etc.)'
}

export const parseJishoResults = (data: SearchApiResults): JishoWord[] => {
  const groups = Object.values(groupBy(data, 'word_id')).map((word) => {
    const { dictionary_id, text, word_id } = word[0]
    return {
      attribution: { offlineDict: true, dictionary_id },
      is_common: '',
      japanese: word.map(({ kanji, reading }) => ({ word: kanji, reading })),
      senses: [
        {
          english_definitions: [text],
          tags: [],
          parts_of_speech: []
        }
      ],
      tags: [],
      slug: word_id?.toString()
    }
  })
  const [words, kanjiOnly] = partition(groups, (g) =>
    g.japanese.every((j) => j.reading && j.word)
  )

  const aggregated = groupBy(
    words,
    (d) => `${d.japanese[0].word}:${d.japanese[0].reading}`
  )
  const combined = Object.values(aggregated).map((wordsResult) => {
    const relatedKanji = kanjiOnly.find((w) =>
      w.japanese.some((j) =>
        wordsResult.some((a) => a.japanese.some((b) => b.word === j.word))
      )
    )
    const wordsWithKanji = relatedKanji
      ? [...wordsResult, { ...relatedKanji, japanese: [] }]
      : wordsResult

    return {
      ...wordsWithKanji[0],
      japanese: uniqWith(
        wordsWithKanji.flatMap((w) => w.japanese),
        isEqual
      ),
      senses: uniqWith(
        wordsWithKanji.flatMap((w) => w.senses),
        isEqual
      )
    }
  })

  return combined
}
