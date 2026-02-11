"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Text,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import SuccessBubbles from "@/components/Icons/SuccessBubbles";

export default function ResetPasswordSuccessPage() {
  const router = useRouter();
  const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });

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
              Password Reset Successfully!
            </Text>

            <Text
              fontSize={{ base: "sm", md: "md" }}
              color="#52525B"
              lineHeight="1.4"
            >
              Your password has been reset successfully. You can now log in to
              your account with your new password.
            </Text>
          </VStack>

          <ButtonV2
            variant="primary"
            h={{ base: "48px", md: "64px" }}
            fontSize="md"
            fontWeight="500"
            w="100%"
            px={{ base: 4, md: 7 }}
            py={{ base: 4, md: 4.5 }}
            onClick={handleLoginClick}
          >
            Go to Login
          </ButtonV2>
        </VStack>
      </Box>
    </Container>
  );
}
