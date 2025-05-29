'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Heading, Text, Button } from '@chakra-ui/react';

export default function LoginPage() {
  const params = useSearchParams();
  const router = useRouter();
  const userType = params.get('userType');

  const handleOnboardingClick = () => {
    if (userType) {
      router.push(`/onboarding?userType=${userType}`);
    }
  };

  return (
    <Box p={10}>
      <Heading>Login</Heading>
      <Text mt={4}>
        Selected user type: <strong>{userType || 'Not provided'}</strong>
      </Text>
      {userType && (
        <Button mt={6} colorScheme="blue" onClick={handleOnboardingClick}>
          Onboarding
        </Button>
      )}
    </Box>
  );
}