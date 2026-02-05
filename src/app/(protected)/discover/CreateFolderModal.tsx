"use client";

import React, { useState } from "react";
import { Box, VStack, Text, Input, Field, Portal } from "@chakra-ui/react";
import Image from "next/image";
import { useCreateFolder } from "@/services/folder";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";

export interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunitySlug: string;
  onSuccess?: () => void;
}

export function CreateFolderModal({
  isOpen,
  onClose,
  opportunitySlug,
  onSuccess,
}: CreateFolderModalProps) {
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const createFolder = useCreateFolder();

  const handleClose = () => {
    setNewFolderName("");
    setNewFolderDescription("");
    onClose();
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
      handleClose();
      onSuccess?.();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { name?: string[] } } };
      toast.error(err.response?.data?.name?.[0] || "Failed to create folder");
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
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
            <Image
              src="/assets/cancel.svg"
              alt="Close"
              width={25}
              height={25}
            />
          </Button>

          <VStack align="stretch" gap={6}>
            <Text
              fontSize="24px"
              fontWeight="bold"
              color="#000000"
              textAlign="left"
            >
              Create New Folder
            </Text>

            <VStack align="stretch" gap={3}>
              <Field.Root>
                <Field.Label fontSize="14px" fontWeight="500" color="#000000">
                  Folder Name
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
                  onClick={handleClose}
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
                  isLoading={createFolder.isPending}
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
          </VStack>
        </Box>
      </Box>
    </Portal>
  );
}
