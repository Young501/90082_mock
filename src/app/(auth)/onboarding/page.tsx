"use client";

import { Box, Text, useBreakpointValue } from "@chakra-ui/react";
import { OnboardingSteps } from "@/app/(auth)/onboarding/OnboardingSteps";
import { useAuthStore } from "@/store";
import Image from "next/image";
import { backgroundImage } from "@/assets";

export default function OnboardingPage() {
  const { user, token } = useAuthStore();
  const userType = user?.user_types?.[0];
  const isMobile = useBreakpointValue({ base: true, lg: false });

  if (!userType || !token) {
    return <Text p={8}>Redirecting...</Text>;
  }

  return (
    <Box w="100%" mx="auto" mt={10}>
      <OnboardingSteps userType={userType} />
      {/* {!isMobile && (
        <Box
          w="100%"
          position="absolute"
          top={0}
          right={{
            base: "0",
            lg: "-70vw",
          }}
        >
          <Image
            src={backgroundImage}
            alt="onboarding"
            style={{ position: "unset", width: "fit-content", height: "auto" }}
          />
        </Box>
      )} */}
    </Box>
  );
}
