"use client";

import { Input as ChakraInput, Field, Box, Flex } from "@chakra-ui/react";
import { Control, Controller } from "react-hook-form";

const PREFIX = "https://";

interface UrlInputFieldProps {
  name: string;
  label?: string;
  control: Control<any>;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

function stripPrefix(value: string): string {
  if (!value) return "";
  return value.startsWith(PREFIX) ? value.slice(PREFIX.length) : value;
}

function ensurePrefix(value: string): string {
  if (!value?.trim()) return "";
  const trimmed = value.trim();
  return trimmed.startsWith(PREFIX) ? trimmed : `${PREFIX}${trimmed}`;
}

export const UrlInputField = ({
  name,
  label,
  control,
  placeholder = "yourwebsite.com",
  error,
  required,
}: UrlInputFieldProps) => {
  return (
    <Field.Root invalid={!!error}>
      {label && (
        <Field.Label
          fontSize="sm"
          fontWeight="500"
          color="black"
          mb={2}
          display="block"
        >
          {label}
          {required && (
            <span style={{ color: "red", marginLeft: "4px" }}>*</span>
          )}
        </Field.Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Flex
            align="stretch"
            borderRadius="sm"
            border="1px solid"
            borderColor="#E4E4E7"
            overflow="hidden"
            bg="white"
            w="full"
          >
            <Box
              px={4}
              py={3}
              bg="#F4F4F5"
              color="#52525B"
              fontSize="md"
              display="flex"
              alignItems="center"
              borderRight="1px solid"
              borderColor="#E4E4E7"
            >
              {PREFIX}
            </Box>
            <ChakraInput
              {...field}
              value={stripPrefix(field.value ?? "")}
              onChange={(e) => {
                const raw = e.target.value;
                field.onChange(ensurePrefix(raw));
              }}
              placeholder={placeholder}
              border="none"
              borderRadius={0}
              h="48px"
              w="full"
              flex={1}
              fontSize="16px"
              px={4}
              _focus={{
                outline: "none",
                boxShadow: "none",
              }}
              _focusVisible={{
                boxShadow: "none",
              }}
            />
          </Flex>
        )}
      />
      {error && <Field.ErrorText mt={2}>{error}</Field.ErrorText>}
    </Field.Root>
  );
};
