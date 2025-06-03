'use client';

import { Box, Text } from '@chakra-ui/react';
import { OnboardingProvider, useOnboarding } from '@/app/onboarding/OnboardingContext';
import { OnboardingPage } from '@/app/onboarding/OnboardingSteps';
import { useAuth } from '../contexts/AuthContext';

function OnboardingFlow() {
  const { user } = useAuth();
  const userType = user?.user_types?.[0];
  const { loading, error } = useOnboarding();

  if (loading) return <Text p={8}>Loading onboarding...</Text>;
  if (error) return <Text color="red.500" p={8}>{error}</Text>;
  if (!userType) return <Text p={8}>Redirecting...</Text>;

  return (
    <Box maxW="600px" mx="auto" mt={10}>
      <OnboardingPage userType={userType}/>
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