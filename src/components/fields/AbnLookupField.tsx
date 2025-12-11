import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Field, Input, Spinner, Text } from "@chakra-ui/react";
import { Control, UseFormSetError, useController } from "react-hook-form";
import { isAxiosError } from "axios";
import { useAbnValidation } from "@/services/shared";
import { useDebounce } from "@/hooks/useDebounce";
import { AbnValidationStatus } from "@/types/onboarding";

interface AbnLookupFieldProps {
  name: string;
  label?: string;
  control: Control<any>;
  required?: boolean;
  error?: string;
  organisationName?: string;
  setError: UseFormSetError<any>;
  clearErrors?: (name: string) => void;
  icon?: string;
  onStatusChange?: (status: AbnValidationStatus) => void;
}

const formatAbn = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const parts: string[] = [];
  if (digits.length <= 2) {
    return digits;
  }
  parts.push(digits.slice(0, 2));
  if (digits.length <= 5) {
    parts.push(digits.slice(2));
    return parts.join(" ");
  }
  parts.push(digits.slice(2, 5));
  if (digits.length <= 8) {
    parts.push(digits.slice(5));
    return parts.join(" ");
  }
  parts.push(digits.slice(5, 8));
  if (digits.length > 8) {
    parts.push(digits.slice(8));
  }
  return parts.join(" ").trim();
};

const INVALID_ABN_MESSAGE =
  "ABN did not match the registered organisation name. Please check both fields.";
const VALIDATION_ERROR_MESSAGE =
  "Unable to validate the ABN right now. Please try again.";

