'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import { system } from '@/theme/theme';
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <NextThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
      >
        {children}
      </NextThemeProvider>
    </ChakraProvider>
  );
}
