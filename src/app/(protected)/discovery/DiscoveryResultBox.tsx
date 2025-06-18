import React from "react";
import { Box, VStack, HStack, Heading, Text } from "@chakra-ui/react";
import { UserProfile } from "@/types/discovery";

interface DiscoveryResultBoxProps {
  results: UserProfile[];
  count: number;
  isLoading: boolean;
  hasSearched: boolean;
  show: boolean;
}

export function DiscoveryResultBox({
  results,
  count,
  isLoading,
  hasSearched,
  show
}: DiscoveryResultBoxProps) {
  if (!show) return null;

  return (
    <VStack align="stretch">
      <HStack justify="space-between" align="center">
        <Heading size="md">
          {hasSearched ? 'Search Results' : 'All Users'} ({count})
        </Heading>
      </HStack>

      {isLoading ? (
        <Box textAlign="center" py={8}>
          <Text>Loading...</Text>
        </Box>
      ) : count > 0 ? (
        <Box
          p={4}
          borderRadius="md"
          border="1px solid"
          borderColor="gray.200"
          bg="white"
          maxH="600px"
          overflowY="auto"
        >
          <Text fontSize="sm" fontFamily="mono" whiteSpace="pre-wrap">
            {JSON.stringify(results, null, 2)}
          </Text>
        </Box>
      ) : (
        <Box textAlign="center" py={8}>
          <Text color="gray.500">
            {hasSearched
              ? "No results found. Try adjusting your search criteria or reset to view all users."
              : "No users found."}
          </Text>
        </Box>
      )}
    </VStack>
  );
}