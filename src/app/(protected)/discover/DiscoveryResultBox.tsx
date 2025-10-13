import React from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import { UserProfile } from "@/types/shared";
import { StudentCard, PartnerCard } from "./cards";
import { PaginationControls } from "@/components/ui/PaginationControls";
import Loader from "@/components/Loader";

interface DiscoveryResultBoxProps {
  results: UserProfile[];
  count: number;
  isLoading: boolean;
  hasSearched: boolean;
  show: boolean;
  userType: string;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  opportunityId?: string;
}

export function DiscoveryResultBox({
  results,
  count,
  isLoading,
  hasSearched,
  show,
  userType,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  opportunityId,
}: DiscoveryResultBoxProps) {
  if (!show) return null;

  return (
    <VStack align="stretch" gap={6}>
      <HStack justify="space-between" align="center">
        <Heading size="md">
          {hasSearched ? "Search Results" : "All Users"} ({count})
        </Heading>
      </HStack>

      {isLoading ? (
        <Loader type="component" />
      ) : count > 0 ? (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
            {results.map((user) => {
              const key = user.id || Math.random();

              return userType === "student" ? (
                <StudentCard
                  key={key}
                  student={user}
                  userType={userType}
                  profilePictureUrl={user.profile_picture_url || null}
                  opportunityId={opportunityId}
                />
              ) : (
                <PartnerCard
                  key={key}
                  organisation={user}
                  opportunityId={opportunityId}
                />
              );
            })}
          </SimpleGrid>

          <Box mt={6}>
            <PaginationControls
              currentPage={currentPage}
              totalPages={Math.max(totalPages, 1)}
              pageSize={pageSize}
              totalCount={count}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              isLoading={isLoading}
            />
          </Box>
        </>
      ) : (
        <>
          <Box textAlign="center" py={8}>
            <Text color="gray.500">
              {hasSearched
                ? "No results found. Try adjusting your search criteria or reset to view all users."
                : "No users found."}
            </Text>
          </Box>

          <Box mt={6}>
            <PaginationControls
              currentPage={1}
              totalPages={1}
              pageSize={pageSize}
              totalCount={0}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              isLoading={isLoading}
            />
          </Box>
        </>
      )}
    </VStack>
  );
}
