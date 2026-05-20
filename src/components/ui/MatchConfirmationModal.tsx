import React from "react";
import { Box, VStack, HStack, Text, IconButton, Grid } from "@chakra-ui/react";
import { X } from "lucide-react";
import { ButtonV2 } from "@/components/ui/ButtonV2";

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
      inset={0}
      bg="blackAlpha.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
      p={4}
      onClick={onClose}
    >
      <Box
        bg="white"
        borderRadius="xl"
        boxShadow="xl"
        w="full"
        maxW="440px"
        p={6}
        onClick={(e) => e.stopPropagation()}
      >
        <VStack align="stretch" gap={4}>
          <HStack justify="space-between" align="flex-start">
            <Text fontSize="xl" fontWeight="600" color="#18181B">
              {title}
            </Text>
            <IconButton
              aria-label="Close"
              variant="ghost"
              size="sm"
              minW="fit-content"
              h="fit-content"
              onClick={onClose}
              disabled={isLoading}
            >
              <X size={20} color="#71717A" />
            </IconButton>
          </HStack>

          <Text fontSize="sm" color="#52525B" lineHeight="1.6">
            {message}
          </Text>

          <Grid templateColumns="1fr 2fr" gap={3} pt={2}>
            <ButtonV2
              variant="secondary"
              h="44px"
              fontSize="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </ButtonV2>
            <ButtonV2
              variant="primary"
              h="44px"
              fontSize="sm"
              onClick={onConfirm}
              isLoading={isLoading}
              disabled={isLoading}
            >
              {confirmText}
            </ButtonV2>
          </Grid>
        </VStack>
      </Box>
    </Box>
  );
};

export default MatchConfirmationModal;
