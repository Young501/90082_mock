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
import { PaginationControlsV2 } from "@/components/ui/PaginationControlsV2";
import Loader from "@/components/ui/Loader";
export interface DiscoveryPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  count: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

interface DiscoveryResultBoxProps {
  results: UserProfile[];
  isLoading: boolean;
  hasSearched: boolean;
  show: boolean;
  userType: string;
  opportunityId?: string;
  opportunitySlug?: string;
  /** Optional; when omitted, pagination block is not rendered */
  pagination?: DiscoveryPaginationProps;
}

export function DiscoveryResultBox({
  results,
  isLoading,
  hasSearched,
  show,
  userType,
  pagination,
  opportunityId,
  opportunitySlug,
}: DiscoveryResultBoxProps) {
  if (!show) return null;

  const count = pagination?.count ?? 0;

  return (
    <VStack align="stretch" gap={6} w="100%">
      <HStack justify="space-between" align="center">
        <Heading size="md">
          {hasSearched ? "Search Results" : "All Users"} ({count})
        </Heading>
      </HStack>

      {isLoading ? (
        <Text>Loading...</Text>
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
                  opportunitySlug={opportunitySlug}
                />
              ) : (
                <PartnerCard
                  key={key}
                  organisation={user}
                  opportunityId={opportunityId}
                  opportunitySlug={opportunitySlug}
                />
              );
            })}
          </SimpleGrid>

          {pagination && (
            <Box mt={6}>
              <PaginationControlsV2
                currentPage={pagination.currentPage}
                totalPages={Math.max(pagination.totalPages, 1)}
                pageSize={pagination.pageSize}
                totalCount={pagination.count}
                hasNext={pagination.hasNext}
                hasPrevious={pagination.hasPrevious}
                onPageChange={pagination.onPageChange}
                onPageSizeChange={pagination.onPageSizeChange}
                isLoading={isLoading}
                itemLabel={
                  userType === "student" ? "students" : "organisations"
                }
              />
            </Box>
          )}
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

          {pagination && (
            <Box mt={6}>
              <PaginationControlsV2
                currentPage={1}
                totalPages={1}
                pageSize={pagination.pageSize}
                totalCount={0}
                hasNext={pagination.hasNext}
                hasPrevious={pagination.hasPrevious}
                onPageChange={pagination.onPageChange}
                onPageSizeChange={pagination.onPageSizeChange}
                isLoading={isLoading}
                itemLabel={
                  userType === "student" ? "students" : "organisations"
                }
              />
            </Box>
          )}
        </>
      )}
    </VStack>
  );
}
