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
  Expressions = 'Expressions (phrases, clauses, etc.)',
}
