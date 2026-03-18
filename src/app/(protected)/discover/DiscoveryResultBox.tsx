import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  SimpleGrid,
  IconButton,
} from "@chakra-ui/react";
import { MenuPopover } from "@/components/ui/MenuPopover";
import { UserProfile } from "@/types/shared";
import { StudentCard, OrganisationCard } from "./cards";
import { PaginationControlsV2 } from "@/components/ui/PaginationControlsV2";
import Loader from "@/components/ui/Loader";
import { SearchInput } from "@/components/ui/SearchInput";
import { SortComponent } from "@/components/SortComponent";
import type { OpportunitySortBy } from "@/types/opportunity";
import IconMoreEllipsis from "@/components/Icons/IconMoreEllipsis";
import { X } from "lucide-react";
import { useRemoveMemberFromFolder } from "@/services/folder";
import { toast } from "react-toastify";
import { ButtonV2 } from "@/components/ui";
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

interface DiscoveryFolderInfo {
  id: number;
  name: string;
  description: string | null;
  member_count: number;
}

interface DiscoveryResultBoxProps {
  results: UserProfile[];
  isLoading: boolean;
  hasSearched: boolean;
  show: boolean;
  userType: string;
  opportunityId?: string;
  opportunitySlug?: string;
  folder?: DiscoveryFolderInfo;
  onClearFolder?: () => void;
  onRenameFolder?: (folder: DiscoveryFolderInfo) => void;
  onDeleteFolder?: (folder: DiscoveryFolderInfo) => void;
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
  folder,
  onClearFolder,
  onRenameFolder,
  onDeleteFolder,
  query,
  onQueryChange,
  sortBy,
  onSortChange,
}: DiscoveryResultBoxProps) {
  const removeMemberFromFolder = useRemoveMemberFromFolder();
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

  const handleRemoveFromFolder = useCallback(
    (folderId: string, memberId: number) => {
      removeMemberFromFolder.mutate(
        { folderId, memberId },
        {
          onSuccess: () =>
            toast.success("Member removed from folder successfully"),
          onError: () => toast.error("Failed to remove member from folder"),
        }
      );
    },
    [removeMemberFromFolder]
  );

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
        <HStack justify="space-between" align="center" w="full">
          {folder ? (
            <VStack align="flex-start" gap={0} flex={1} minW={0}>
              <HStack gap={2} align="center" w="full" justify="space-between">
                <Heading size="xl">{folder.name}</Heading>
                {(onRenameFolder || onDeleteFolder) && (
                  <MenuPopover
                    placement="bottom-end"
                    trigger={
                      <IconButton
                        aria-label="Folder options"
                        variant="ghost"
                        size="sm"
                      >
                        <IconMoreEllipsis color="#52525B" />
                      </IconButton>
                    }
                  >
                    {onRenameFolder && (
                      <Box
                        as="button"
                        w="full"
                        textAlign="left"
                        px={3}
                        py={2}
                        fontSize="sm"
                        color="#374151"
                        borderRadius="md"
                        _hover={{ bg: "#F3F4F6" }}
                        onClick={() => onRenameFolder(folder)}
                      >
                        Rename
                      </Box>
                    )}
                    {onDeleteFolder && (
                      <Box
                        as="button"
                        w="full"
                        textAlign="left"
                        px={3}
                        py={2}
                        fontSize="sm"
                        color="#DC2626"
                        borderRadius="md"
                        _hover={{ bg: "#FEF2F2" }}
                        onClick={() => onDeleteFolder(folder)}
                      >
                        Delete folder
                      </Box>
                    )}
                  </MenuPopover>
                )}
              </HStack>
              {/* {folder.description && (
                <Text fontSize="sm" color="#52525B" lineClamp={2}>
                  {folder.description}
                </Text>
              )} */}
              {/* <Text fontSize="sm" color="#71717A">
                {" "}
                You have {folder.member_count}{" "}
                {userType === "student" ? "students" : "organisations"}
              </Text> */}
            </VStack>
          ) : (
            <Heading size="xl">
              {userType === "student"
                ? "Available Students "
                : "Available Organisations"}
            </Heading>
          )}
        </HStack>

        <Box w="100%" maxW="679px">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search by name, skills, etc..."
          />
          {folder && onClearFolder && (
            <ButtonV2
              variant="ghost"
              size="sm"
              borderRadius="full"
              border="1px solid var(--border-100)"
              color="profile.500"
              fontSize="sm"
              fontWeight="500"
              mt={4}
              _hover={{ bg: "#EFF6FF" }}
              onClick={onClearFolder}
            >
              <X size={16} strokeWidth={2} />
              Clear folder filter
            </ButtonV2>
          )}
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
                const folderMemberId = (user as { folder_member_id?: number })
                  .folder_member_id;
                // We are in folder mode whenever a folder is selected — all
                // results returned in that context belong to the folder.
                const isInFolder = !!folder;
                const onRemoveFromFolder =
                  folder && folderMemberId
                    ? () =>
                        handleRemoveFromFolder(
                          folder.id.toString(),
                          folderMemberId
                        )
                    : undefined;

                return userType === "student" ? (
                  <StudentCard
                    key={key}
                    student={user}
                    userType={userType}
                    profilePictureUrl={user.profile_picture_url || null}
                    opportunityId={opportunityId}
                    opportunitySlug={opportunitySlug}
                    isInFolder={isInFolder}
                    onRemoveFromFolder={onRemoveFromFolder}
                  />
                ) : (
                  <OrganisationCard
                    key={key}
                    organisation={user}
                    opportunityId={opportunityId}
                    opportunitySlug={opportunitySlug}
                    isInFolder={isInFolder}
                    onRemoveFromFolder={onRemoveFromFolder}
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
