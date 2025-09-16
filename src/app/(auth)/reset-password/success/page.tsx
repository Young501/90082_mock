"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Text,
  Button,
  VStack,
  Icon,
  useBreakpointValue,
} from "@chakra-ui/react";
import { CheckCircle } from "lucide-react";

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
          <Icon
            as={CheckCircle}
            boxSize={{ base: 12, md: 16, lg: 20 }}
            color="green.500"
          />

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

          <Button
            w={{ base: "280px", md: "320px", lg: "400px" }}
            h={{ base: "45px", md: "50px" }}
            bg="#002157"
            color="white"
            borderRadius="25px"
            fontSize={{ base: "16px", md: "18px", lg: "20px" }}
            fontWeight="500"
            onClick={handleLoginClick}
            _hover={{ opacity: 0.8 }}
            _active={{ transform: "scale(0.98)" }}
            boxShadow="0px 4px 4px 0px rgba(0, 0, 0, 0.25)"
            transition="all 0.2s ease"
            mt={{ base: 4, md: 6 }}
          >
            Go to Login
          </Button>
        </VStack>
      </Box>
    </Container>
  );
}
