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

export function SyncSettings() {
  const [{ data: syncUrl, isPending: isLoadingURL }, { mutate: setSyncUrl }] =
    useKeyValueData('syncUrl', '')
  const [
    { data: syncSecret, isPending: isLoadingSecret },
    { mutate: setSyncSecret }
  ] = useKeyValueData('syncSecret', '')
  const { query } = useRouter()

  useEffect(() => {
    const { sync_url: url, sync_secret: secret } = query
    if (isLoadingURL || isLoadingSecret) return
    if (!url || !secret) return
    if (!!syncUrl || !!syncSecret) return
    setSyncUrl(url)
    setSyncSecret(secret)
  }, [query, isLoadingURL, isLoadingSecret])

  return (
    <Accordion allowToggle>
      <AccordionItem>
        <AccordionButton>
          <HStack flex="1">
            <Text>Sync settings</Text>
          </HStack>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <Stack>
            <HStack>
              <Text>Sync URL:</Text>
              <Input
                type="text"
                value={syncUrl ?? ''}
                onChange={(e) => {
                  setSyncUrl(e.target.value)
                }}
              />
            </HStack>
            <HStack>
              <Text>Secret Key:</Text>
              <Input
                type="text"
                value={syncSecret ?? ''}
                onChange={(e) => {
                  setSyncSecret(e.target.value)
                }}
              />
            </HStack>
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
