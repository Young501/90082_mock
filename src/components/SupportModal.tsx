"use client";

import React from "react";
import { Dialog, Flex, IconButton, Portal } from "@chakra-ui/react";
import { X } from "lucide-react";
import { SupportContent } from "./SupportContent";

interface SupportModalProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
}

export function SupportModal({ open, onOpenChange }: SupportModalProps) {
  const handleClose = () => onOpenChange({ open: false });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} placement="center">
      <Portal>
        <Dialog.Positioner zIndex={9999} style={{ backdropFilter: "blur(4px)" }}>
          <Dialog.Content maxW="560px" zIndex={10000}>
            <Dialog.Header>
              <Flex justify="space-between" w="full" align="center">
                <Dialog.Title fontSize="lg" fontWeight="bold">
                  Support
                </Dialog.Title>
                <IconButton aria-label="Close" variant="ghost" onClick={handleClose}>
                  <X size={16} color="#52525B" />
                </IconButton>
              </Flex>
            </Dialog.Header>
            <Dialog.Body pb={6}>
              <SupportContent isActive={open} />
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
