import React from "react";
import { IconButton } from "@chakra-ui/react";
import { X } from "lucide-react";

interface ClearButtonProps {
  fieldLabel: string;
  onClear: () => void;
  show: boolean;
  props?: any;
}

export const ClearButton: React.FC<ClearButtonProps> = ({
  fieldLabel,
  onClear,
  show,
  props = {},
}) => {
  if (!show) return null;

  return (
    <IconButton
      aria-label={`Clear ${fieldLabel}`}
      size="sm"
      variant="ghost"
      h="40px"
      w="40px"
      borderRadius="15px"
      color="gray.500"
      _hover={{
        bg: "gray.100",
        color: "gray.700",
      }}
      onClick={onClear}
      {...props}
    >
      <X size={16} />
    </IconButton>
  );
};