export const AbnLookupField = ({
  name,
  label,
  control,
  required,
  error,
  organisationName,
  setError,
  clearErrors,
  onStatusChange,
  icon,
}: AbnLookupFieldProps) => {
  const { field } = useController({ name, control });
  const [inputValue, setInputValue] = useState<string>(
    formatAbn((field.value as string) || "")
  );
  const [status, setStatus] = useState<AbnValidationStatus>("idle");
  const [matchedName, setMatchedName] = useState<string | null>(null);

  const abnDigits = inputValue.replace(/\D/g, "");
  const trimmedOrgName = (organisationName || "").trim();

  const debouncedAbn = useDebounce(abnDigits, 600);
  const debouncedOrgName = useDebounce(trimmedOrgName, 600);

  const { mutateAsync: validateAbn, reset: resetValidation } =
    useAbnValidation();
  const lastValidatedRef = useRef<{
    abn: string;
    organisation: string;
    valid?: boolean;
    matchedName?: string | null;
    errorMessage?: string | null;
  }>({ abn: "", organisation: "", errorMessage: null });

  const emitStatusChange = useCallback(
    (nextStatus: AbnValidationStatus) => {
      setStatus(nextStatus);
      if (onStatusChange) {
        onStatusChange(nextStatus);
      }
    },
    [onStatusChange]
  );

  useEffect(() => {
    const formatted = formatAbn((field.value as string) || "");
    if (formatted !== inputValue) {
      setInputValue(formatted);
    }
  }, [field.value, inputValue]);

  useEffect(() => {
    let isActive = true;
    const abn = debouncedAbn;
    const organisation = debouncedOrgName;

    if (!abn) {
      lastValidatedRef.current = { abn: "", organisation: "" };
      setMatchedName(null);
      emitStatusChange("idle");
      if (clearErrors) clearErrors(name);
      return () => {
        isActive = false;
      };
    }

    if (abn.length < 11) {
      if (
        lastValidatedRef.current.abn !== "" ||
        lastValidatedRef.current.organisation !== ""
      ) {
        lastValidatedRef.current = { abn: "", organisation: "" };
        setMatchedName(null);
        emitStatusChange("idle");
        if (clearErrors) clearErrors(name);
      }
      return () => {
        isActive = false;
      };
    }

    if (!organisation) {
      lastValidatedRef.current = { abn: "", organisation: "" };
      emitStatusChange("idle");
      setMatchedName(null);
      if (clearErrors) clearErrors(name);
      return () => {
        isActive = false;
      };
    }

    const cachedResult = lastValidatedRef.current;
    if (
      cachedResult.abn === abn &&
      cachedResult.organisation === organisation &&
      cachedResult.valid !== undefined
    ) {
      if (cachedResult.valid) {
        setMatchedName(cachedResult.matchedName || null);
        emitStatusChange("valid");
        if (clearErrors) clearErrors(name);
      } else {
        setMatchedName(cachedResult.matchedName || null);
        emitStatusChange("invalid");
        setError(name, {
          type: "manual",
          message: cachedResult.errorMessage || INVALID_ABN_MESSAGE,
        });
      }
      return () => {
        isActive = false;
      };
    }

    emitStatusChange("pending");
    setMatchedName(null);

    validateAbn({ abn, organisationName: organisation })
      .then((response) => {
        if (!isActive) return;
        lastValidatedRef.current = {
          abn,
          organisation,
          valid: response.valid,
          matchedName: response.matchedName ?? null,
          errorMessage: response.valid ? null : INVALID_ABN_MESSAGE,
        };

        if (response.valid) {
          setMatchedName(response.matchedName ?? null);
          emitStatusChange("valid");
          if (clearErrors) clearErrors(name);
        } else {
          setMatchedName(response.matchedName ?? null);
          emitStatusChange("invalid");
          setError(name, {
            type: "manual",
            message: INVALID_ABN_MESSAGE,
          });
        }
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        const axiosError = isAxiosError(error) ? error : null;
        const statusCode = axiosError?.response?.status;
        const responseData = axiosError?.response?.data as
          | { detail?: unknown }
          | undefined;
        const backendMessage =
          typeof responseData?.detail === "string"
            ? responseData.detail.trim()
            : null;
        const isInputError =
          statusCode === 400 || statusCode === 404 || statusCode === 422;

        if (isInputError) {
          const message = backendMessage || INVALID_ABN_MESSAGE;
          lastValidatedRef.current = {
            abn,
            organisation,
            valid: false,
            matchedName: null,
            errorMessage: message,
          };
          emitStatusChange("invalid");
          setMatchedName(null);
          setError(name, { type: "manual", message });
          return;
        }

        const message = backendMessage || VALIDATION_ERROR_MESSAGE;
        lastValidatedRef.current = {
          abn,
          organisation,
          valid: undefined,
          matchedName: null,
          errorMessage: message,
        };
        emitStatusChange("error");
        setMatchedName(null);
        setError(name, { type: "manual", message });
      });

    return () => {
      isActive = false;
      resetValidation();
    };
  }, [
    debouncedAbn,
    debouncedOrgName,
    validateAbn,
    resetValidation,
    clearErrors,
    name,
    setError,
    emitStatusChange,
  ]);

  const helperText = useMemo(() => {
    if (status === "pending") {
      return (
        <Text mt={2} fontSize="sm" color="gray.600" display="flex" gap={2}>
          <Spinner size="sm" />
          Validating ABN with ABR…
        </Text>
      );
    }
    if (status === "valid") {
      return (
        <Text mt={2} fontSize="sm" color="green.600">
          ABN verified
          {matchedName ? `: ${matchedName}` : ""}.
        </Text>
      );
    }
    if (status === "invalid" && matchedName) {
      return (
        <Text mt={2} fontSize="sm" color="red.600">
          Closest registered name: {matchedName}
        </Text>
      );
    }
    if (status === "error" && !error) {
      return (
        <Text mt={2} fontSize="sm" color="red.600">
          {VALIDATION_ERROR_MESSAGE}
        </Text>
      );
    }
    return null;
  }, [error, matchedName, status]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = event.target.value.replace(/\D/g, "");
    const formatted = formatAbn(digitsOnly);
    setInputValue(formatted);
    field.onChange(digitsOnly);
    setMatchedName(null);
    lastValidatedRef.current = { abn: "", organisation: "" };
    emitStatusChange("idle");
    if (clearErrors) clearErrors(name);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const digitsOnly = event.target.value.replace(/\D/g, "");
    field.onBlur();
    setInputValue(formatAbn(digitsOnly));
  };

  return (
    <Field.Root invalid={!!error}>
      <Box
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "4px",
          width: "100%",
          ...(required && { marginLeft: "-11px" }),
        }}
      >
        {required && (
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
          <Input
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={label}
            h="60px"
            bg="white"
            fontSize="16px"
            pl={icon ? "48px" : "24px"}
            border="1px solid #A2DDF0"
            borderRadius="8px"
            _focus={{
              borderColor: "#A2DDF0",
              boxShadow: "0 0 0 1px #A2DDF0",
            }}
            _hover={{
              borderColor: "#A2DDF0",
            }}
            inputMode="numeric"
            autoComplete="off"
            name={field.name}
            ref={field.ref}
          />
        </Box>
      </Box>
      {error && (
        <Field.ErrorText mt={2} fontSize="sm">
          {error}
        </Field.ErrorText>
      )}
      {!error && helperText}
    </Field.Root>
  );
};

AbnLookupField.displayName = "AbnLookupField";
