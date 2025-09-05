import { forwardRef } from "react";
import { Input as ChakraInput, Field, Box, Textarea } from "@chakra-ui/react";
import { UseFormRegisterReturn } from "react-hook-form";
import { useAuthStore } from "@/store";

interface InputFieldProps {
  label?: string;
  error?: string;
  register: UseFormRegisterReturn;
  placeholder?: string;
  type?: "text" | "url" | "number" | "location" | "email";
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
    const { user } = useAuthStore();
    const inputType = type === "email" ? "email" : type;
    const defaultValue =
      type === "email" && user?.email ? user.email : undefined;

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
            ...(required && { marginLeft: "-11px" }),
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
              type={type === "location" ? "text" : inputType}
              placeholder={placeholder}
              h="60px"
              bg="white"
              fontSize="16px"
              px={icon ? 12 : 6}
              pl={icon ? "48px" : "24px"}
              style={{
                border: "1px solid #A2DDF0",
                borderRadius: "8px",
              }}
              _focus={{
                borderColor: "#A2DDF0",
                boxShadow: "0 0 0 1px #A2DDF0",
              }}
              _hover={{
                borderColor: "#A2DDF0",
              }}
              {...register}
              {...props}
              {...inputProps}
              {...(type === "email" && {
                autoComplete: "email",
                defaultValue: defaultValue,
              })}
            />
          </Box>
        </Box>
        {error && <Field.ErrorText mt={2}>{error}</Field.ErrorText>}
      </Field.Root>
    );
  }
);

InputField.displayName = "InputField";
