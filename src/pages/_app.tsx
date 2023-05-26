import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Box, ChakraProvider, Stack } from '@chakra-ui/react';
import { useEffect } from 'react';
import Head from 'next/head';
import { Navigation } from '../components/Navigation';
import { initDexie } from '../utils/db';
import { requestPersistentStoragePermission } from '../utils/requestPersistentStoragePermission';

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    initDexie();
    requestPersistentStoragePermission();
  }, []);

  return (
    <>
      <Head>
        <title>Aibou | 相棒</title>
      </Head>
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
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
          </Stack>
        </QueryClientProvider>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
