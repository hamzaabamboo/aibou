import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  HStack,
  Input,
  Stack,
  Text
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

import { useKeyValueData } from '../hooks/utils/useKeyValueData'

export function DictionaryApiSettings() {
  const [
    { data: dictionaryApiUrl, isPending: isLoadingURL },
    { mutate: setDictUrl }
  ] = useKeyValueData('dictionaryApiUrl', '')
  const [
    { data: dictionaryApiSecret, isPending: isLoadingSecret },
    { mutate: setDictSecret }
  ] = useKeyValueData('dictionaryApiSecret', '')
  const { query } = useRouter()

  useEffect(() => {
    const { dictionary_api_url: url, dictionary_api_secret: secret } = query
    if (isLoadingURL || isLoadingSecret) return
    if (!url || !secret) return
    if (!!dictionaryApiUrl || !!dictionaryApiSecret) return
    setDictUrl(url)
    setDictSecret(secret)
  }, [query, isLoadingURL, isLoadingSecret])

  return (
    <Accordion allowToggle>
      <AccordionItem>
        <AccordionButton>
          <HStack flex="1">
            <Text>Dictionary Api Settings</Text>
          </HStack>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <Stack>
            <HStack>
              <Text>Dictionary API URL:</Text>
              <Input
                type="text"
                value={dictionaryApiUrl ?? ''}
                onChange={(e) => {
                  setDictUrl(e.target.value)
                }}
              />
            </HStack>
            <HStack>
              <Text>Dictionary API Key:</Text>
              <Input
                type="text"
                value={dictionaryApiSecret ?? ''}
                onChange={(e) => {
                  setDictSecret(e.target.value)
                }}
              />
            </HStack>
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
