'use client'

import { Box, Text } from '@chakra-ui/react'
import { OnboardingSteps } from '@/app/onboarding/OnboardingSteps'
import { useAuth } from '@/api'

export default function OnboardingPage() {
  const { user, token } = useAuth()
  const userType = user?.user_types?.[0]

  if (!userType || !token) {
    return <Text p={8}>Redirecting...</Text>
  }

  return (
    <Box maxW="600px" mx="auto" mt={10}>
      <OnboardingSteps userType={userType} token={token} />
    </Box>
  )
}