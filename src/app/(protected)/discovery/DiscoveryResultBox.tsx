import React from "react";
import { Box, VStack, HStack, Heading, Text, SimpleGrid } from "@chakra-ui/react";
import { UserProfile } from "@/types/discovery";
import { StudentCard, PartnerCard } from "./cards";

interface DiscoveryResultBoxProps {
  results: UserProfile[];
  count: number;
  isLoading: boolean;
  hasSearched: boolean;
  show: boolean;
  userType: string;
}

export function DiscoveryResultBox({
  results,
  count,
  isLoading,
  hasSearched,
  show,
  userType
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
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {results.map((user) => {
            const key = user.id || Math.random();
            
            return userType === 'student' ? (
              <StudentCard key={key} student={user} />
            ) : (
              <PartnerCard key={key} partner={user} />
            );
          })}
        </SimpleGrid>
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