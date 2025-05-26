'use client';

import { useSearchParams } from 'next/navigation';
import { Box, Heading, Text } from '@chakra-ui/react';

export default function LoginPage() {
  const params = useSearchParams();
  const userType = params.get('userType');

  return (
    <Box p={10}>
      <Heading>Login</Heading>
      <Text mt={4}>
        Selected user type: <strong>{userType || 'Not provided'}</strong>
      </Text>
    </Box>
  );
}