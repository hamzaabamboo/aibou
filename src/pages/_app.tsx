import { Box, ChakraProvider, Stack } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect } from 'react'
import { Footer } from '../components/common/Footer'
import { Navigation } from '../components/common/Navigation'
import { DBContextProvider } from '../hooks/contexts/DBContext'
import { requestPersistentStoragePermission } from '../utils/requestPersistentStoragePermission'

const queryClient = new QueryClient()

function MyApp ({ Component, pageProps }: AppProps) {
  useEffect(() => {
    requestPersistentStoragePermission()
  }, [])

  return (
    <>
      <Head>
        <title>Aibou | 相棒</title>
      </Head>
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <DBContextProvider>
            <Stack minH="100vh">
              <Navigation />
              <Box
                display="flex"
                flex={1}
                justifyContent="stretch"
                alignItems="stretch"
                width="100%"
                minH="100%"
              >
                <Component {...pageProps} />
              </Box>
              <Footer />
            </Stack>
          </DBContextProvider>
        </QueryClientProvider>
      </ChakraProvider>
    </>
  )
}

export default MyApp
