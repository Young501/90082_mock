"use client";

import { Box, Text, useBreakpointValue } from "@chakra-ui/react";
import { OnboardingSteps } from "@/app/(auth)/onboarding/OnboardingSteps";
import { useAuthStore } from "@/store";
import Image from "next/image";
import Loader from "@/components/ui/Loader";

export default function OnboardingPage() {
  const { user, token } = useAuthStore();
  const userType = user?.user_types?.[0];
  const isMobile = useBreakpointValue({ base: true, lg: false });

  if (!userType || !token) {
    return <Loader type="page" text="Redirecting..." />;
  }

  return (
    <Box w="100%" mx="auto" maxW="1040px">
      <OnboardingSteps userType={userType} />
    </Box>
  );
}
