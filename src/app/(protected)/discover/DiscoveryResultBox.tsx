import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import { UserProfile } from "@/types/shared";
import { StudentCard, OrganisationCard } from "./cards";
import { PaginationControlsV2 } from "@/components/ui/PaginationControlsV2";
import Loader from "@/components/ui/Loader";
import { SearchInput } from "@/components/ui/SearchInput";
import { SortComponent } from "@/components/SortComponent";
import type { OpportunitySortBy } from "@/types/opportunity";
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
  pagination?: DiscoveryPaginationProps;
  query?: string;
  onQueryChange?: (query: string) => void;
  sortBy?: OpportunitySortBy | null;
  onSortChange?: (value: OpportunitySortBy | null) => void;
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
  query,
  onQueryChange,
  sortBy,
  onSortChange,
}: DiscoveryResultBoxProps) {
  // if (!show) return null;

  const count = pagination?.count ?? 0;

  // Keep previous results visible while loading so card DOM nodes (and their
  // images) stay mounted. Only swap to new results once loading is done.
  const [displayedResults, setDisplayedResults] = useState(results);
  useEffect(() => {
    if (!isLoading) setDisplayedResults(results);
  }, [isLoading, results]);

  const [searchInput, setSearchInput] = useState(query ?? "");

  useEffect(() => {
    setSearchInput(query ?? "");
  }, [query]);

  // Debounce query changes
  useEffect(() => {
    if (!onQueryChange) return;
    const handle = setTimeout(() => {
      onQueryChange(searchInput);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchInput, onQueryChange]);

  return (
    <VStack
      align="stretch"
      gap={6}
      w="100%"
      bg="white"
      borderRadius="xl"
      border="1px solid"
      borderColor="#E4E4E7"
      p={{ base: 4, md: 5 }}
      // h={{ base: "100%", lg: "calc(100vh - 355px)" }}
    >
      <VStack align="stretch" gap={3}>
        <HStack justify="space-between" align="center">
          <Heading size="xl">
            {userType === "student"
              ? "Available Students "
              : "Available Organisations"}
          </Heading>
        </HStack>

        <Box w="100%" maxW="679px">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search by name, skills, etc..."
          />
        </Box>
      </VStack>

      <HStack justify="space-between" align="center">
        <Text fontSize="sm" color="#52525B">
          {count} {userType === "student" ? "students" : "organisations"} found
        </Text>
        {onSortChange && (
          <SortComponent
            triggerLabel="Sort by"
            value={sortBy ?? null}
            onChange={onSortChange}
            options={[
              { label: "Distance", value: "distance" },
              // { label: "Best Match", value: "best_match" },
            ]}
          />
        )}
      </HStack>

      <Box position="relative">
        {isLoading && (
          <Box
            position="absolute"
            inset={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="whiteAlpha.700"
            zIndex={1}
            minH="120px"
          >
            <Loader />
          </Box>
        )}

        {!isLoading && count === 0 ? (
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
        ) : (
          <>
            <SimpleGrid
              columns={{ base: 1, md: 2 }}
              gap={4}
              h="100%"
              overflowY="auto"
            >
              {displayedResults.map((user) => {
                const key = user.id;

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
                  <OrganisationCard
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
        )}
      </Box>
    </VStack>
  );
}
