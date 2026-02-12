"use client";

import {
  Input as ChakraInput,
  Field,
  Box,
  InputGroup,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { ReactNode, useState, useEffect, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps {
  label?: string;
  type?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
  startElement?: ReactNode;
  endElement?: ReactNode;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  labelStyle?: "floating" | "top";
  variant?: "default" | "signup";
  inputStyles?: Record<string, unknown>;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      type = "text",
      name,
      value,
      onChange,
      placeholder,
      error,
      autoComplete,
      startElement,
      endElement,
      showPasswordToggle,
      showPassword,
      onTogglePassword,
      labelStyle = "top",
      variant = "default",
      onBlur,
      onFocus,
      inputStyles,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value);

    useEffect(() => {
      setHasValue(!!value);
    }, [value]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const isSignupVariant = variant === "signup";
    // const inputStyles = isSignupVariant
    //   ? {
    //       borderColor: "gray.300",
    //       _focus: { borderColor: "#002157", boxShadow: "0 0 0 1px #002157" },
    //       _hover: { borderColor: "gray.400" },
    //     }
    //   : {
    //       borderColor: "#2CA9DF",
    //       _focus: { borderColor: "#2CA9DF", boxShadow: "0 0 0 1px #2CA9DF" },
    //       _hover: { borderColor: "#2CA9DF" },
    //     };

    if (labelStyle === "floating") {
      return (
        <Field.Root invalid={!!error}>
          <Box position="relative" w="100%">
            <Text
              position="absolute"
              left={6}
              top="50%"
              transform={
                hasValue || isFocused
                  ? "translateY(-50%) translateY(-12px) scale(0.85)"
                  : "translateY(-50%)"
              }
              transformOrigin="left"
              transition="all 0.2s ease"
              fontSize="16px"
              fontWeight="400"
              color={
                hasValue || isFocused
                  ? isSignupVariant
                    ? "#002157"
                    : "#2CA9DF"
                  : "#282F68"
              }
              pointerEvents="none"
              bg="white"
              px={1}
              zIndex={1}
            >
              {label}
            </Text>
            <InputGroup
              startElement={startElement}
              endElement={
                showPasswordToggle ? (
                  <IconButton
                    variant="ghost"
                    size="sm"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={onTogglePassword}
                    mr={2}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </IconButton>
                ) : (
                  endElement
                )
              }
            >
              <ChakraInput
                ref={ref}
                type={
                  showPasswordToggle
                    ? showPassword
                      ? "text"
                      : "password"
                    : type
                }
                name={name}
                autoComplete={autoComplete}
                value={value}
                onChange={onChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder=" "
                h="60px"
                borderRadius="10px"
                border="2px solid"
                bg="white"
                fontSize="16px"
                px={6}
                pt={hasValue || isFocused ? 4 : 0}
                {...inputStyles}
              />
            </InputGroup>
          </Box>
          {error && <Field.ErrorText mt={2}>{error}</Field.ErrorText>}
        </Field.Root>
      );
    }

    return (
      <Field.Root invalid={!!error}>
        {label && (
          <Box>
            <Field.Label fontSize="sm" fontWeight="500" color="black">
              {label}
            </Field.Label>
          </Box>
        )}
        <InputGroup
          startElement={startElement}
          endElement={
            showPasswordToggle ? (
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={onTogglePassword}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </IconButton>
            ) : (
              endElement
            )
          }
        >
          <ChakraInput
            ref={ref}
            type={
              showPasswordToggle ? (showPassword ? "text" : "password") : type
            }
            name={name}
            autoComplete={autoComplete}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            h="60px"
            borderRadius={isSignupVariant ? "10px" : "30px"}
            border="2px solid #E4E4E7"
            // _focus={{ borderColor: "#E4E4E7", boxShadow: "0 0 0 1px #E4E4E7" }}
            // _hover={{ borderColor: "#E4E4E7" }}
            bg="white"
            fontSize="16px"
            px={6}
            {...inputStyles}
          />
        </InputGroup>
        {error && <Field.ErrorText>{error}</Field.ErrorText>}
      </Field.Root>
    );
  }
);

InputField.displayName = "InputField";
