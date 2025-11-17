"use client";
import React from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  SimpleGrid,
  HStack,
  Select,
  createListCollection,
} from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useFolderManagement,
  useFolderMembersManagement,
} from "@/hooks/useFolder";
import { FolderModal } from "@/app/(protected)/folders/modals/FolderModal";
import { FolderCard } from "@/app/(protected)/folders/modals/FolderCard";
import {
  useDeleteFolder,
  useFolderDetail,
  useRemoveMemberFromFolder,
} from "@/services/folder";
import { StudentCard } from "@/app/(protected)/discover/cards/studentCard";
import { PartnerCard } from "@/app/(protected)/discover/cards/partnerCard";
import { toast } from "react-toastify";
import { Folder as FolderType } from "@/types/folder";
import { useAuthStore } from "@/store";
import Loader from "@/components/ui/Loader";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { PaginationControls } from "@/components/ui/PaginationControls";

const Folder = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("id");
  const { user, accessibleOpportunities } = useAuthStore();
  const { folders, isLoadingFolders, folderModal } = useFolderManagement();
  const deleteFolder = useDeleteFolder();
  const removeMemberFromFolder = useRemoveMemberFromFolder();

  const { data: folderDetail, isLoading: isLoadingFolderDetail } =
    useFolderDetail(folderId || "");

  const {
    members: membersArray,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    memberType,
    isLoadingMembers,
    handlePageChange,
    handlePageSizeChange,
    handleMemberTypeChange,
  } = useFolderMembersManagement(folderId || "");

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await deleteFolder.mutateAsync(folderId);
      toast.success("Folder deleted successfully!");
    } catch (error: any) {
      toast.error(error.response.data?.detail);
    }
  };

  const handleEditFolder = (folder: FolderType) => {
    folderModal.onOpen(folder);
  };

  const handleFolderClick = (folderId: string) => {
    router.push(`/folders?id=${folderId}`);
  };

  const handleBackToFolders = () => {
    router.push("/folders");
  };

  const handleRemoveFromFolder = async (userId: string) => {
    if (!folderId) return;

    try {
      await removeMemberFromFolder.mutateAsync({
        folderId,
        userId,
      });
      toast.success("User removed from folder successfully");
    } catch (error: any) {
      toast.error(error.response.data?.detail);
    }
  };

  if (folderId) {
    return (
      <Box
        py={6}
        px={{ base: 4, lg: "72px" }}
        maxW="1512px"
        mx="auto"
        mt={{ base: "80px", lg: "126px" }}
      >
        <VStack align="stretch" gap={{ base: 6, md: 10, lg: 20 }}>
          <HStack gap={6} align="center">
            <Button
              onClick={handleBackToFolders}
              bg="#CFF3FF"
              color="#000000"
              borderRadius="8px"
              px={6}
              py={5}
              maxW="350px"
              boxShadow="0px 4px 4px 0px #00000040"
              h="auto"
              fontSize="22px"
              fontWeight="600"
              display="flex"
              alignItems="center"
              gap={6}
              _hover={{
                bg: "#B8E6FF",
              }}
            >
              <Image
                src="/assets/arrowbackicon.svg"
                alt="Add"
                width={8}
                height={8}
              />
              Back
            </Button>
            <Box>
              <Text
                fontSize={{ base: "20px", lg: "50px" }}
                fontWeight="700"
                color="#282F68"
              >
                {folderDetail?.name}
              </Text>
            </Box>
          </HStack>

          {isLoadingFolderDetail ? (
            <Box display="flex" justifyContent="center" py={10}>
              <Loader />
            </Box>
          ) : folderDetail ? (
            <VStack align="stretch" gap={6}>
              {isLoadingMembers ? (
                <Box display="flex" justifyContent="center" py={10}>
                  <Loader />
                </Box>
              ) : membersArray.length === 0 ? (
                <Box textAlign="center" py={20}>
                  <Text
                    fontSize="24px"
                    fontWeight="600"
                    color="#282F68"
                    mb={4}
                    textAlign="center"
                  >
                    No Users Added
                  </Text>
                  <Text fontSize="16px" color="#666">
                    Add members from the{" "}
                    <Link href="/discover" passHref>
                      <Text
                        as="span"
                        color="blue.500"
                        textDecoration="underline"
                        _hover={{ textDecoration: "none" }}
                      >
                        discover
                      </Text>
                    </Link>{" "}
                    page
                  </Text>
                </Box>
              ) : (
                <VStack align="stretch" gap={6}>
                  <HStack
                    justify={{ base: "flex-start", md: "space-between" }}
                    flexDir={{ base: "column", md: "row" }}
                    align="center"
                  >
                    <Text fontSize="18px" fontWeight="600" color="#282F68">
                      Members ({totalCount})
                    </Text>
                    <HStack gap={4}>
                      <Text fontSize="14px" color="gray.600">
                        Filter by type:
                      </Text>
                      <Select.Root
                        value={memberType ? [memberType] : [""]}
                        onValueChange={(details) => {
                          const value = details.value[0];
                          handleMemberTypeChange(
                            value === "" ? undefined : value
                          );
                        }}
                        disabled={isLoadingMembers}
                        width="150px"
                        size="sm"
                        collection={createListCollection({
                          items: [
                            { label: "All members", value: "" },
                            // only cater for student and organisation for now since folders will only have these two types of members and based on user type just show the relevant options
                            // if we need to cater for other types of members in a single folder we might require a different approach to present flow
                            ...(user?.user_types?.[0] === "student"
                              ? [
                                  {
                                    label: "Organisations only",
                                    value: "organisation",
                                  },
                                ]
                              : []),
                            ...(user?.user_types?.[0] === "organisation"
                              ? [{ label: "Students only", value: "student" }]
                              : []),
                          ],
                        })}
                      >
                        <Select.Control>
                          <Select.Trigger>
                            <Select.ValueText />
                          </Select.Trigger>
                          <Select.IndicatorGroup>
                            <Select.Indicator />
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Select.Positioner>
                          <Select.Content>
                            <Select.Item
                              item={{ label: "All members", value: "" }}
                            >
                              All members
                              <Select.ItemIndicator />
                            </Select.Item>
                            {user?.user_types?.[0] === "student" && (
                              <Select.Item
                                item={{
                                  label: "Organisations only",
                                  value: "organisation",
                                }}
                              >
                                Organisations only
                                <Select.ItemIndicator />
                              </Select.Item>
                            )}
                            {user?.user_types?.[0] === "organisation" && (
                              <Select.Item
                                item={{
                                  label: "Students only",
                                  value: "student",
                                }}
                              >
                                Students only
                                <Select.ItemIndicator />
                              </Select.Item>
                            )}
                          </Select.Content>
                        </Select.Positioner>
                      </Select.Root>
                    </HStack>
                  </HStack>

                  <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={6}>
                    {membersArray.map((member: any) => {
                      const userData = member.profile;
                      const userType = member.member_type;
                      const userId = member.id;

                      //  reference to comments on line 212
                      if (userType === "student") {
                        return (
                          <StudentCard
                            key={userId}
                            student={userData}
                            userType={userType}
                            profilePictureUrl={userData?.profile_picture_url}
                            isInFolder={true}
                            onRemoveFromFolder={() =>
                              handleRemoveFromFolder(userId.toString())
                            }
                          />
                        );
                      } else if (userType === "organisation") {
                        return (
                          <PartnerCard
                            key={userId}
                            organisation={userData}
                            profilePictureUrl={
                              userData?.profile?.profile_picture_url ||
                              userData?.logo_url
                            }
                            isInFolder={true}
                            onRemoveFromFolder={() =>
                              handleRemoveFromFolder(userId.toString())
                            }
                          />
                        );
                      }
                      return null;
                    })}
                  </SimpleGrid>

                  {totalPages > 1 && (
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      pageSize={pageSize}
                      totalCount={totalCount}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                      isLoading={isLoadingMembers}
                    />
                  )}
                </VStack>
              )}
            </VStack>
          ) : (
            <Box textAlign="center" py={20}>
              <Text fontSize="24px" fontWeight="600" color="#DC2626">
                Folder not found
              </Text>
            </Box>
          )}
        </VStack>
      </Box>
    );
  }

  return (
    <>
      <PageTitle title={PAGE_TITLES.FOLDERS} />
      <Box
        py={6}
        px={{ base: 4, lg: "72px" }}
        maxW="1512px"
        mx="auto"
        mt="126px"
      >
        <VStack align="stretch" gap={{ base: 6, md: 10, lg: 20 }}>
          <Button
            onClick={() => folderModal.onOpen()}
            bg="#CFF3FF"
            color="#000000"
            borderRadius="8px"
            px={6}
            py={5}
            maxW="350px"
            boxShadow="0px 4px 4px 0px #00000040"
            h="auto"
            fontSize="22px"
            fontWeight="600"
            display="flex"
            alignItems="center"
            gap={4}
            _hover={{
              bg: "#B8E6FF",
            }}
          >
            <Image src="/assets/plus.svg" alt="Add" width={16} height={16} />
            Create a New Folder
          </Button>

          {isLoadingFolders ? (
            <Loader />
          ) : folders.length === 0 ? (
            <Box
              bg="transparent"
              textAlign="center"
              minH="100%"
              my="auto"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <VStack
                gap={4}
                textAlign="center"
                h="100%"
                w="100%"
                justifyContent="center"
              >
                <Text fontSize="35px" fontWeight="700" color="#282F68">
                  You haven&apos;t created any folders yet.
                </Text>
                {user?.user_types?.[0] === "partner" ? (
                  <Text fontSize="22px" color="#000000" maxW="530px">
                    Use folders to organise and save student profiles
                    you&apos;re interested in. Create a folder to start building
                    your talent pipeline.
                  </Text>
                ) : (
                  <Text fontSize="22px" color="#000000" maxW="530px">
                    Use folders to organise and save organisation profiles
                    you&apos;re interested in. Create a folder to start building
                    your preferred opportunities.
                  </Text>
                )}
              </VStack>
            </Box>
          ) : (
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              gap={{ base: 10, md: 15, xl: 20 }}
              px={{ base: 10, md: 15, xl: 20 }}
            >
              {folders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onDelete={handleDeleteFolder}
                  onEdit={handleEditFolder}
                  onClick={() => handleFolderClick(folder.id)}
                />
              ))}
            </SimpleGrid>
          )}
        </VStack>

        <FolderModal
          isOpen={folderModal.isOpen}
          onClose={folderModal.onClose}
          onSubmit={folderModal.handleSubmit}
          register={folderModal.register}
          errors={folderModal.errors}
          isLoading={folderModal.isLoading}
          folder={folderModal.currentFolder}
        />
      </Box>
    </>
  );
};

export default Folder;
