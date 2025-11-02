import React, { useState, useMemo } from "react";
import {
  Box,
  Text,
  Input,
  Select,
  Portal,
  createListCollection,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { Controller, Control } from "react-hook-form";
import { ProcessedField } from "@/types/discovery";
import { ClearButton } from "../ui/ClearButton";
import { SliderField } from "./SliderField";
import { Lock, Info } from "lucide-react";
import { getDisplayLabel } from "@/utils/questionnaireParser";

interface FilterFieldProps {
  field: ProcessedField;
  control: Control<any>;
  isVisible: boolean;
  availableOptions?: Array<string | { label: string; value: string }>;
}

type SelectOption = {
  value: string;
  label: string;
};

const createFieldCollection = (
  availableOptions?: Array<string | { label: string; value: string }>
) => {
  const options = availableOptions || [];
  if (options.length === 0) {
    return createListCollection<SelectOption>({
      items: [],
    });
  }

  const items: SelectOption[] = options.map((option) => {
    if (typeof option === "string") {
      return {
        value: option,
        label: option,
      };
    } else {
      return {
        value: option.value,
        label: option.label,
      };
    }
  });
  return createListCollection<SelectOption>({ items });
};

export const FilterField: React.FC<FilterFieldProps> = ({
  field,
  control,
  isVisible,
  availableOptions,
}) => {
  const [filter, setFilter] = useState("");
  if (!isVisible) {
    return null;
  }
  const hasAvailableOptions = availableOptions && availableOptions.length > 0;
  const isDisabled = !hasAvailableOptions;
  const isSingleOption = availableOptions && availableOptions.length === 1;

  const filteredOptions = useMemo(() => {
    if (!filter) return availableOptions || [];
    const lower = filter.toLowerCase();
    return (availableOptions || []).filter((opt) => {
      if (typeof opt === "string") {
        return opt.toLowerCase().includes(lower);
      } else {
        return opt.label.toLowerCase().includes(lower);
      }
    });
  }, [availableOptions, filter]);

  const renderInputField = () => (
    <Controller
      name={field.field}
      control={control}
      render={({ field: formField }) => {
        const hasValue = formField.value && formField.value !== "";
        return (
          <HStack gap={1} w="100%" h="40px">
            <Input
              {...formField}
              placeholder={`Enter ${getDisplayLabel(field, true)}`}
              w="100%"
              h="40px"
              bg="white"
              borderRadius="15px"
              border="1px solid"
              borderColor="gray.200"
            />
            <ClearButton
              fieldLabel={getDisplayLabel(field, true)}
              onClear={() => formField.onChange("")}
              show={hasValue}
            />
          </HStack>
        );
      }}
    />
  );

  const renderSingleSelectField = () => {
    const selectCollection = createFieldCollection(filteredOptions);
    return (
      <Controller
        name={field.field}
        control={control}
        render={({ field: formField }) => {
          const hasValue = formField.value && formField.value !== "";
          const showAsSingleOption = isSingleOption && hasValue;
          return (
            <VStack align="stretch" gap={1} w="100%" zIndex={1000}>
              <HStack gap={1} w="100%" h="40px">
                <Select.Root
                  collection={selectCollection}
                  multiple={false}
                  bg={isDisabled ? "gray.100" : "white"}
                  borderRadius="15px"
                  border="1px solid"
                  borderColor={isDisabled ? "gray.300" : "gray.200"}
                  w="100%"
                  h="40px"
                  readOnly={isDisabled}
                  value={
                    Array.isArray(formField.value)
                      ? formField.value
                      : formField.value
                        ? [formField.value]
                        : []
                  }
                  onValueChange={
                    isDisabled
                      ? undefined
                      : (details) => {
                          const stringValue = Array.isArray(details.value)
                            ? details.value[0] || ""
                            : details.value || "";
                          formField.onChange(stringValue);
                        }
                  }
                >
                  <Select.Control w="100%" h="100%">
                    <Select.Trigger
                      cursor={
                        isDisabled
                          ? "not-allowed"
                          : showAsSingleOption
                            ? "default"
                            : "pointer"
                      }
                    >
                      <HStack gap={2} w="100%">
                        {showAsSingleOption && (
                          <Lock size={12} color="#6b7280" />
                        )}
                        <Select.ValueText
                          placeholder={
                            isDisabled
                              ? `No ${getDisplayLabel(field, true)} options available`
                              : `Select ${getDisplayLabel(field, true)}`
                          }
                          color={isDisabled ? "gray.400" : "inherit"}
                        />
                      </HStack>
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      {showAsSingleOption ? (
                        <Info size={16} color="#6b7280" />
                      ) : (
                        <Select.Indicator />
                      )}
                    </Select.IndicatorGroup>
                  </Select.Control>
                  {!isDisabled && !showAsSingleOption && (
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          <VStack px={2} py={2} gap={2} align="stretch">
                            <Input
                              autoFocus
                              placeholder="Type to filter..."
                              value={filter}
                              onChange={(e) => setFilter(e.target.value)}
                              size="sm"
                              borderRadius="md"
                              bg="gray.50"
                              onKeyDown={(e) => {
                                if (e.key === " ") {
                                  e.stopPropagation();
                                }
                              }}
                            />
                            {filteredOptions.length === 0 && (
                              <span style={{ color: "#888", padding: "8px" }}>
                                No options
                              </span>
                            )}
                            {selectCollection.items.map((option) => (
                              <Select.Item item={option} key={option.value}>
                                {getDisplayLabel(option, true)}
                                <Select.ItemIndicator />
                              </Select.Item>
                            ))}
                          </VStack>
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  )}
                </Select.Root>
                <ClearButton
                  fieldLabel={getDisplayLabel(field, true)}
                  onClear={() => formField.onChange("")}
                  show={hasValue && !isDisabled}
                />
              </HStack>
              {showAsSingleOption && (
                <HStack gap={1} align="center">
                  <Info size={12} color="#6b7280" />
                  <Text fontSize="xs" color="gray.500">
                    Auto-selected (only option available)
                  </Text>
                </HStack>
              )}
            </VStack>
          );
        }}
      />
    );
  };
  const renderMultiSelectField = () => {
    const selectCollection = createFieldCollection(filteredOptions);
    return (
      <Controller
        name={field.field}
        control={control}
        render={({ field: formField }) => {
          const hasValue =
            Array.isArray(formField.value) && formField.value.length > 0;
          const showAsSingleOption = isSingleOption && hasValue;
          return (
            <VStack align="stretch" gap={1} w="100%" zIndex={1000}>
              <HStack gap={1} w="100%" h="40px">
                <Select.Root
                  collection={selectCollection}
                  multiple={true}
                  bg={isDisabled ? "gray.100" : "white"}
                  borderRadius="15px"
                  border="1px solid"
                  borderColor={isDisabled ? "gray.300" : "gray.200"}
                  w="100%"
                  h="40px"
                  readOnly={isDisabled}
                  value={Array.isArray(formField.value) ? formField.value : []}
                  onValueChange={
                    isDisabled
                      ? undefined
                      : (details) => {
                          const arrayValue = Array.isArray(details.value)
                            ? details.value
                            : details.value
                              ? [details.value]
                              : [];
                          formField.onChange(arrayValue);
                        }
                  }
                >
                  <Select.Control w="100%" h="100%">
                    <Select.Trigger
                      cursor={
                        isDisabled
                          ? "not-allowed"
                          : showAsSingleOption
                            ? "default"
                            : "pointer"
                      }
                    >
                      <HStack gap={2} w="100%">
                        {showAsSingleOption && (
                          <Lock size={12} color="#6b7280" />
                        )}
                        <Select.ValueText
                          placeholder={
                            isDisabled
                              ? `No ${getDisplayLabel(field, true)} options available`
                              : `${getDisplayLabel(field, true)}`
                          }
                          color={isDisabled ? "gray.400" : "inherit"}
                        />
                      </HStack>
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      {showAsSingleOption ? (
                        <Info size={16} color="#6b7280" />
                      ) : (
                        <Select.Indicator />
                      )}
                    </Select.IndicatorGroup>
                  </Select.Control>
                  {!isDisabled && !showAsSingleOption && (
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          <VStack px={2} py={2} gap={2} align="stretch">
                            <Input
                              autoFocus
                              placeholder="Type to filter..."
                              value={filter}
                              onChange={(e) => setFilter(e.target.value)}
                              size="sm"
                              borderRadius="md"
                              bg="gray.50"
                            />
                            {filteredOptions.length === 0 && (
                              <span style={{ color: "#888", padding: "8px" }}>
                                No options
                              </span>
                            )}
                            {selectCollection.items.map((option) => (
                              <Select.Item item={option} key={option.value}>
                                {getDisplayLabel(option, true)}
                                <Select.ItemIndicator />
                              </Select.Item>
                            ))}
                          </VStack>
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  )}
                </Select.Root>
                <ClearButton
                  fieldLabel={getDisplayLabel(field, true)}
                  onClear={() => formField.onChange([])}
                  show={hasValue && !isDisabled}
                />
              </HStack>
              {showAsSingleOption && (
                <HStack gap={1} align="center">
                  <Info size={12} color="#6b7280" />
                  <Text fontSize="xs" color="gray.500">
                    Auto-selected (only option available)
                  </Text>
                </HStack>
              )}
            </VStack>
          );
        }}
      />
    );
  };
  const renderRangeField = () => {
    return (
      <Controller
        name={field.field}
        control={control}
        render={({ field: formField }) => {
          const hasValue = formField.value && formField.value !== "";
          return (
            <HStack align="center" gap={1} w="100%">
              <Box w="100%">
                <SliderField
                  name={field.field}
                  label={getDisplayLabel(field, true)}
                  control={control}
                  min={(field as any).min || 1}
                  max={(field as any).max || 200}
                  unit={(field as any).unit || "km"}
                  required={false}
                  props={{
                    w: "100%",
                  }}
                />
              </Box>
              {hasValue && (
                <ClearButton
                  fieldLabel={getDisplayLabel(field, true)}
                  onClear={() => formField.onChange("")}
                  show={hasValue}
                  props={{
                    maxWidth: "25px",
                  }}
                />
              )}
            </HStack>
          );
        }}
      />
    );
  };
  const getFieldContent = () => {
    switch (field.type) {
      case "select":
        return renderSingleSelectField();
      case "multi-select":
      case "tag-select":
      case "checkbox-group":
        return renderMultiSelectField();
      case "range":
        return renderRangeField();
      case "text":
      case "input":
      case "location":
      case "url":
        return renderInputField();
      default:
        return renderSingleSelectField();
    }
  };
  return <Box w="100%">{getFieldContent()}</Box>;
};
