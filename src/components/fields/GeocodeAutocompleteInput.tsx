"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  Box,
  Input,
  VStack,
  Text,
  Field,
} from "@chakra-ui/react";
import { useGeocode } from "@/services/shared";
import { useDebounce } from "@/hooks/useDebounce";
import { GeocodeResult } from "@/types/shared";
import { UseFormRegisterReturn, Control, useController } from "react-hook-form";
import Loader from "@/components/Loader";

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
    placeholder = "Enter location",
    required = false,
    error,
    isProfilePage = false,
    label,
    name,
    control,
    icon,
  }: GeocodeAutocompleteInputProps) => {
    const [inputValue, setInputValue] = useState(value || "");
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<GeocodeResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
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
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (debouncedInputValue && debouncedInputValue.trim().length >= 2) {
        const trimmedAddress = debouncedInputValue.trim();
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
      setInputValue(value || "");
      if (controller && controller.field.value !== value) {
        controller.field.onChange(value || "");
      }
    }, [value, controller]);

    return (
      <Field.Root invalid={!!fieldError}>
        <Box ref={containerRef} position="relative" width="100%">
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
                type="text"
                placeholder={placeholder}
                h="60px"
                borderRadius="0px"
                pl={icon ? "48px" : "24px"}
                border="1px solid"
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
                bg="white"
                fontSize="16px"
                px={icon ? 12 : 6}
                {...(controller
                  ? controller.field
                  : { value: inputValue || "" })}
                onChange={handleInputChange}
                ref={inputRef}
              />
            </Box>
          </Box>

          {fieldError && <Field.ErrorText mt={2}>{fieldError}</Field.ErrorText>}

        {geocodeMutation.isError && inputValue.length >= 2 && (
          <Text color="#DC2626" fontSize="sm" mt={1}>
            Failed to search location. Please try again.
          </Text>
        )}

        {isOpen && (inputValue.length > 0 || isLoading) && !geocodeMutation.isError && (
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
              <Box p={3} display="flex" alignItems="center" justifyContent="center">
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
