import React from "react";
import { Box, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

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
      zIndex={1000}
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
        <Button
          position="absolute"
          top={4}
          right={4}
          variant="ghost"
          size="sm"
          onClick={() => {
            onClose();
            if (onResetBackground) {
              onResetBackground();
            }
          }}
        >
          <Image src="/assets/cancel.svg" alt="Close" width={25} height={25} />
        </Button>

        <VStack align="stretch" gap={6} pt={4}>
          <Text
            fontSize="24px"
            fontWeight="bold"
            color="#000000"
            textAlign="left"
          >
            {InFolder ? "Remove from Folder" : "Delete Folder"}
          </Text>

          <Text fontSize="16px" color="#666666">
            Are you sure you want to{" "}
            {InFolder ? "remove this user" : "delete this folder"}?
          </Text>

          <Box display="flex" gap={4} justifyContent="flex-end">
            <Button
              variant="student"
              borderRadius="8px"
              h="40px"
              fontSize="14px"
              fontWeight="600"
              onClick={onDelete}
              px={6}
            >
              Delete
            </Button>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};
