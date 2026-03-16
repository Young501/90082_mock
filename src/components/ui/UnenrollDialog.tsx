"use client";

import React from "react";
import {
  Dialog,
  Portal,
  Flex,
  HStack,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { ButtonV2 } from "./ButtonV2";
import { X } from "lucide-react";

interface UnenrollDialogProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export function UnenrollDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: UnenrollDialogProps) {
  const handleClose = () => onOpenChange({ open: false });

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details)}
      placement="center"
    >
      <Portal>
        <Dialog.Positioner
          zIndex={9999}
          style={{ backdropFilter: "blur(4px)" }}
        >
          <Dialog.Content maxW="512px" zIndex={10000}>
            <Dialog.Header>
              <Flex justify="space-between" w="full" align="center">
                <Dialog.Title fontSize="lg" fontWeight="bold">
                  Unenroll from Opportunity
                </Dialog.Title>
                <IconButton
                  aria-label="Close"
                  variant="ghost"
                  onClick={handleClose}
                >
                  <X size={16} color="#52525B" />
                </IconButton>
              </Flex>
            </Dialog.Header>
            <Dialog.Body>
              <Text fontSize="sm" color="#52525B">
                Are you sure you want to unenroll from this opportunity?
                Unenrolling removes your access to opportunities under this
                demo.
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <HStack gap={3} w="full">
                <ButtonV2
                  variant="ghost"
                  borderRadius="xl"
                  border="1px solid #E5E7EB"
                  h="40px"
                  color="#27272A"
                  fontSize="sm"
                  fontWeight="500"
                  px={4}
                  _hover={{ bg: "#F9FAFB", textDecoration: "none" }}
                  onClick={handleClose}
                  flex={1}
                >
                  Go Back
                </ButtonV2>
                <ButtonV2
                  bg="#DC2626"
                  borderRadius="xl"
                  h="40px"
                  fontSize="sm"
                  fontWeight="500"
                  px={4}
                  color="white"
                  onClick={onConfirm}
                  loading={isLoading}
                  flex={1}
                >
                  Yes, Unenroll
                </ButtonV2>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
