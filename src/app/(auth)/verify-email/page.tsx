"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Text,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useEmailVerification } from "@/services/emailVerification";
import Loader from "@/components/ui/Loader";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });
  const [hasVerified, setHasVerified] = useState(false);
  const emailVerificationMutation = useEmailVerification();

  const verifyEmailToken = useCallback(async () => {
    if (hasVerified) return;

    const token = searchParams.get("token");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (!token) {
      const message =
        "No verification token found. Please check your email link.";
      router.push(
        `/verify-email/failed/?message=${encodeURIComponent(message)}`
      );
      return;
    }

    setHasVerified(true);

    try {
      await emailVerificationMutation.mutateAsync({ token });

      router.push("/verify-email/success/");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail ||
        "Network error. Please check your connection and try again.";

      router.push(
        `/verify-email/failed/?message=${encodeURIComponent(errorMessage)}`
      );
    }
  }, [hasVerified, searchParams, router, emailVerificationMutation]);

  useEffect(() => {
    verifyEmailToken();
  }, [verifyEmailToken]);

  return (
    <>
      <PageTitle title={PAGE_TITLES.VERIFY_EMAIL} />
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
          <VStack gap={{ base: 6, md: 8 }} maxW={{ base: "100%", md: "625px" }}>
            <Loader size="xl" color="blue.500" />

            <VStack maxW="497px" gap={{ base: 3, md: 4 }}>
              <Text
                fontSize={{ base: "24px", md: "36px" }}
                fontWeight="600"
                color="#18181B"
                lineHeight="1.21"
              >
                Verifying Your Email
              </Text>

              <Text
                fontSize={{ base: "sm", md: "md" }}
                color="#52525B"
                lineHeight="1.4"
              >
                Please wait while we verify your email address...
              </Text>
            </VStack>
          </VStack>
        </Box>
      </Container>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
