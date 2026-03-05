"use client";

import { useEffect, useState } from "react";
import { Box, Text, VStack } from "@chakra-ui/react";

const STEPS = [
  "Saving organisation details",
  "Preparing your dashboard",
  "Setting up opportunity access",
  "Configuring student pools",
  "Almost ready...",
];

const STEP_INTERVAL_MS = 1500;

export const OrgSubmissionProgress = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= STEPS.length - 1) return;
    const timer = setTimeout(
      () => setCurrentStep((prev) => prev + 1),
      STEP_INTERVAL_MS
    );
    return () => clearTimeout(timer);
  }, [currentStep]);

  const getColor = (index: number): string => {
    if (index < currentStep) return "#A1A1AA";
    if (index === currentStep) return "#000000";
    const distance = index - currentStep;
    const opacities = [0.35, 0.2, 0.12];
    const opacity = opacities[Math.min(distance - 1, opacities.length - 1)];
    return `rgba(24, 24, 27, ${opacity})`;
  };

  return (
    <Box
      position="fixed"
      inset={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="white"
      zIndex={9999}
    >
      <VStack gap={3} alignItems="center">
        {STEPS.map((step, i) => (
          <Text
            key={step}
            fontSize={{ base: "md", md: "lg" }}
            fontWeight={i === currentStep ? "500" : "400"}
            color={getColor(i)}
            lineHeight="1.5"
            style={{
              transition: "color 0.5s ease, font-weight 0.3s ease",
            }}
          >
            {step}
          </Text>
        ))}
      </VStack>
    </Box>
  );
};
