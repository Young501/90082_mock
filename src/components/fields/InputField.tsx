import { forwardRef } from "react";
import { Input as ChakraInput, Field, Box } from "@chakra-ui/react";
import { UseFormRegisterReturn } from "react-hook-form";

interface InputFieldProps {
  label?: string;
  error?: string;
  register: UseFormRegisterReturn;
  placeholder?: string;
  type?: "text" | "url" | "number";
  required?: boolean;
  inputProps?: any;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      error,
      register,
      type = "text",
      required,
      placeholder,
      inputProps,
      ...props
    },
    _ref
  ) => (
    <Field.Root invalid={!!error}>
      {label && (
        <Box mb={2}>
          <Field.Label fontSize="20px" fontWeight="400" color="#282F68" mb={4}>
            {label}
            {required && (
              <span style={{ color: "red", marginLeft: "4px" }}>*</span>
            )}
          </Field.Label>
        </Box>
      )}
      <ChakraInput
        type={type}
        placeholder={placeholder}
        h="60px"
        borderRadius="30px"
        border="2px solid"
        borderColor="#2CA9DF"
        bg="white"
        fontSize="16px"
        px={6}
        _focus={{
          borderColor: "#2CA9DF",
          boxShadow: "0 0 0 1px #2CA9DF",
        }}
        _hover={{
          borderColor: "#2CA9DF",
        }}
        {...register}
        {...props}
        {...inputProps}
      />
      {error && <Field.ErrorText mt={2}>{error}</Field.ErrorText>}
    </Field.Root>
  )
);

InputField.displayName = "InputField";
