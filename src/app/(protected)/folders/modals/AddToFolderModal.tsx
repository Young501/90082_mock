import React, { useState } from "react";
import { Box, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { SelectField } from "@/components/fields/SelectField";
import { useFolders, useAddMemberToFolder } from "@/services/folder";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";

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
  const { data: folders, isLoading: foldersLoading } = useFolders(opportunitySlug);
  const addMemberToFolder = useAddMemberToFolder();

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
    onClose();
    if (onResetBackground) {
      onResetBackground();
    }
  };

  const handleSuccessfulClose = () => {
    reset();
    onClose();
    if (onAddToFolder) {
      onAddToFolder();
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
          ) : folderNames.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Text color="gray.600">
                No folders available. Create a folder first to add users.
              </Text>
            </Box>
          ) : (
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
          )}
        </VStack>
      </Box>
    </Box>
  );
};
