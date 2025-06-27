"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Container,
  Text,
  Button,
  VStack,
  HStack,
  Spinner,
  useBreakpointValue,
  Icon,
} from "@chakra-ui/react";
import { CheckCircle, Calendar, AlertCircle } from "lucide-react";
import { useInviteStore } from "@/store";
import { useOpportunityDetail, useAcceptInvite } from "@/hooks/useInvite";

function InviteContent() {
  const searchParams = useSearchParams();
  const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });
  const token = searchParams.get("token");
  const opportunityId = searchParams.get("opportunity");
  const [countdown, setCountdown] = useState(3);

  const { isAccepting, acceptError, clearError } = useInviteStore();
  const acceptInviteMutation = useAcceptInvite();
  const {
    data: opportunity,
    isLoading,
    error,
  } = useOpportunityDetail(opportunityId || "");

  useEffect(() => {
    clearError();
  }, [token, opportunityId, clearError]);

  useEffect(() => {
    if (acceptInviteMutation.isSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [acceptInviteMutation.isSuccess]);

  const handleAcceptInvite = () => {
    if (!token || !opportunityId) return;
    acceptInviteMutation.mutate({ opportunityId, token });
  };

  const CenteredLayout = ({
    children,
    fullHeight = false,
  }: {
    children: React.ReactNode;
    fullHeight?: boolean;
  }) => (
    <Container maxW={containerMaxW} p={0} h="100%">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight={fullHeight ? "100vh" : "60vh"}
        textAlign="center"
        px={{ base: 4, md: 6, lg: 8 }}
        py={{ base: 8, md: 12, lg: 16 }}
      >
        {children}
      </Box>
    </Container>
  );

  const StatusPage = ({
    icon,
    title,
    description,
    color = "red.500",
  }: {
    icon: any;
    title: string;
    description: string;
    color?: string;
  }) => (
    <CenteredLayout>
      <VStack gap={{ base: 6, md: 8 }}>
        <Icon as={icon} boxSize={{ base: 12, md: 16, lg: 20 }} color={color} />
        <Text
          fontSize={{ base: "24px", md: "32px", lg: "42px" }}
          fontWeight="700"
          color={color === "green.500" ? "green.600" : "black"}
          lineHeight="1.21"
        >
          {title}
        </Text>
        <Text
          fontSize={{ base: "14px", md: "18px", lg: "20px" }}
          color="black"
          maxWidth={{ base: "100%", md: "500px", lg: "600px" }}
          lineHeight="1.4"
          px={{ base: 2, md: 0 }}
        >
          {description}
        </Text>
      </VStack>
    </CenteredLayout>
  );

  if (!token || !opportunityId) {
    return (
      <StatusPage
        icon={AlertCircle}
        title="Invalid Invitation Link"
        description="The invitation link is invalid or incomplete. Please check the URL and try again."
      />
    );
  }

  if (isLoading) {
    return (
      <CenteredLayout>
        <VStack gap={{ base: 6, md: 8 }}>
          <Spinner size="xl" color="blue.500" borderWidth="4px" />
          <Text
            fontSize={{ base: "24px", md: "32px", lg: "42px" }}
            fontWeight="700"
            color="black"
          >
            Loading Invitation
          </Text>
          <Text
            fontSize={{ base: "14px", md: "18px", lg: "20px" }}
            color="black"
            maxWidth={{ base: "100%", md: "500px", lg: "600px" }}
            lineHeight="1.4"
            px={{ base: 2, md: 0 }}
          >
            Please wait while we load your invitation details...
          </Text>
        </VStack>
      </CenteredLayout>
    );
  }

  if (error) {
    return (
      <StatusPage
        icon={AlertCircle}
        title="Invitation Not Found"
        description="Unable to load invitation details. The opportunity may no longer exist."
      />
    );
  }

  if (acceptInviteMutation.isSuccess) {
    return (
      <CenteredLayout>
        <VStack gap={{ base: 6, md: 8 }}>
          <Icon
            as={CheckCircle}
            boxSize={{ base: 12, md: 16, lg: 20 }}
            color="green.500"
          />
          <Text
            fontSize={{ base: "24px", md: "32px", lg: "42px" }}
            fontWeight="700"
            color="green.600"
            lineHeight="1.21"
          >
            Invitation Accepted!
          </Text>
          <Text
            fontSize={{ base: "14px", md: "18px", lg: "20px" }}
            color="black"
            maxWidth={{ base: "100%", md: "500px", lg: "600px" }}
            lineHeight="1.4"
            px={{ base: 2, md: 0 }}
          >
            You have successfully joined &quot;{opportunity?.title}&quot;.
          </Text>
          <Text
            fontSize={{ base: "16px", md: "18px" }}
            color="gray.600"
            fontWeight="500"
          >
            Redirecting to dashboard in {countdown} seconds...
          </Text>
        </VStack>
      </CenteredLayout>
    );
  }

  return (
    <CenteredLayout fullHeight>
      <VStack
        gap={{ base: 6, md: 8 }}
        maxW={{ base: "100%", md: "600px", lg: "700px" }}
      >
        <Text
          fontSize={{ base: "28px", md: "36px", lg: "48px" }}
          fontWeight="700"
          color="black"
          lineHeight="1.21"
        >
          Opportunity Invitation
        </Text>

        <Box
          w="100%"
          bg="white"
          borderRadius="16px"
          p={{ base: 6, md: 8 }}
          boxShadow="0px 4px 20px rgba(0, 0, 0, 0.1)"
          border="1px solid"
          borderColor="gray.200"
        >
          <VStack gap={{ base: 4, md: 6 }} align="start">
            <Box>
              <Text
                fontSize={{ base: "10px", md: "12px" }}
                fontWeight="600"
                color="blue.600"
                textTransform="uppercase"
                letterSpacing="wider"
                mb={2}
              >
                Opportunity
              </Text>
              <Text
                fontSize={{ base: "20px", md: "24px", lg: "28px" }}
                fontWeight="700"
                color="black"
                lineHeight="1.2"
              >
                {opportunity?.title}
              </Text>
            </Box>

            <Text
              fontSize={{ base: "14px", md: "16px", lg: "18px" }}
              color="gray.600"
              lineHeight="1.5"
              textAlign="left"
            >
              {opportunity?.description}
            </Text>

            <HStack
              gap={4}
              color="gray.500"
              fontSize={{ base: "12px", md: "14px" }}
            >
              <HStack gap={2}>
                <Icon as={Calendar} boxSize={4} />
                <Text>
                  {opportunity?.start_date} - {opportunity?.end_date}
                </Text>
              </HStack>
            </HStack>

            <Box
              bg={opportunity?.is_active ? "green.100" : "gray.100"}
              color={opportunity?.is_active ? "green.700" : "gray.700"}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              fontWeight="500"
              w="fit-content"
            >
              {opportunity?.is_active ? "Active" : "Inactive"}
            </Box>
          </VStack>
        </Box>

        <Box
          w="100%"
          bg={acceptError ? "red.50" : "blue.50"}
          borderRadius="16px"
          p={{ base: 6, md: 8 }}
          border="1px solid"
          borderColor={acceptError ? "red.200" : "blue.200"}
        >
          <VStack gap={{ base: 3, md: 4 }}>
            <Text
              fontSize={{ base: "18px", md: "20px", lg: "24px" }}
              fontWeight="600"
              color={acceptError ? "red.700" : "black"}
              lineHeight="1.3"
            >
              {acceptError
                ? "Error!"
                : "You've been invited to join this opportunity!"}
            </Text>
            <Text
              fontSize={{ base: "14px", md: "16px", lg: "18px" }}
              color={acceptError ? "red.600" : "gray.600"}
              lineHeight="1.5"
            >
              {acceptError ||
                "Click the button below to accept your invitation and become a participant."}
            </Text>
          </VStack>
        </Box>

        <Button
          w={{ base: "280px", md: "320px", lg: "400px" }}
          h={{ base: "45px", md: "50px" }}
          bg={opportunity?.is_active ? "#002157" : "gray.400"}
          color="white"
          borderRadius="25px"
          fontSize={{ base: "16px", md: "18px", lg: "20px" }}
          fontWeight="500"
          onClick={handleAcceptInvite}
          disabled={isAccepting || !opportunity?.is_active}
          _hover={{ opacity: opportunity?.is_active ? 0.8 : 1 }}
          _active={{
            transform: opportunity?.is_active ? "scale(0.98)" : "none",
          }}
          boxShadow="0px 4px 4px 0px rgba(0, 0, 0, 0.25)"
          transition="all 0.2s ease"
          mt={{ base: 4, md: 6 }}
        >
          {isAccepting ? (
            <HStack gap={2}>
              <Spinner size="sm" />
              <Text>Accepting...</Text>
            </HStack>
          ) : (
            "Accept Invitation"
          )}
        </Button>

        {!opportunity?.is_active && (
          <Text
            fontSize={{ base: "12px", md: "14px" }}
            color="red.500"
            fontWeight="500"
          >
            This opportunity is no longer active and cannot be joined.
          </Text>
        )}
      </VStack>
    </CenteredLayout>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InviteContent />
    </Suspense>
  );
}
