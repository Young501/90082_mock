import React from "react";
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
import { Lock, Info } from "lucide-react";

interface FilterFieldProps {
  field: ProcessedField;
  control: Control<any>;
  isVisible: boolean;
  availableOptions?: string[];
}

type SelectOption = {
  value: string;
  label: string;
};

const createFieldCollection = (availableOptions?: string[]) => {
  const options = availableOptions || [];

  if (options.length === 0) {
    return createListCollection<SelectOption>({
      items: [],
    });
  }

  const items: SelectOption[] = options.map((option) => ({
    value: option,
    label: option,
  }));

  return createListCollection<SelectOption>({ items });
};

export const FilterField: React.FC<FilterFieldProps> = ({
  field,
  control,
  isVisible,
  availableOptions,
}) => {
  if (!isVisible) {
    return null;
  }

  const hasAvailableOptions = availableOptions && availableOptions.length > 0;
  const isDisabled = !hasAvailableOptions;
  const isSingleOption = availableOptions && availableOptions.length === 1;

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
              placeholder={`Enter ${field.label}`}
              w="100%"
              h="40px"
              bg="white"
              borderRadius="15px"
              border="1px solid"
              borderColor="gray.200"
            />

            <ClearButton
              fieldLabel={field.label}
              onClear={() => formField.onChange("")}
              show={hasValue}
            />
          </HStack>
        );
      }}
    />
  );

  const renderSingleSelectField = () => {
    const selectCollection = createFieldCollection(availableOptions);

    return (
      <Controller
        name={field.field}
        control={control}
        render={({ field: formField }) => {
          const hasValue = formField.value && formField.value !== "";
          const showAsSingleOption = isSingleOption && hasValue;

          return (
            <VStack align="stretch" gap={1} w="100%">
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
                              ? `No ${field.label} options available`
                              : `Select ${field.label}`
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
                          {selectCollection.items.map((option) => (
                            <Select.Item item={option} key={option.value}>
                              {option.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  )}
                </Select.Root>

                <ClearButton
                  fieldLabel={field.label}
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
    const selectCollection = createFieldCollection(availableOptions);

    return (
      <Controller
        name={field.field}
        control={control}
        render={({ field: formField }) => {
          const hasValue =
            Array.isArray(formField.value) && formField.value.length > 0;
          const showAsSingleOption = isSingleOption && hasValue;

          return (
            <VStack align="stretch" gap={1} w="100%">
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
                              ? `No ${field.label} options available`
                              : `Select ${field.label}`
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
                          {selectCollection.items.map((option) => (
                            <Select.Item item={option} key={option.value}>
                              {option.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  )}
                </Select.Root>

                <ClearButton
                  fieldLabel={field.label}
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
            <HStack gap={1} w="100%" h="40px">
              <Input
                {...formField}
                type="number"
                placeholder={`Enter ${field.label} ${(field as any).min && (field as any).max ? `(${(field as any).min}-${(field as any).max})` : ""}`}
                w="100%"
                h="40px"
                bg="white"
                borderRadius="15px"
                border="1px solid"
                borderColor="gray.200"
                min={(field as any).min || 0}
                max={(field as any).max || 100}
              />

              <ClearButton
                fieldLabel={field.label}
                onClear={() => formField.onChange("")}
                show={hasValue}
              />
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
