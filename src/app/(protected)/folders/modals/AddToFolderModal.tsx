import React, { useState } from "react";
import { Box, Text, VStack, Input, Field } from "@chakra-ui/react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { SelectField } from "@/components/fields/SelectField";
import { useFolders, useAddMemberToFolder, useCreateFolder } from "@/services/folder";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import { FolderPlus } from "lucide-react";

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

interface FormData {
  selectedFolders: string[];
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
  memberType,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const { data: folders, isLoading: foldersLoading } = useFolders(opportunitySlug);
  const addMemberToFolder = useAddMemberToFolder();
  const createFolder = useCreateFolder();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      selectedFolders: [],
    },
  });

  if (!isOpen) return null;

  const folderNames = folders?.map((folder) => folder.name) || [];

  const onSubmit = async (data: FormData) => {
    if (!data.selectedFolders || data.selectedFolders.length === 0) {
      toast.error("Please select at least one folder");
      return;
    }

    setIsAdding(true);
    try {
      const selectedFolderIds =
        folders
          ?.filter((folder) => data.selectedFolders.includes(folder.name))
          .map((folder) => folder.id) || [];

      await Promise.all(
        selectedFolderIds.map((folderId) =>
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
        `${userName} has been added to ${data.selectedFolders.length} folder${data.selectedFolders.length > 1 ? "s" : ""} `
      );
      handleSuccessfulClose();
    } catch (error: any) {
      console.error(error.response);
      toast.error(error.response.data?.detail);
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    reset();
    setIsCreatingFolder(false);
    setNewFolderName("");
    setNewFolderDescription("");
    onClose();
    if (onResetBackground) {
      onResetBackground();
    }
  };

  const handleSuccessfulClose = () => {
    reset();
    setIsCreatingFolder(false);
    setNewFolderName("");
    setNewFolderDescription("");
    onClose();
    if (onAddToFolder) {
      onAddToFolder();
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    try {
      await createFolder.mutateAsync({
        name: newFolderName.trim(),
        description: newFolderDescription.trim() || undefined,
        opportunity: opportunitySlug,
      });
      toast.success("Folder created successfully");
      setNewFolderName("");
      setNewFolderDescription("");
      setIsCreatingFolder(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create folder");
    }
  };

  return (
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
      zIndex={1000}
      onClick={handleClose}
    >
      <Box
        bg="white"
        borderRadius="20px"
        w="90%"
        maxW="500px"
        p={6}
        onClick={(e) => e.stopPropagation()}
        position="relative"
      >
        <Button
          position="absolute"
          top={4}
          right={4}
          variant="ghost"
          size="sm"
          onClick={handleClose}
        >
          <Image src="/assets/cancel.svg" alt="Close" width={25} height={25} />
        </Button>

        <VStack align="stretch" gap={6}>
          <Text
            fontSize="24px"
            fontWeight="bold"
            color="#000000"
            textAlign="left"
          >
            Add {userName} to Folders
          </Text>

          {foldersLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <Loader size="lg" color="#2CA9DF" />
            </Box>
          ) : (
            <VStack align="stretch" gap={4}>
              {folderNames.length === 0 && !isCreatingFolder ? (
                <Box textAlign="center" py={4}>
                  <Text color="gray.600">
                    No folders available. Create a folder first to add users.
                  </Text>
                </Box>
              ) : !isCreatingFolder ? (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <VStack align="stretch" gap={4}>
                    <SelectField
                      name="selectedFolders"
                      label="Select Folders"
                      control={control}
                      options={folderNames}
                      placeholder="Choose folders to add user to..."
                      multiple={true}
                      required={true}
                      error={errors.selectedFolders?.message}
                    />

                    <Box display="flex" gap={4} justifyContent="flex-end" mt={4}>
                      <Button
                        type="submit"
                        fontSize="14px"
                        fontWeight="600"
                        h="40px"
                        variant="primary"
                        color="white"
                        borderRadius="8px"
                        loading={isAdding}
                        disabled={isAdding || folderNames.length === 0}
                        maxW="125px"
                        w="100%"
                      >
                        Add
                      </Button>
                    </Box>
                  </VStack>
                </form>
              ) : null}
              
              {isCreatingFolder ? (
                <VStack align="stretch" gap={3}>
                  <Field.Root>
                    <Field.Label fontSize="14px" fontWeight="500" color="#000000">
                      New Folder Name
                    </Field.Label>
                    <Input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Enter folder name"
                      h="45px"
                      borderRadius="8px"
                      border="1px solid #2CA9DF"
                      _focus={{
                        borderColor: "#2CA9DF",
                        boxShadow: "0 0 0 1px #2CA9DF",
                      }}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label fontSize="14px" fontWeight="500" color="#000000">
                      Description (optional)
                    </Field.Label>
                    <Input
                      value={newFolderDescription}
                      onChange={(e) => setNewFolderDescription(e.target.value)}
                      placeholder="Enter folder description"
                      h="45px"
                      borderRadius="8px"
                      border="1px solid #2CA9DF"
                      _focus={{
                        borderColor: "#2CA9DF",
                        boxShadow: "0 0 0 1px #2CA9DF",
                      }}
                    />
                  </Field.Root>
                  <Box display="flex" gap={3} justifyContent="flex-end" mt={2}>
                    <Button
                      variant="ghost"
                      bg="gray.200"
                      color="gray.700"
                      onClick={() => {
                        setIsCreatingFolder(false);
                        setNewFolderName("");
                        setNewFolderDescription("");
                      }}
                      fontSize="14px"
                      h="40px"
                      px={6}
                      borderRadius="15px"
                    >
                      Cancel
                    </Button>
                    <Button
                      bg="#2CA9DF"
                      color="white"
                      onClick={handleCreateFolder}
                      loading={createFolder.isPending}
                      disabled={!newFolderName.trim()}
                      fontSize="14px"
                      h="40px"
                      px={6}
                      borderRadius="15px"
                    >
                      Create
                    </Button>
                  </Box>
                </VStack>
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  gap={2}
                  cursor="pointer"
                  onClick={() => setIsCreatingFolder(true)}
                  color="#4a4a4a"
                  _hover={{ opacity: 0.8 }}
                  py={2}
                >
                  <FolderPlus size={20} />
                  <Text fontSize="14px" fontWeight="500">
                    Create New Folder
                  </Text>
                </Box>
              )}
            </VStack>
          )}
        </VStack>
      </Box>
    </Box>
  );
};
