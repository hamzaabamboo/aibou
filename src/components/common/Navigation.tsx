import { RepeatIcon, SearchIcon, SettingsIcon } from '@chakra-ui/icons'
import {
  HStack, IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Kbd,
  Text,
  useBreakpoint
} from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { usePopupSearchContext } from '../../hooks/contexts/usePopupSearchContext'
import { useSyncData } from '../../hooks/utils/useSyncData'

export function Navigation () {
  const router = useRouter()
  const { syncEnabled, sync } = useSyncData()
  const { openSearchModal } = usePopupSearchContext()
  const breakPoint = useBreakpoint()

  return (
    <HStack
      border="md"
      width="100xw"
      py={2}
      px={4}
      justifyContent="space-between"
      alignItems="center"
      shadow="md"
      position="sticky"
      top="0"
      bg="white"
      zIndex={100}
    >
      <Text fontSize="3xl" fontWeight="bold" onClick={async () => await router.push('/')}>
        相棒
      </Text>
      <InputGroup maxW="350px" hidden={['base', 'sm', 'md'].includes(breakPoint)} position="absolute" left="50%" transform="translate(-50%, 0)" onClick={(e) => {
        openSearchModal?.()
        e.stopPropagation()
        e.preventDefault()
      }}>
        <InputLeftElement
          pointerEvents='none'
          fontSize='1.2em'
        ><SearchIcon/></InputLeftElement>
        <Input placeholder='Search' />
        <InputRightElement width="6em">
          <Kbd>ctrl</Kbd> + <Kbd>s</Kbd>
        </InputRightElement>
      </InputGroup>
      <HStack cursor="pointer">
        <Link href="/kanken">Kanken</Link>
        <Link href="/topics">Topics</Link>
        <Link href="/games">Games</Link>
        <Link href="/settings"><SettingsIcon aria-label="settings"/></Link>
        {['base', 'sm'].includes(breakPoint)
          ? <IconButton
            aria-label="sync"
            onClick={async () => { openSearchModal?.() }}
            icon={<SearchIcon />}
          />
          : syncEnabled && (
          <IconButton
            aria-label="sync"
            onClick={async () => { await sync() }}
            icon={<RepeatIcon />}
          />
          )}
      </HStack>
    </HStack>
  )
}
