import { HStack, IconButton, Stack, Text, useToast } from '@chakra-ui/react'

import { CopyIcon } from '@chakra-ui/icons'

import { type JishoWord } from '../../types/jisho'
import { KanjiDisplay } from './KanjiDisplay'
import {
  SearchResultItem,
  type SearchResultItemProps
} from './SearchResultItem'

export function WordItem(
  props: { item?: JishoWord; word: string } & Omit<
    SearchResultItemProps,
    'item'
  >
) {
  const { item, showMeaning, word, ...rest } = props

  const toast = useToast()

  const handleCopy = () => {
    navigator.clipboard.writeText(word)
    toast({
      status: 'success',
      title: 'Word Copied to Clipboard'
    })
  }

  return item != null ? (
    <SearchResultItem
      item={item}
      showMeaning={showMeaning}
      isCard={false}
      {...rest}
    />
  ) : (
    <Stack justifyContent="flex-start" h="full">
      <HStack justifyContent="space-between" w="full">
        <KanjiDisplay data={{ word }} />
        {rest.showCopy && (
          <IconButton
            aria-label="copy-text"
            size="sm"
            onClick={(e) => {
              handleCopy()
              e.stopPropagation()
            }}
            icon={<CopyIcon />}
          />
        )}
      </HStack>
      <Text textAlign="center">Click to retreive meaning</Text>
    </Stack>
  )
}
