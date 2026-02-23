import { Box, Field, Text, Textarea, VStack } from "@chakra-ui/react";
import { UseFormRegisterReturn } from "react-hook-form";
import { forwardRef } from "react";

interface TextAreaFieldProps {
  label?: string;
  error?: string;
  register: UseFormRegisterReturn;
  placeholder?: string;
  required?: boolean;
  inputProps?: any;
  icon?: string;
  maxLength?: number;
}

export const TextAreaField = forwardRef<
  HTMLTextAreaElement,
  TextAreaFieldProps
>(
  (
    {
      label,
      error,
      register,
      required,
      placeholder,
      inputProps,
      icon,
      maxLength,
      ...props
    },
    _ref
  ) => {
    return (
      <Field.Root invalid={!!error}>
        <VStack align="stretch" gap={1.5} w="100%">
          {label && (
            <Field.Label fontSize="sm" fontWeight="500" color="black">
              {label}
              {required && (
                <span style={{ color: "red", marginLeft: "4px" }}>*</span>
              )}
            </Field.Label>
          )}
          <Box style={{ width: "100%" }}>
            <Box position="relative" width="100%">
              <Textarea
                placeholder={placeholder}
                h="80px"
                bg="white"
                fontSize="sm"
                px={4}
                pl={icon ? "40px" : "16px"}
                style={{ border: "1px solid #E4E4E7", borderRadius: "4px" }}
                {...register}
                {...props}
                {...inputProps}
                maxLength={maxLength}
              />
            </Box>
          </Box>
          {maxLength && (
            <Text fontSize="xs" color="#71717A">
              Maximum {maxLength} characters
            </Text>
          )}
          {error && <Field.ErrorText>{error}</Field.ErrorText>}
        </VStack>
      </Field.Root>
    );
  }
);

TextAreaField.displayName = "TextAreaField";
