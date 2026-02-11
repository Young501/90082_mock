"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Text,
  VStack,
  Icon,
  Alert,
  useBreakpointValue,
} from "@chakra-ui/react";
import { XCircle } from "lucide-react";
import { ButtonV2 } from "@/components/ui/ButtonV2";

function ResetPasswordFailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });

  useEffect(() => {
    const message =
      searchParams.get("message") || "Password reset failed. Please try again.";
    setErrorMessage(message);
  }, [searchParams]);

  const handleTryAgainClick = () => {
    router.push("/reset-password/");
  };

  const handleLoginClick = () => {
    router.push("/login/");
  };

  return (
    <Container maxW={containerMaxW} p={0} h="100%">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
        textAlign="center"
        px={{ base: 4, md: 6, lg: 8 }}
        py={{ base: 8, md: 12, lg: 16 }}
      >
        <VStack gap={{ base: 6, md: 8 }}>
          <Icon
            as={XCircle}
            boxSize={{ base: 12, md: 16, lg: 20 }}
            color="red.500"
          />

          <Text
            fontSize={{ base: "24px", md: "32px", lg: "42px" }}
            fontWeight="700"
            color="black"
            lineHeight="1.21"
          >
            Password Reset Failed
          </Text>

          <Alert.Root
            status="error"
            borderRadius="md"
            maxWidth={{ base: "100%", md: "500px", lg: "600px" }}
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
          >
            <Alert.Indicator />
            <Alert.Title>
              <Text fontSize={{ base: "14px", md: "16px" }} color="red.800">
                {errorMessage}
              </Text>
            </Alert.Title>
          </Alert.Root>

          <Text
            fontSize={{ base: "14px", md: "18px", lg: "20px" }}
            color="black"
            maxWidth={{ base: "100%", md: "500px", lg: "600px" }}
            lineHeight="1.4"
            px={{ base: 2, md: 0 }}
          >
            Don&apos;t worry! You can try requesting a new password reset link
            or contact our support team if you continue to experience issues.
          </Text>

          <VStack
            gap={{ base: 3, md: 4 }}
            width="full"
            // maxWidth={{ base: "280px", md: "320px", lg: "400px" }}
          >
            <ButtonV2
              w="100%"
              variant="secondary"
              h={{ base: "48px", md: "64px" }}
              fontSize="md"
              fontWeight="500"
              px={{ base: 4, md: 7 }}
              py={{ base: 4, md: 4.5 }}
              onClick={handleTryAgainClick}
            >
              Try Again
            </ButtonV2>

            <ButtonV2
              w="100%"
              variant="primary"
              h={{ base: "48px", md: "64px" }}
              fontSize="md"
              fontWeight="500"
              px={{ base: 4, md: 7 }}
              py={{ base: 4, md: 4.5 }}
              onClick={handleLoginClick}
            >
              Back to Login
            </ButtonV2>
          </VStack>
        </VStack>
      </Box>
    </Container>
  );
}

export default function ResetPasswordFailedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordFailedContent />
    </Suspense>
  );
}
