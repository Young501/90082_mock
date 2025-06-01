'use client';

import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/utils/api';
import { Box, Text } from '@chakra-ui/react';
import { OnboardingProvider, useOnboarding, Page } from '@/components/onboarding/contexts/OnboardingContext';
import { OnboardingPage } from '@/components/onboarding/pages/OnboardingPage';
import { useAuth } from '../contexts/AuthContext';

function OnboardingFlow() {
  const { user } = useAuth();
  const userType = user?.user_types?.[0];
  const { initPages, currentPageId } = useOnboarding();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPages() {
      if (!userType) {
        setError('Missing userType in URL.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(API_ENDPOINTS.ONBOARDING_PAGES(userType));
        if (!res.ok) {
          const statusText = res.statusText || 'Unknown error';
          throw new Error(`Failed to fetch onboarding steps: ${res.status} ${statusText}`);
        }

        const data = await res.json();
        const pages: Page[] = data.onboarding_pages;

        if (currentPageId === -1) {
          initPages(pages);
        }
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    }

    if (currentPageId === -1) {
      fetchPages();
    }
  }, [userType, currentPageId]);

  if (loading) return <Text p={8}>Loading onboarding...</Text>;
  if (error) return <Text color="red.500" p={8}>{error}</Text>;

  return (
    <Box maxW="600px" mx="auto" mt={10}>
      <OnboardingPage userType={userType!}/>
    </Box>
  );
}

export default function OnboardingEntryPage() {
  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  );
}