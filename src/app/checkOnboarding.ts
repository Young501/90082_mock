'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, getOnboardingPages } from './apihelpers';

export function useCheckOnboarding(token: string, userType: string) {
  const router = useRouter();

  useEffect(() => {
    if (!token || !userType) return;

    async function runCheck() {
      try {
        const profileStatus = await getUserProfile(userType, token);
        if (profileStatus.status === 'exists') {
          router.push('/home');
        } else {
          const onboardingSteps = await getOnboardingPages(userType, token);
          sessionStorage.setItem('onboarding', JSON.stringify(onboardingSteps));
          router.push('/onboarding');
        }
      } catch (err) {
        console.error('Onboarding check failed:', err);
      }
    }

    runCheck();
  }, [token, userType]);
}