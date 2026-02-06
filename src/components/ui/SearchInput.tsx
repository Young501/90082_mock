import {
  Box,
  Input as ChakraInput,
  type InputProps as ChakraInputProps,
} from "@chakra-ui/react";
import { SearchIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: ReactNode;
  inputProps?: Omit<ChakraInputProps, "value" | "onChange" | "placeholder">;
  paddingX?: number;
  paddingY?: number;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  icon,
  inputProps,
  paddingX = 4,
  paddingY = 2.5,
}: SearchInputProps) {
  return (
    <Box
      as="label"
      w="100%"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="#D4D4D8"
      bg="white"
      px={paddingX}
      h="40px"
      py={paddingY}
      display="flex"
      alignItems="center"
      gap={2}
    >
      {icon ?? <SearchIcon size={16} color="#A1A1AA" />}
      <ChakraInput
        {...inputProps}
        border="none"
        outline="none"
        background="transparent"
        fontSize="sm"
        cursor="pointer"
        px={0}
        py={0}
        color="#A1A1AA"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Box>
  );
}
