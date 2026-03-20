import React from "react";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { X } from "lucide-react";

export const DeleteModal = ({
  isOpen,
  onClose,
  onDelete,
  InFolder,
  onResetBackground,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  InFolder: boolean;
  onResetBackground?: () => void;
}) => {
  if (!isOpen) return null;

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
      zIndex={9999}
      onClick={() => {
        onClose();
        if (onResetBackground) {
          onResetBackground();
        }
      }}
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
        <VStack align="stretch" gap={8}>
          <VStack align="stretch" gap={2}>
            <HStack justify="space-between" align="center">
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="#000000"
                textAlign="left"
              >
                {InFolder ? "Remove from Folder" : "Delete Folder"}
              </Text>

              <ButtonV2
                variant="ghost"
                onClick={() => {
                  onClose();
                  if (onResetBackground) {
                    onResetBackground();
                  }
                }}
                p={0}
              >
                <X size={24} color="#71717A" />
              </ButtonV2>
            </HStack>

            <Text fontSize="sm" color="#52525B">
              {InFolder
                ? "This will remove them from your folder."
                : "Deleting this folder clears all your saved data."}
            </Text>
          </VStack>

          <Box display="flex" gap={4} w="100%">
            <ButtonV2
              variant="ghost"
              onClick={onClose}
              border="1px solid #E4E4E7"
              flex="1"
              color="black"
              borderRadius="xl"
            >
              Cancel
            </ButtonV2>
            <ButtonV2 variant="student" onClick={onDelete} flex="1">
              {InFolder ? "Remove" : "Delete"}
            </ButtonV2>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};
