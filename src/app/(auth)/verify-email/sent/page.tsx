"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Container,
  Text,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import SuccessBubbles from "@/components/Icons/SuccessBubbles";

function EmailSentContent() {
  const searchParams = useSearchParams();
  const [userEmail, setUserEmail] = useState("");
  const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });

  useEffect(() => {
    const email = searchParams.get("email") || "your email";
    setUserEmail(email);
  }, [searchParams]);

  return (
    <>
      <PageTitle title={PAGE_TITLES.VERIFY_EMAIL_SENT} />
      <Container maxW={containerMaxW} p={0} h="100%">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="60vh"
          textAlign="center"
        >
          <VStack gap={{ base: 6, md: 8 }} maxW={{ base: "100%", md: "625px" }}>
            <SuccessBubbles />

            <VStack maxW="497px" gap={{ base: 3, md: 4 }}>
              <Text
                fontSize={{ base: "24px", md: "36px" }}
                fontWeight="600"
                color="#18181B"
                lineHeight="1.21"
              >
                Thanks for signing up with us
              </Text>

              <Text
                fontSize={{ base: "sm", md: "md" }}
                color="#52525B"
                lineHeight="1.4"
              >
                We&apos;ve sent a verification email to{" "}
                <Text as="span" fontWeight="600">
                  {userEmail}
                </Text>
                {". "}
                Please click the “Verify email” button to continue.
              </Text>

              <Text
                fontSize={{ base: "sm", md: "md" }}
                color="#52525B"
                lineHeight="1.4"
              >
                If you don&apos;t see it, check your spam or junk folder.
              </Text>
            </VStack>
          </VStack>
        </Box>
      </Container>
    </>
  );
}

export default function EmailSentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailSentContent />
    </Suspense>
  );
}
