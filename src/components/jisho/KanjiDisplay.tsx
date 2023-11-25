import { chakra, Text } from '@chakra-ui/react'

import { type KanjiReading } from '../../types/jisho'

export function KanjiDisplay(props: {
  data: Partial<KanjiReading>
  hideRuby?: boolean
  hideFurigana?: boolean
  isVeryBig?: boolean
  isSmall?: boolean
}) {
  const {
    data,
    isVeryBig,
    isSmall = false,
    hideRuby = false,
    hideFurigana = false
  } = props
  const { word, reading } = data

  const fontSize = (() => {
    if (isVeryBig) return '7xl'
    return isSmall ? 'lg' : '3xl'
  })()
  const fontWeight = isSmall ? 'normal' : 'bold'

  if (!word) {
    return (
      <Text fontSize={fontSize} fontWeight={fontWeight}>
        {reading}
      </Text>
    )
  }

  if (hideRuby) {
    return (
      <Text as="span" fontWeight={fontWeight}>
        {word} ({reading})
      </Text>
    )
  }

  return (
    <chakra.ruby fontSize={fontSize} textAlign="center">
      <Text as="span" fontWeight={fontWeight}>
        {word}
      </Text>
      {!hideFurigana && (
        <>
          {!hideRuby && <chakra.rt>{reading}</chakra.rt>}
          <chakra.rp>({reading})</chakra.rp>
        </>
      )}
    </chakra.ruby>
  )
}
