import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Box, ChakraProvider, Stack } from "@chakra-ui/react";
import { Navigation } from "../components/Navigation";
import { useEffect } from "react";
import { initDexie } from "../utils/db";
import { requestPersistentStoragePermission } from "../utils/requestPersistentStoragePermission";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    initDexie();
    requestPersistentStoragePermission();
  }, []);

  return (
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
  );
}

export default MyApp;
