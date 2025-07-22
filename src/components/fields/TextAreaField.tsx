import { Box, Field, Text, Textarea } from "@chakra-ui/react";
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
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
    (
      {
        label,
        error,
        register,
        required,
        placeholder,
        inputProps,
        icon,
        ...props
      },
      _ref
    ) => {
      return (
        <Box>
          {label && (
            <Box mb={4}>
              <Text fontSize="18px" fontWeight="medium" mb={2}>
                {label}
                {required && <span style={{ color: "red", marginLeft: "4px" }}>*</span>}
              </Text>
            </Box>
          )}
          <Box style={{ width: "100%" }}>
            <Box position="relative" width="100%">
              <Textarea
                placeholder={placeholder}
                h="120px"
                bg="white"
                fontSize="16px"
                px={6}
                pl={icon ? "48px" : "24px"}
                style={{ border: "1px solid #A2DDF0", borderRadius: "8px" }}
                _focus={{ borderColor: "#A2DDF0", boxShadow: "0 0 0 1px #A2DDF0" }}
                _hover={{ borderColor: "#A2DDF0" }}
                {...register}
                {...props}
                {...inputProps}
              />
            </Box>
          </Box>
          {error && <Text mt={3} color="red.500">{error}</Text>}
        </Box>
      );
    }
  );

TextAreaField.displayName = "TextAreaField";