'use client';

import { ReactNode } from 'react';
import ChakraProviders from '@components/ui/ChakraProviders';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ChakraProviders>
          {children}
        </ChakraProviders>
      </body>
    </html>
  );
}
