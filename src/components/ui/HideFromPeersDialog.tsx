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

interface HideFromPeersDialogProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  isHidden: boolean;
}

export function HideFromPeersDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  isHidden,
}: HideFromPeersDialogProps) {
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
                  {isHidden ? "Show your profile to peers" : "Hide your profile from peers"}
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
                {isHidden
                  ? "Are you sure you want to show your profile? Other participants in this opportunity will be able to find you in search results."
                  : "Are you sure you want to hide your profile? You will no longer appear in search results for other participants in this opportunity. You can still access the opportunity normally."}
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
                  bg="#2CA9DF"
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
                  {isHidden ? "Yes, Show Profile" : "Yes, Hide Profile"}
                </ButtonV2>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
