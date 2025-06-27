import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Spinner,
  Icon,
} from "@chakra-ui/react";
import { Calendar } from "lucide-react";
import { UseMutationResult } from "@tanstack/react-query";
import { useInviteStore } from "@/store";
import { Opportunity, InviteAcceptResponse } from "@/types/invite";

interface InviteCardProps {
  opportunity: Opportunity | undefined;
  onAccept: () => void;
  acceptInviteMutation: UseMutationResult<
    InviteAcceptResponse,
    any,
    { opportunityId: string; token: string },
    unknown
  >;
}

export const InviteCard = ({ opportunity, onAccept }: InviteCardProps) => {
  const { isAccepting, acceptError } = useInviteStore();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      textAlign="center"
      px={{ base: 4, md: 6, lg: 8 }}
      py={{ base: 8, md: 12, lg: 16 }}
    >
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
          onClick={onAccept}
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
    </Box>
  );
};
