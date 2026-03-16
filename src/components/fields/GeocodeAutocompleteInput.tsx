"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { Box, Input, InputGroup, Text, Field } from "@chakra-ui/react";
import { MapPin } from "lucide-react";
import { useGeocode } from "@/services/shared";
import { useDebounce } from "@/hooks/useDebounce";
import { GeocodeResult } from "@/types/shared";
import { UseFormRegisterReturn, Control, useController } from "react-hook-form";
import Loader from "@/components/ui/Loader";

interface GeocodeAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: GeocodeResult) => void;
  onLocationUpdate?: (result: GeocodeResult) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  isProfilePage?: boolean;
  label?: string;
  name?: string;
  control?: Control<any>;
  icon?: string;
}

export const GeocodeAutocompleteInput = memo(
  ({
    value,
    onChange,
    onSelect,
    onLocationUpdate,
    placeholder = "Start typing city or address",
    required = false,
    error,
    isProfilePage = false,
    label,
    name,
    control,
    icon,
  }: GeocodeAutocompleteInputProps) => {
    const normalizeToString = (v: unknown): string =>
      typeof v === "string"
        ? v
        : (v as any)?.formatted_address != null
          ? String((v as any).formatted_address)
          : "";

    const [inputValue, setInputValue] = useState(() =>
      normalizeToString(value)
    );
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<GeocodeResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const userHasInteractedRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isLoadingRef = useRef(false);

    const controller =
      control && name
        ? useController({
            name,
            control,
          })
        : null;

    const fieldError = error || controller?.fieldState?.error?.message;

    const geocodeMutation = useGeocode();
    const debouncedInputValue = useDebounce(inputValue, 1000);
    const mutationRef = useRef(geocodeMutation.mutateAsync);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
      mutationRef.current = geocodeMutation.mutateAsync;
    }, [geocodeMutation.mutateAsync]);

    useEffect(() => {
      if (!userHasInteractedRef.current) return;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const searchValue = normalizeToString(debouncedInputValue);

      if (searchValue && searchValue.trim().length >= 2) {
        const trimmedAddress = searchValue.trim();
        if (!trimmedAddress || trimmedAddress.length < 2) {
          setResults([]);
          setIsLoading(false);
          isLoadingRef.current = false;
          return;
        }

        if (isLoadingRef.current) {
          return;
        }

        setIsLoading(true);
        isLoadingRef.current = true;

        mutationRef
          .current(trimmedAddress)
          .then((response) => {
            if (
              response &&
              response.formatted_address &&
              response.latitude &&
              response.longitude
            ) {
              setResults([response]);
            } else {
              setResults([]);
            }
          })
          .catch((error: any) => {
            if (error.name !== "AbortError") {
              console.error("Geocoding error:", error);
              setResults([]);
            }
          })
          .finally(() => {
            setIsLoading(false);
            isLoadingRef.current = false;
          });
      } else {
        setResults([]);
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    }, [debouncedInputValue]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        userHasInteractedRef.current = true;
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);

        // Update the form controller
        if (controller) {
          controller.field.onChange(newValue);
        }

        if (newValue.trim().length >= 2) {
          setIsOpen(true);
        } else {
          setIsOpen(false);
          setResults([]);
        }
      },
      [onChange, controller]
    );

    const handleSelect = useCallback(
      (result: GeocodeResult) => {
        const formattedAddress = result.formatted_address;
        setInputValue(formattedAddress);
        onChange(formattedAddress);
        onSelect(result);

        // Update the form controller
        if (controller) {
          controller.field.onChange(formattedAddress);
        }

        if (isProfilePage && onLocationUpdate) {
          onLocationUpdate(result);
        }

        setIsOpen(false);
      },
      [onChange, onSelect, isProfilePage, onLocationUpdate, controller]
    );

    useEffect(() => {
      const str = normalizeToString(value);
      setInputValue(str);
      if (controller && controller.field.value !== value) {
        controller.field.onChange(str);
      }
    }, [value, controller]);

    const startElement = (
      <Box display="flex" alignItems="center">
        {icon && (
          <i className={icon} style={{ color: "#9CA3AF", fontSize: "18px" }} />
        )}
      </Box>
    );

    return (
      <Field.Root invalid={!!fieldError}>
        <Box ref={containerRef} position="relative" width="100%">
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
          <InputGroup startElement={startElement}>
            <Input
              type="text"
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
              {...(controller ? controller.field : {})}
              value={
                controller
                  ? normalizeToString(controller.field.value)
                  : (inputValue ?? "")
              }
              onChange={handleInputChange}
              ref={inputRef}
            />
          </InputGroup>

          {fieldError && <Field.ErrorText mt={2}>{fieldError}</Field.ErrorText>}

          {geocodeMutation.isError && inputValue.length >= 2 && (
            <Text color="#DC2626" fontSize="sm" mt={1}>
              Failed to search location. Please try again.
            </Text>
          )}

          {isOpen &&
            (inputValue.length > 0 || isLoading) &&
            !geocodeMutation.isError && (
              <Box
                position="absolute"
                top="100%"
                left={0}
                right={0}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                boxShadow="lg"
                zIndex={1000}
                maxH="200px"
                overflowY="auto"
              >
                {isLoading && (
                  <Box
                    p={3}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Loader size="sm" props={{ mr: 2 }} />
                    <Text fontSize="sm" color="gray.600">
                      Searching...
                    </Text>
                  </Box>
                )}

                {!isLoading &&
                  results.length === 0 &&
                  inputValue.length >= 2 && (
                    <Box p={3}>
                      <Text fontSize="sm" color="gray.600">
                        Keep typing to refine your location...
                      </Text>
                    </Box>
                  )}

                {geocodeMutation.isError && inputValue.length >= 2 && (
                  <Box p={3}>
                    <Text fontSize="sm" color="red.500">
                      Error searching for location
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Please try again
                    </Text>
                  </Box>
                )}

                {!isLoading &&
                  results.map((result, index) => (
                    <Box
                      key={result.id || index}
                      w="100%"
                      p={3}
                      cursor="pointer"
                      _hover={{ bg: "gray.50" }}
                      onClick={() => handleSelect(result)}
                      borderBottom="1px solid"
                      borderColor="gray.100"
                    >
                      <Text fontSize="sm" fontWeight="medium">
                        {result.formatted_address}
                      </Text>
                      {(result.locality ||
                        result.administrative_area_level_1) && (
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {[
                            result.locality,
                            result.administrative_area_level_1,
                            result.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </Text>
                      )}
                    </Box>
                  ))}
              </Box>
            )}
        </Box>
      </Field.Root>
    );
  }
);

GeocodeAutocompleteInput.displayName = "GeocodeAutocompleteInput";
