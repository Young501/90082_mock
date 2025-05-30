// 'use client';

// import { ReactNode } from 'react';
// import Providers from '@/components/ui/providers';

// export default function RootLayout({ children }: { children: ReactNode }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body>
//         <Providers>
//           {children}
//         </Providers>
//       </body>
//     </html>
//   );
// }


// app/layout.tsx
import './globals.css';
import {AuthProvider} from '@/context/AuthContext';

export const metadata = {
  title: 'UniConnected2',
  description: 'This is UniConnected 2.0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

