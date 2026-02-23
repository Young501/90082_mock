"use client";

import React, { useState } from "react";
import {
  Box,
  VStack,
  Text,
  Input,
  Field,
  Portal,
  IconButton,
  Dialog,
} from "@chakra-ui/react";
import Image from "next/image";
import { useCreateFolder } from "@/services/folder";
import { toast } from "react-toastify";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { X } from "lucide-react";

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
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) {
          handleClose();
        }
      }}
      placement="center"
      trapFocus={true}
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" style={{ zIndex: 10000 }} />
        <Dialog.Positioner zIndex={10000}>
          <Dialog.Content
            bg="white"
            borderRadius="20px"
            w="90%"
            maxW="500px"
            p={6}
            position="relative"
          >
            <IconButton
              position="absolute"
              top={4}
              right={4}
              variant="ghost"
              size="sm"
              onClick={handleClose}
              aria-label="Close"
            >
              <X size={20} color="#52525B" />
            </IconButton>

            <VStack align="stretch" gap={6}>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="#000000"
                textAlign="left"
              >
                Create New Folder
              </Text>

              <VStack align="stretch" gap={3}>
                <Field.Root>
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name"
                    h="45px"
                    borderRadius="xl"
                    border="1px solid #E4E4E7"
                  />
                </Field.Root>
                <Field.Root>
                  <Input
                    value={newFolderDescription}
                    onChange={(e) => setNewFolderDescription(e.target.value)}
                    placeholder="Folder description"
                    h="45px"
                    borderRadius="xl"
                    border="1px solid #E4E4E7"
                  />
                </Field.Root>
              </VStack>
              <Box display="flex" gap={3} justifyContent="flex-start" mt={2}>
                <ButtonV2
                  variant="ghost"
                  bg="transparent"
                  color="black"
                  onClick={handleClose}
                  fontSize="14px"
                  border="1px solid #E4E4E7"
                  h="40px"
                  px={6}
                  borderRadius="xl"
                  w="155px"
                >
                  Cancel
                </ButtonV2>
                <ButtonV2
                  bg="#2AA8E0"
                  color="white"
                  flex={1}
                  onClick={handleCreateFolder}
                  isLoading={createFolder.isPending}
                  disabled={!newFolderName.trim()}
                  fontSize="14px"
                  h="40px"
                  px={6}
                  borderRadius="xl"
                >
                  Create
                </ButtonV2>
              </Box>
            </VStack>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
