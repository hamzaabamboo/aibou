import { CopyIcon } from '@chakra-ui/icons'
import {
  Box,
  HStack,
  IconButton,
  ListItem,
  Stack,
  Text,
  UnorderedList,
  useToast,
  type StackProps
} from '@chakra-ui/react'
import { type JishoWord } from '../../types/jisho'
import { KanjiDisplay } from './KanjiDisplay'
import { PartOfSpeechLabel } from './PartOfSpeechLabel'

export type SearchResultItemProps = {
  item: JishoWord
  showMeaning?: boolean
  isCard?: boolean
  showCopy?: boolean
  hideFurigana?: boolean
  hideAlternatives?: boolean
} & StackProps

export function SearchResultItem (props: SearchResultItemProps) {
  const {
    item,
    showMeaning = true,
    isCard = true,
    showCopy = false,
    hideFurigana,
    hideAlternatives = false,
    ...stackProps
  } = props
  const toast = useToast()
  const word = item.japanese

  const handleCopy = () => {
    navigator.clipboard.writeText(word[0].word)
    toast({
      status: 'success',
      title: 'Word Copied to Clipboard'
    })
  }

  return (
    <Stack
      alignItems="flex-start"
      shadow={isCard ? 'md' : 'none'}
      borderRadius={isCard ? 'md' : 'none'}
      h="full"
      p={2}
      {...stackProps}
    >
      <HStack justifyContent="space-between" w="full">
        <HStack flexWrap="wrap" alignItems="flex-end" spacing="1">
          <KanjiDisplay data={word[0]} hideFurigana ={hideFurigana} />
          {word.length > 0 && !hideAlternatives &&
            word
              .slice(1)
              .map((item, idx) => (
                <KanjiDisplay key={idx} data={item} isSmall />
              ))}
        </HStack>
        {showCopy && (
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
      {showMeaning && (
        <Box>
          <UnorderedList>
            {item.senses.map((i, idx) => (
              <ListItem key={idx}>
                <Text>
                  <HStack as="span" spacing="1" display="inline" mr={2}>
                    {i.parts_of_speech.map((i, idx) => (
                      <PartOfSpeechLabel key={idx} partOfSpeech={i} />
                    ))}
                  </HStack>
                  {i.english_definitions.join(', ')}
                </Text>
              </ListItem>
            ))}
          </UnorderedList>
        </Box>
      )}
    </Stack>
  )
}
