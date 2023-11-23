import { Tag } from '@chakra-ui/react'

import { toKana } from 'wanakana'

import { JishoPartOfSpeech, type PartOfSpeech } from '../../types/jisho'

export const parsePartOfSpeech = (
  partOfSpeech: PartOfSpeech | string
): string | null => {
  switch (partOfSpeech) {
    case JishoPartOfSpeech.SuruVerb:
    case JishoPartOfSpeech.SuruVerbIncluded:
      return 'v-する'
    case JishoPartOfSpeech.IchidanVerb:
      return 'v-る'
    case JishoPartOfSpeech.GodanVerU:
    case JishoPartOfSpeech.GodanVerbMu:
    case JishoPartOfSpeech.GodanVerbSu:
    case JishoPartOfSpeech.GodanVerbRu:
      return 'v-いる'
    case JishoPartOfSpeech.WikipediaDefinition:
      return 'wiki'
    default: {
      if (partOfSpeech.includes('adjective')) {
        if (partOfSpeech.includes('keiyoushi')) return 'い-adj'
        if (
          partOfSpeech.includes('keiyodoshi') ||
          partOfSpeech.includes('a-adjective')
        ) {
          return 'な-adj'
        }
        return partOfSpeech
      }
      if (partOfSpeech.includes('xpressions')) return 'Expressions'
      if (partOfSpeech.includes('noun') || partOfSpeech.includes('Noun')) {
        if (partOfSpeech.includes('futsuumeishi') || partOfSpeech === 'Noun') {
          return 'n'
        }
        return ''
      }
      if (partOfSpeech.includes('dverb')) {
        if (partOfSpeech.includes('to')) return 'と-adv'
        return 'adv'
      }
      if (partOfSpeech.includes('verb')) {
        if (partOfSpeech.includes('ntransitive')) return '自'
        if (partOfSpeech.includes('ransitive')) return '他'
        if (/(.*?) verb.*?with '?(.+?)'? ending/.test(partOfSpeech)) {
          return partOfSpeech.replace(
            /(.*?) verb(?:.*?with '?(.+?)'? ending)?/,
            (_, type, ending) => {
              const dan = (() => {
                switch (type) {
                  case 'Godan':
                    return '五'
                  case 'Nidan':
                    return '二'
                  case 'Yodan':
                    return '四'
                  case 'Ichidan':
                    return '一'
                  default:
                    return 'v'
                }
              })()

              const suffix = (() => {
                if (type === 'Ichidan') return 'る'
                if (type === 'Suru') return 'する'

                return toKana(ending)
              })()
              return `${dan}-${suffix}`
            }
          )
        }
        return partOfSpeech
      }
      return partOfSpeech
    }
  }
}
export function PartOfSpeechLabel(props: { partOfSpeech: PartOfSpeech }) {
  const { partOfSpeech } = props

  const text = parsePartOfSpeech(partOfSpeech)

  const color = (() => {
    if (partOfSpeech.includes('djective')) return 'yellow'
    if (partOfSpeech.includes('dverb')) return 'cyan'
    if (partOfSpeech.includes('oun')) return 'green'
    if (partOfSpeech.includes('verb')) return 'purple'
    switch (partOfSpeech) {
      case JishoPartOfSpeech.Expressions:
        return 'red'
      case JishoPartOfSpeech.WikipediaDefinition:
        return 'wiki.'
      default:
        return 'gray'
    }
  })()

  if (!text) return null

  return <Tag colorScheme={color}>{text}</Tag>
}
