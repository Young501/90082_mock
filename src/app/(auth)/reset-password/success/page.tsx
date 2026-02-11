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
        px={{ base: 4, md: 6, lg: 8 }}
        py={{ base: 8, md: 12, lg: 16 }}
      >
        <VStack gap={{ base: 6, md: 8 }}>
          <SuccessBubbles />

          <Text
            fontSize={{ base: "24px", md: "32px", lg: "42px" }}
            fontWeight="700"
            color="black"
            lineHeight="1.21"
          >
            Password Reset Successfully!
          </Text>

          <Text
            fontSize={{ base: "14px", md: "18px", lg: "20px" }}
            color="black"
            maxWidth={{ base: "100%", md: "500px", lg: "600px" }}
            lineHeight="1.4"
            px={{ base: 2, md: 0 }}
          >
            Your password has been reset successfully. You can now log in to
            your account with your new password.
          </Text>

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
