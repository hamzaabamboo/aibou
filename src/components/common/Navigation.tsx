import { RepeatIcon } from '@chakra-ui/icons'
import { HStack, IconButton, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useSyncData } from '../../hooks/utils/useSyncData'

export function Navigation () {
  const router = useRouter()
  const { syncEnabled, sync } = useSyncData()
  return (
    <HStack
      border="md"
      width="100xw"
      py={2}
      px={4}
      justifyContent="space-between"
      alignItems="center"
      shadow="md"
    >
      <Text fontSize="3xl" fontWeight="bold" onClick={async () => await router.push('/')}>
        相棒
      </Text>
      <HStack cursor="pointer">
        <Text onClick={async () => await router.push('/topics')}>Topics</Text>
        <Text onClick={async () => await router.push('/games')}>Games</Text>
        <Text onClick={async () => await router.push('/settings')}>Settings</Text>
        {syncEnabled && (
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
