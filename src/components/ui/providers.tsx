'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import theme from '@/theme/theme';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider value={theme}>
      <ThemeProvider attribute="class" disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </ChakraProvider>
  );
}