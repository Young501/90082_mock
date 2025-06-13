'use client';

import { Box, Text } from '@chakra-ui/react';
import { OnboardingProvider, useOnboarding } from '@/app/onboarding/OnboardingContext';
import { OnboardingSteps } from '@/app/onboarding/OnboardingSteps';
import { useAuth } from '@/api';

function OnboardingRenderer() {
  const { user, token } = useAuth();
  const userType = user?.user_types?.[0];
  const { loading, error } = useOnboarding();

  if (loading) return <Text p={8}>Loading onboarding...</Text>;
  if (error) return <Text color="red.500" p={8}>{error}</Text>;
  if (!userType || !token) return <Text p={8}>Redirecting...</Text>;

  return (
    <Box maxW="600px" mx="auto" mt={10}>
      <OnboardingSteps userType={userType} token={token} />
    </Box>
  );
}

export default function OnboardingEntryPage() {
  return (
    <OnboardingProvider>
      <OnboardingRenderer />
    </OnboardingProvider>
  );
}