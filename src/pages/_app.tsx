import { Box, ChakraProvider, Stack } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'

import { Footer } from '../components/common/Footer'
import { Navigation } from '../components/common/Navigation'
import { DBContextProvider } from '../hooks/contexts/DBContext'
import { OfflineDBAvailabilityProvider } from '../hooks/contexts/OfflineDBAvailabilityContext'
import { OfflineDictionaryProvider } from '../hooks/contexts/OfflineDictionaryProvider'
import { PopupSearchProvider } from '../hooks/contexts/PopupSearchContext'
import { requestPersistentStoragePermission } from '../utils/requestPersistentStoragePermission'

const queryClient = new QueryClient()
const TITLE = 'Aibou | 相棒'
const DESCRIPTION = 'Your japanese learning companion'
const URL = 'https://aibou.ham-san.net'

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    requestPersistentStoragePermission()
  }, [])

  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="application-name" content={TITLE} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={TITLE} />
        <meta name="description" content={DESCRIPTION} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#2B5797" />
        <meta name="msapplication-tap-highlight" content="no" /> */}
        <meta name="theme-color" content="#FFFFFF" />
        {/*
        <link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/touch-icon-ipad.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/touch-icon-iphone-retina.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/touch-icon-ipad-retina.png" /> */}
        {/*
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" /> */}
        <link rel="manifest" href="/manifest.json" />
        {/* <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5" />
        <link rel="shortcut icon" href="/favicon.ico" /> */}

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content={URL} />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        {/* <meta name="twitter:image" content="https://yourdomain.com/icons/android-chrome-192x192.png" /> */}
        <meta name="twitter:creator" content="@HamP_punipuni" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:site_name" content={TITLE} />
        <meta property="og:url" content={URL} />
        {/* <meta property="og:image" content="https://yourdomain.com/icons/apple-touch-icon.png" /> */}
      </Head>
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <DBContextProvider>
            <OfflineDBAvailabilityProvider>
              <OfflineDictionaryProvider>
                <PopupSearchProvider>
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
                </PopupSearchProvider>
              </OfflineDictionaryProvider>
            </OfflineDBAvailabilityProvider>
          </DBContextProvider>
        </QueryClientProvider>
      </ChakraProvider>
    </>
  )
}

export default MyApp
