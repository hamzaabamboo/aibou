import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  HStack,
  Input,
  Select,
  Stack,
  Switch,
  Text
} from '@chakra-ui/react'
import { type Dispatch, type SetStateAction } from 'react'

export interface ItemViewOptions {
  filter?: string
  numberOfColumns?: 1 | 2 | 3 | 4
  showMeaning?: boolean
  orderBy?: 'word' | 'createdAt'
  reverseSortOrder?: boolean
}

interface ItemViewSettingsProps {
  data: ItemViewOptions
  setData: Dispatch<SetStateAction<ItemViewOptions | null>>
}
export function ItemViewSettings ({ data, setData }: ItemViewSettingsProps) {
  const { filter, numberOfColumns, showMeaning, orderBy, reverseSortOrder } =
    data
  return (
    <Accordion allowToggle>
      <AccordionItem>
        <AccordionButton>
          <HStack flex="1">
            <Text fontWeight="bold">View settings</Text>
          </HStack>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <Stack>
            <Stack
              direction={['column', 'row']}
              alignItems={['flex-start', 'center']}
            >
              <Text>Filter Results (name, reading, meaning)</Text>
              <Input
                type="text"
                value={filter ?? ''}
                onChange={(e) => { setData((d) => ({ ...d, filter: e.target.value })) }
                }
              />
            </Stack>
            <Stack
              direction={['column', 'row']}
              alignItems={['flex-start', 'center']}
            >
              <Text>Results Per Row</Text>
              <Select
                width="fit-content"
                value={numberOfColumns}
                onChange={(e) => {
                  const n = Number(e.target.value) as 1 | 2 | 3 | 4
                  setData((d) => ({ ...d, numberOfColumns: isNaN(n) ? 1 : n }))
                }}
              >
                {[1, 2, 3, 4].map((row) => (
                  <option value={row} key={row}>
                    {row}
                  </option>
                ))}
              </Select>
            </Stack>
            <Stack
              direction={['column', 'row']}
              alignItems={['flex-start', 'center']}
            >
              <Text>Sort results by </Text>
              <Select
                width="fit-content"
                value={orderBy}
                onChange={(e) => {
                  setData((d) => ({
                    ...d,
                    orderBy: e.target.value as 'word' | 'createdAt'
                  }))
                }
                }
              >
                {['word', 'createdAt'].map((row) => (
                  <option value={row} key={row}>
                    {row}
                  </option>
                ))}
              </Select>
              <Text>Reverse Sort Order</Text>
              <Switch
                isChecked={reverseSortOrder}
                onChange={(e) => {
                  setData((d) => ({
                    ...d,
                    reverseSortOrder: e.target.checked
                  }))
                }
                }
              />
            </Stack>
            <HStack>
              <Text>Show meanings</Text>
              <Switch
                isChecked={showMeaning}
                onChange={(e) => { setData((d) => ({ ...d, showMeaning: e.target.checked })) }
                }
              />
            </HStack>
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
