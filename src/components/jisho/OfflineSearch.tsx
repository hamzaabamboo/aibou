import {
  Box,
  Divider,
  Heading,
  Spinner,
  Stack,
  Text
} from '@chakra-ui/react'
import debounce from 'lodash/debounce'
import orderBy from 'lodash/orderBy'
import React, { forwardRef, useCallback, useEffect, useState } from 'react'
import { useOfflineDictionary } from '../../hooks/offline/useOfflineDictionary'
import { similarity } from '../../utils/stringSimilarity'
import { BigTextInput } from '../common/BigTextInput'
import { type SearchProps } from './Search'
import { SearchResultItem } from './SearchResultItem'

export const OfflineSearch = forwardRef<HTMLInputElement, SearchProps>(function OfflineSearch (props, ref) {
  const {
    inputSize = 'large',
    onSelectItem,
    isPopup = false,
    isShowPopup = true,
    setShowPopup,
    initialWord = '',
    ...boxProps
  } = props
  const [input, setInput] = useState(initialWord)
  const [keyword, _setKeyword] = useState('')
  const setKeyword = useCallback(debounce(_setKeyword, 1000), [_setKeyword])
  const { data, isLoading } = useOfflineDictionary(keyword)
  useEffect(() => {
    if (input !== keyword) {
      setKeyword(input)
      setShowPopup?.(true)
    }
  }, [input, keyword, setKeyword, setShowPopup])

  const searchResults = isLoading
    ? (
    <Spinner />
      )
    : (data == null) || data.length === 0
        ? (
    <Text>Keyword not found</Text>
          )
        : (
    <Stack>
      {data?.map((item) => {
        const sortedReadings = input
          ? orderBy(
            item.japanese,
            (w) =>
              Math.max(
                w.word ? similarity(w.word, input) : -Infinity,
                w.reading ? similarity(w.reading, input) : -Infinity
              ),
            'desc'
          )
          : item.japanese

        return (
          <React.Fragment key={item.slug}>
            <SearchResultItem
              item={{ ...item, japanese: sortedReadings }}
              onClick={() => { onSelectItem({ ...item, japanese: sortedReadings }) }
              }
              isCard={!isPopup}
            />
            {isPopup && <Divider />}
          </React.Fragment>
        )
      })}
    </Stack>
          )

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') setShowPopup?.(false)
  }

  return (
    <Box {...boxProps} position="relative">
      <BigTextInput
        ref={ref}
        width="full"
        value={input}
        fontSize={inputSize === 'large' ? '4xl' : 'lg'}
        fontWeight={inputSize === 'large' ? 'bold' : 'semibold'}
        onFocus={() => setShowPopup?.(true)}
        onChange={(e) => { setInput(e.currentTarget.value) }}
        onKeyUp={(e) => { handleKeyPress(e) }}
        mb={2}
      />
      {keyword.length > 0 && !isLoading && isShowPopup && (
        <Box
          background="white"
          position={isPopup ? 'absolute' : 'initial'}
          p={isPopup ? '2' : '0'}
          w="full"
          borderRadius="md"
          shadow={isPopup ? 'md' : 'none'}
          zIndex={2}
        >
          <Box overflowY="auto" w="100%" maxH="50vh">
            {!isPopup && (
              <Heading fontSize="2xl" as="h3" mb={2}>
                Search Results
              </Heading>
            )}
            <Box>{searchResults}</Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}
)
