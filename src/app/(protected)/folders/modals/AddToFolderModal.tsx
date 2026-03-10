import React, { useState, useMemo } from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Input,
  SimpleGrid,
  IconButton,
  Avatar,
  Flex,
} from "@chakra-ui/react";
import { useFolders, useAddMemberToFolder } from "@/services/folder";
import { Folder } from "@/types/folder";
import { toast } from "react-toastify";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import Loader from "@/components/ui/Loader";
import { CreateFolderModal } from "@/app/(protected)/discover/CreateFolderModal";
import { formatRelativeTime } from "@/utils/formatDate";
import { Search, Plus, X, Folder as FolderIcon } from "lucide-react";
import Image from "next/image";

interface AddToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunitySlug: string;
  userId?: number;
  userName: string;
  organisationId?: number;
  onResetBackground?: () => void;
  onAddToFolder?: () => void;
  memberType?: "student" | "organisation";
}

export const AddToFolderModal: React.FC<AddToFolderModalProps> = ({
  isOpen,
  onClose,
  opportunitySlug,
  userId,
  userName,
  organisationId,
  onResetBackground,
  onAddToFolder,
  memberType = "organisation",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolderIds, setSelectedFolderIds] = useState<Set<number>>(
    new Set()
  );
  const [isAdding, setIsAdding] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  const { data: folders = [], isLoading: foldersLoading } =
    useFolders(opportunitySlug);
  const addMemberToFolder = useAddMemberToFolder();

  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return folders;
    const q = searchQuery.toLowerCase();
    return folders.filter((f) => f.name.toLowerCase().includes(q));
  }, [folders, searchQuery]);

  const memberLabelPlural =
    memberType === "organisation" ? "organisations" : "students";
  const entityLabel =
    memberType === "organisation" ? "organisation" : "student";

  const toggleFolder = (folderId: number) => {
    setSelectedFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const onSubmit = async () => {
    if (selectedFolderIds.size === 0) {
      toast.error("Please select at least one folder");
      return;
    }

    setIsAdding(true);
    try {
      await Promise.all(
        Array.from(selectedFolderIds).map((folderId) =>
          addMemberToFolder.mutateAsync({
            folderId: folderId.toString(),
            data:
              memberType === "student"
                ? { user_id: userId }
                : { organisation_id: organisationId },
          })
        )
      );

      toast.success(
        `${userName} has been added to ${selectedFolderIds.size} folder${selectedFolderIds.size > 1 ? "s" : ""}`
      );
      handleSuccessfulClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Failed to add to folder");
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedFolderIds(new Set());
    onClose();
    onResetBackground?.();
  };

  const handleSuccessfulClose = () => {
    setSearchQuery("");
    setSelectedFolderIds(new Set());
    onClose();
    onAddToFolder?.();
  };

  const handleCreateFolderSuccess = () => {
    setShowCreateFolder(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.600"
        display="flex"
        alignItems="center"
        justifyContent="center"
        zIndex={9999}
        onClick={handleClose}
      >
        <Box
          bg="white"
          borderRadius="xl"
          w={{ base: "95%", lg: "682px" }}
          maxH="80vh"
          display="flex"
          flexDirection="column"
          overflow="hidden"
          onClick={(e) => e.stopPropagation()}
          position="relative"
          boxShadow="xl"
        >
          <Box px={{ base: 4, lg: 5 }} pt={5} pb={4}>
            <HStack justify="space-between" align="flex-start">
              <VStack align="stretch" gap={1}>
                <Text fontSize="xl" fontWeight="600" color="#18181B">
                  Save {entityLabel} to Folder
                </Text>
                <Text fontSize="sm" color="#71717A">
                  Select folder(s) to save this {entityLabel} to. Folders are
                  scoped to your current opportunity.
                </Text>
              </VStack>
              <IconButton
                variant="ghost"
                size="sm"
                onClick={handleClose}
                aria-label="Close"
              >
                <X size={20} color="#71717A" />
              </IconButton>
            </HStack>

            <Box mt={4}>
              <Box
                position="relative"
                display="flex"
                alignItems="center"
                borderRadius="xl"
                border="1px solid"
                borderColor="#E4E4E7"
                bg="#FAFAFA"
                h="40px"
                w="100%"
              >
                <Box
                  position="absolute"
                  left={3}
                  display="flex"
                  alignItems="center"
                  color="#71717A"
                >
                  <Search size={18} />
                </Box>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search folders...`}
                  pl={10}
                  pr={4}
                  py={3}
                  border="none"
                  bg="transparent"
                  fontSize="sm"
                  _focus={{ outline: "none" }}
                />
              </Box>
            </Box>
          </Box>

          <Box flex={1} overflowY="auto" px={{ base: 4, lg: 5 }} py={4}>
            {foldersLoading ? (
              <Box display="flex" justifyContent="center" py={12}>
                <Loader size="lg" />
              </Box>
            ) : filteredFolders.length === 0 ? (
              <Box textAlign="center" py={12}>
                <Text color="#71717A" fontSize="sm">
                  {searchQuery
                    ? "No folders match your search."
                    : "No folders available. Create a folder first."}
                </Text>
              </Box>
            ) : (
              <SimpleGrid columns={2} gap={{ base: 4, lg: 5 }}>
                {filteredFolders.map((folder) => (
                  <FolderSelectCard
                    key={folder.id}
                    folder={folder}
                    memberLabelPlural={memberLabelPlural}
                    isSelected={selectedFolderIds.has(folder.id)}
                    onToggle={() => toggleFolder(folder.id)}
                  />
                ))}
              </SimpleGrid>
            )}
          </Box>

          <Box
            px={{ base: 4, lg: 5 }}
            py={4}
            display="flex"
            flexDirection={{ base: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems="center"
            gap={4}
            w="100%"
          >
            <ButtonV2
              variant="secondary"
              fontSize="md"
              w={{ base: "100%", lg: "fit-content" }}
              py={3}
              px={4}
              h="44px"
              onClick={() => setShowCreateFolder(true)}
              icon={<Plus size={16} color="#000000" />}
              border="1px solid #E4E4E7"
              bg="white"
              color="#27272A"
            >
              Create a New Folder
            </ButtonV2>
            <ButtonV2
              variant="primary"
              fontSize="md"
              w={{ base: "100%", lg: "fit-content" }}
              py={3}
              px={6}
              onClick={onSubmit}
              isLoading={isAdding}
              disabled={selectedFolderIds.size === 0}
              h="44px"
            >
              Save to Folder
            </ButtonV2>
          </Box>
        </Box>
      </Box>

      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        opportunitySlug={opportunitySlug}
        onSuccess={handleCreateFolderSuccess}
      />
    </>
  );
};

function FolderSelectCard({
  folder,
  memberLabelPlural,
  isSelected,
  onToggle,
}: {
  folder: Folder;
  memberLabelPlural: string;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <Box
      bg="white"
      borderRadius="lg"
      border={isSelected ? "2px solid #2AA8E0" : "1px solid #E4E4E7"}
      w="100%"
      h="180px"
      p={4}
      cursor="pointer"
      transition="border-color 0.2s, box-shadow 0.2s"
      _hover={{
        borderColor: isSelected ? "#2AA8E0" : "#D4D4D8",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
      onClick={onToggle}
      position="relative"
    >
      <Box
        position="absolute"
        top={3}
        right={3}
        w="18px"
        h="18px"
        borderRadius="4px"
        border="1px solid"
        borderColor={isSelected ? "#2AA8E0" : "#D4D4D8"}
        bg={isSelected ? "#2AA8E0" : "white"}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {isSelected && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="2 6 5 9 10 3" />
          </svg>
        )}
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        h="100%"
        justifyContent="space-between"
      >
        {folder.member_avatars && folder.member_avatars.length > 0 ? (
          <Flex>
            {folder.member_avatars.slice(0, 3).map((avatar, i) => (
              <Avatar.Root
                key={`${avatar.avatar_url}-${i}`}
                w="26px"
                h="26px"
                minW="26px"
                borderRadius="full"
                overflow="hidden"
                border="2px solid white"
                ml={i > 0 ? "-8px" : "0"}
                zIndex={3 - i}
              >
                <Avatar.Image src={avatar.avatar_url} alt={avatar.type} />
                <Avatar.Fallback color="white" fontSize="9px" fontWeight="500">
                  {avatar.type === "student" ? "S" : "O"}
                </Avatar.Fallback>
              </Avatar.Root>
            ))}
          </Flex>
        ) : (
          <Image
            src="/assets/grouporg2.png"
            alt="Folder"
            width={60}
            height={32}
            style={{ objectFit: "contain" }}
          />
        )}
        <VStack align="stretch" gap={1} minW={0}>
          <Text fontSize="sm" fontWeight="600" color="#18181B" lineClamp={2}>
            {folder.name}
          </Text>
          <Text fontSize="xs" fontWeight="400" color="#18181B" lineClamp={2}>
            {folder.description}
          </Text>
          <Text fontSize="xs" color="#71717A">
            {folder.member_count} {memberLabelPlural}
          </Text>
          {folder.updated_at && (
            <Text fontSize="xs" color="#A1A1AA">
              updated {formatRelativeTime(folder.updated_at)}
            </Text>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
