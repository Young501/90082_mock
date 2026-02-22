"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  Box,
  Field,
  Flex,
  HStack,
  Input,
  Popover,
  Tag,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import { Control, Controller, useController } from "react-hook-form";
import { useTaxonomy } from "@/services/shared";
import { TaxonomyNode } from "@/types/shared";
import { TaxonomyQueryParams } from "@/types/shared";

interface TaxonomyMultiselectFieldProps {
  name: string;
  label?: string;
  control: Control<any>;
  taxonomyQuery: TaxonomyQueryParams;
  parentValue?: string | null;
  universitySlug?: string | null;
  error?: string;
  required?: boolean;
  maxSelection?: number;
  filterLabel?: string;
  placeholder?: string;
}

export const TaxonomyMultiselectField = ({
  name,
  label,
  control,
  taxonomyQuery,
  parentValue,
  universitySlug,
  error,
  required,
  maxSelection,
  filterLabel,
  placeholder = "Search and select options",
}: TaxonomyMultiselectFieldProps) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const params = useMemo(() => {
    const university =
      taxonomyQuery.university === "dynamic"
        ? (universitySlug ?? "unimelb")
        : (taxonomyQuery.university ?? null);

    return {
      type: taxonomyQuery.type,
      parent: parentValue ?? null,
      university,
    };
  }, [taxonomyQuery, parentValue, universitySlug]);

  const { data: nodes = [], isLoading } = useTaxonomy(params);

  const options = useMemo(() => {
    return (nodes as TaxonomyNode[]).map((node) => ({
      label: node.label,
      value: node.code,
      key: node.id,
    }));
  }, [nodes]);

  const { field: controllerField } = useController({
    name,
    control,
    defaultValue: [],
  });

  const initialValueRef = useRef<any>(controllerField.value);
  const normalisedRef = useRef(false);

  useEffect(() => {
    if (options.length === 0 || normalisedRef.current) return;
    normalisedRef.current = true;

    const raw: any[] = Array.isArray(initialValueRef.current)
      ? initialValueRef.current
      : [];
    if (raw.length === 0) return;

    const coerceToString = (v: any): string => {
      if (typeof v === "string") return v;
      return String(v?.value ?? v?.code ?? v?.id ?? v ?? "");
    };

    const asStrings = raw.map(coerceToString).filter(Boolean);

    const normalised = asStrings.map((v) => {
      if (options.some((o) => o.value === v)) return v;
      const byLabel = options.find(
        (o) =>
          typeof o.label === "string" &&
          o.label.toLowerCase() === v.toLowerCase()
      );
      return byLabel ? byLabel.value : v;
    });

    if (JSON.stringify(normalised) !== JSON.stringify(asStrings)) {
      controllerField.onChange(normalised);
    }
  }, [options]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const lower = search.toLowerCase();
    return options.filter(
      (opt) =>
        typeof opt.label === "string" && opt.label.toLowerCase().includes(lower)
    );
  }, [options, search]);

  if (isLoading) {
    return (
      <div style={{ padding: "12px", color: "#666" }}>Loading options...</div>
    );
  }

  if (options.length === 0) {
    return null;
  }

  return (
    <Field.Root invalid={!!error}>
      {(label || filterLabel) && (
        <Field.Label
          fontSize="sm"
          fontWeight="500"
          color="black"
          display="block"
        >
          {label || filterLabel}
          {required && (
            <span style={{ color: "red", marginLeft: "4px" }}>*</span>
          )}
        </Field.Label>
      )}
      <Controller
        name={name}
        control={control}
        defaultValue={[]}
        render={({ field }) => {
          const normalizeValue = (v: any): string => {
            if (typeof v === "string") return v;
            if (v && typeof v === "object") {
              return v.value ?? v.code ?? v.id ?? String(v);
            }
            return String(v ?? "");
          };

          const selectedValues: string[] = Array.isArray(field.value)
            ? field.value.map(normalizeValue).filter(Boolean)
            : [];

          const handleCheckChange = (optValue: string, checked: boolean) => {
            if (checked) {
              if (maxSelection && selectedValues.length >= maxSelection) return;
              field.onChange([...selectedValues, optValue]);
            } else {
              field.onChange(selectedValues.filter((v) => v !== optValue));
            }
          };

          return (
            <VStack align="stretch" gap={2} w="100%">
              <Popover.Root
                positioning={{ placement: "bottom-start", sameWidth: true }}
                open={open}
                onOpenChange={(e) => setOpen(e.open)}
              >
                <Popover.Trigger asChild>
                  <button
                    type="button"
                    style={{
                      width: "100%",
                      height: "48px",
                      padding: "0 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      borderRadius: "4px",
                      border: "1px solid #E4E4E7",
                      background: "white",
                      cursor: "pointer",
                      textAlign: "left",
                      font: "inherit",
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        fontSize: "14px",
                        color: "#9CA3AF",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {placeholder}
                    </span>
                    <ChevronDown
                      size={20}
                      style={{
                        flexShrink: 0,
                        color: "#71717A",
                        transition: "transform 0.2s",
                        transform: open ? "rotate(180deg)" : "none",
                      }}
                    />
                  </button>
                </Popover.Trigger>
                <Popover.Positioner>
                  <Popover.Content
                    w="var(--reference-width)"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="#E4E4E7"
                    boxShadow="md"
                    bg="white"
                    p={0}
                    overflow="hidden"
                  >
                    <Box p={2} borderBottomWidth="1px" borderColor="#E4E4E7">
                      <Input
                        placeholder={placeholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        size="sm"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="#E4E4E7"
                        bg="gray.50"
                        _focus={{
                          borderColor: "#E4E4E7",
                          boxShadow: "0 0 0 1px #E4E4E7",
                        }}
                        onKeyDown={(e) => {
                          if (e.key === " ") e.stopPropagation();
                        }}
                      />
                    </Box>
                    <Box maxH="240px" overflowY="auto" p={2}>
                      {filteredOptions.length === 0 ? (
                        <Box
                          py={4}
                          color="#888"
                          fontSize="sm"
                          textAlign="center"
                        >
                          No options
                        </Box>
                      ) : (
                        <VStack align="stretch" gap={0}>
                          {filteredOptions.map((opt) => {
                            const isChecked = selectedValues.includes(
                              opt.value
                            );
                            const isDisabled =
                              !isChecked &&
                              !!maxSelection &&
                              selectedValues.length >= maxSelection;

                            return (
                              <HStack
                                key={String(opt.key ?? opt.value)}
                                role="button"
                                tabIndex={0}
                                py={2}
                                px={2}
                                gap={2}
                                align="center"
                                borderRadius="md"
                                w="100%"
                                textAlign="left"
                                bg="transparent"
                                border="none"
                                cursor={isDisabled ? "not-allowed" : "pointer"}
                                opacity={isDisabled ? 0.6 : 1}
                                _hover={
                                  !isDisabled ? { bg: "gray.50" } : undefined
                                }
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (isDisabled) return;
                                  handleCheckChange(opt.value, !isChecked);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    if (isDisabled) return;
                                    handleCheckChange(opt.value, !isChecked);
                                  }
                                }}
                              >
                                <Box
                                  w="4"
                                  h="4"
                                  flexShrink={0}
                                  border="1px solid"
                                  borderColor={
                                    isChecked ? "#2AA8E0" : "#E4E4E7"
                                  }
                                  bg={isChecked ? "#2AA8E0" : "transparent"}
                                  borderRadius="2px"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  {isChecked && (
                                    <svg
                                      width="12"
                                      height="12"
                                      viewBox="0 0 12 12"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M2 6L5 9L10 3"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  )}
                                </Box>
                                <Box as="span" fontSize="sm" color="#000000">
                                  {opt.label}
                                </Box>
                              </HStack>
                            );
                          })}
                        </VStack>
                      )}
                    </Box>
                  </Popover.Content>
                </Popover.Positioner>
              </Popover.Root>

              {maxSelection && (
                <Text fontSize="xs" color="#71717A">
                  Maximum {maxSelection} options
                </Text>
              )}

              {selectedValues.length > 0 && (
                <Flex wrap="wrap" gap={2} mt={1}>
                  {selectedValues.map((val) => {
                    const opt = options.find((o) => o.value === val);
                    const label = opt ? opt.label : val;
                    return (
                      <Tag.Root
                        key={val}
                        variant="subtle"
                        borderRadius="md"
                        px={2}
                        py="4px"
                        h="26px"
                        bg="#F4F4F5"
                        boxShadow="0px 0px 1px 0px #27272A inset"
                      >
                        <Tag.Label
                          fontSize="sm"
                          lineHeight="unset"
                          color="#27272A"
                        >
                          {label}
                        </Tag.Label>
                        <Tag.EndElement>
                          <Tag.CloseTrigger
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleCheckChange(val, false);
                            }}
                            aria-label={`Remove ${label}`}
                          />
                        </Tag.EndElement>
                      </Tag.Root>
                    );
                  })}
                </Flex>
              )}
            </VStack>
          );
        }}
      />
      {error && <Field.ErrorText>{error}</Field.ErrorText>}
    </Field.Root>
  );
};
