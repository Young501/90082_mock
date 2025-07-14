import React, { useState } from "react";
import { Box, Button, Text, VStack, Spinner } from "@chakra-ui/react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { SelectField } from "@/components/fields/SelectField";
import { useFolders, useAddMemberToFolder } from "@/services/folder";
import { toast } from "react-toastify";

interface AddToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

interface FormData {
  selectedFolders: string[];
}

export const AddToFolderModal: React.FC<AddToFolderModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const { data: folders, isLoading: foldersLoading } = useFolders();
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
            folderId,
            data: { user_id: userId },
          })
        )
      );

      toast.success(
        `${userName} has been added to ${data.selectedFolders.length} folder(s)`
      );
      handleClose();
    } catch (error: any) {
      console.error("Error adding user to folders:", error);
      toast.error("Failed to add user to folders. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
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
        boxShadow="0px 5.92px 11.84px 5.92px #00000040"
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
              <Spinner size="lg" color="#2CA9DF" />
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
                    bg="#282F68"
                    color="white"
                    borderRadius="8px"
                    h="40px"
                    fontSize="14px"
                    fontWeight="600"
                    loading={isAdding}
                    disabled={isAdding || folderNames.length === 0}
                    maxW="150px"
                    w="100%"
                  >
                    Add
                  </Button>
                  {/* <Button
                    bg="transparent"
                    color="#000000"
                    borderRadius="8px"
                    h="40px"
                    fontSize="14px"
                    fontWeight="600"
                    onClick={handleClose}
                    maxW="150px"
                    w="100%"
                    border="1px solid #000000"
                  >
                    Cancel
                  </Button> */}
                </Box>
              </VStack>
            </form>
          )}
        </VStack>
      </Box>
    </Box>
  );
};
