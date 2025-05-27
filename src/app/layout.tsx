'use client';

import { ReactNode } from 'react';
import Providers from '@/components/ui/providers';
import { UserTypeContext } from '@/contexts/UserTypeContext';
import { useState } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  const [userType, setUserType] = useState('');
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <UserTypeContext.Provider value={{ userType, setUserType }}>
          {children}
        </UserTypeContext.Provider>
      </body>
    </html>
  );
}
