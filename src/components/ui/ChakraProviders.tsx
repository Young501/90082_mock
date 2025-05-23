'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes'; 
import { ReactNode } from 'react';
import { UserTypeProvider } from '@contexts/UserTypeContext';
import theme from '@/theme/theme'; 

export default function ChakraProviders({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider value={theme}>
      <ThemeProvider attribute="class" disableTransitionOnChange>
        <UserTypeProvider>{children}</UserTypeProvider>
      </ThemeProvider>
    </ChakraProvider>
  );
}


