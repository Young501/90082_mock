import React from "react";
import {
  Box,
  VStack,
  Text,
  Button,
} from "@chakra-ui/react";

interface MatchConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  isLoading?: boolean;
}

const MatchConfirmationModal: React.FC<MatchConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText = "Cancel",
  isLoading = false,
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
    >
      <Box
        bg="white"
        borderRadius="20px"
        w="90%"
        maxW="400px"
        p={6}
        boxShadow="0px 5.92px 11.84px 5.92px #00000040"
        onClick={(e) => e.stopPropagation()}
        position="relative"
      >
        <VStack align="stretch" gap={6}>
          <Text fontSize="24px" fontWeight="bold" color="#000000">
            {title}
          </Text>
          <Text fontSize="16px" color="#666666">
            {message}
          </Text>
          <Box display="flex" gap={4} justifyContent="flex-end">
            <Button
              bg="transparent"
              color="#000000"
              borderRadius="8px"
              h="40px"
              fontSize="14px"
              fontWeight="600"
              onClick={onClose}
              border="1px solid #000000"
              px={6}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              bg="#002157"
              color="white"
              borderRadius="8px"
              h="40px"
              fontSize="14px"
              fontWeight="600"
              onClick={onConfirm}
              px={6}
              loading={isLoading}
              _hover={{ bg: "#003580" }}
              _active={{
                bg: "#000E2A",
                transform: "scale(0.95)",
              }}
              transition="all 0.2s"
            >
              {confirmText}
            </Button>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default MatchConfirmationModal; 