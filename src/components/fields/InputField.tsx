import { forwardRef } from "react";
import { Input as ChakraInput, Field, Box, InputGroup } from "@chakra-ui/react";
import { UseFormRegisterReturn } from "react-hook-form";
import { useAuthStore } from "@/store";

interface InputFieldProps {
  label?: string;
  error?: string;
  register: UseFormRegisterReturn;
  placeholder?: string;
  type?: "text" | "url" | "number" | "location" | "email";
  required?: boolean;
  inputProps?: Record<string, unknown>;
  icon?: string;
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
      icon,
      ...props
    },
    _ref
  ) => {
    const { user } = useAuthStore();
    const inputType = type === "email" ? "email" : type;
    const defaultValue =
      type === "email" && user?.email ? user.email : undefined;

    const startElement = icon ? (
      <Box display="flex" alignItems="center">
        <i className={icon} style={{ color: "#9CA3AF", fontSize: "18px" }} />
      </Box>
    ) : undefined;

    return (
      <Field.Root invalid={!!error}>
        {label && (
          <Field.Label
            fontSize="sm"
            fontWeight="500"
            color="black"
            display="block"
          >
            {label}
            {required && (
              <span style={{ color: "red", marginLeft: "4px" }}>*</span>
            )}
          </Field.Label>
        )}
        <InputGroup startElement={startElement}>
          <ChakraInput
            type={type === "location" ? "text" : inputType}
            placeholder={placeholder}
            h="48px"
            bg="white"
            fontSize="16px"
            px={6}
            borderRadius="sm"
            border="1px solid"
            borderColor="#E4E4E7"
            _focus={{
              outline: "none",
              borderColor: "#E4E4E7",
              boxShadow: "0 0 0 1px #E4E4E7",
            }}
            {...register}
            {...props}
            {...inputProps}
            {...(type === "email" && {
              autoComplete: "email",
              defaultValue: defaultValue,
            })}
          />
        </InputGroup>
        {error && <Field.ErrorText>{error}</Field.ErrorText>}
      </Field.Root>
    );
  }
);

InputField.displayName = "InputField";
