import { forwardRef } from "react";
import { Input as ChakraInput, Field, Box } from "@chakra-ui/react";
import { UseFormRegisterReturn } from "react-hook-form";

interface InputFieldProps {
  label?: string;
  error?: string;
  register: UseFormRegisterReturn;
  placeholder?: string;
  type?: "text" | "url" | "number" | "location";
  required?: boolean;
  inputProps?: any;
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
    return (
      <Field.Root invalid={!!error}>
        {label && (
          <Box mb={2}>
            <Field.Label
              fontSize="20px"
              fontWeight="400"
              color="#282F68"
              mb={4}
            >
              {label}
              {required && (
                <span style={{ color: "red", marginLeft: "4px" }}>*</span>
              )}
            </Field.Label>
          </Box>
        )}
        <Box
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "4px",
            width: "100%",
          }}
        >
          {!label && required && (
            <Box>
              {required && (
                <span style={{ color: "red", marginLeft: "4px" }}>*</span>
              )}
            </Box>
          )}
          <Box position="relative" width="100%">
            {icon && (
              <Box
                position="absolute"
                left="16px"
                top="50%"
                transform="translateY(-50%)"
                zIndex={2}
                pointerEvents="none"
              >
                <i
                  className={icon}
                  style={{
                    color: "#C3C3C3",
                    fontSize: "18px",
                  }}
                />
              </Box>
            )}
            <ChakraInput
              type={type === "location" ? "text" : type}
              placeholder={placeholder}
              h="60px"
              borderRadius="40px"
              border="2px solid"
              borderColor="#2CA9DF"
              bg="white"
              fontSize="16px"
              px={icon ? 12 : 6}
              pl={icon ? "48px" : "24px"}
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
          </Box>
        </Box>
        {error && <Field.ErrorText mt={2}>{error}</Field.ErrorText>}
      </Field.Root>
    );
  }
);

InputField.displayName = "InputField";
