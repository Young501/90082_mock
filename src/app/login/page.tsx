'use client';

import Providers from '@/components/ui/providers';
import LoginPage from './LoginPage';

export default function Page() {
  return (
    <Providers>
      <LoginPage />
    </Providers>
  );
}