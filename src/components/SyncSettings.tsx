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
import { useKeyValueData } from '../hooks/utils/useKeyValueData'

export function SyncSettings () {
  const [{ data: syncUrl, isLoading }, { mutate: setSyncUrl }] =
    useKeyValueData('syncUrl', '')
  const [{ data: syncSecret }, { mutate: setSyncSecret }] = useKeyValueData(
    'syncSecret',
    ''
  )

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
                onChange={(e) => { setSyncUrl(e.target.value) }}
              />
            </HStack>
            <HStack>
              <Text>Secret Key:</Text>
              <Input
                type="text"
                value={syncSecret ?? ''}
                onChange={(e) => { setSyncSecret(e.target.value) }}
              />
            </HStack>
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
