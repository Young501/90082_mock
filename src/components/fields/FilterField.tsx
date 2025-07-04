import React from "react";
import {
  Box,
  Text,
  Input,
  Select,
  Portal,
  createListCollection,
} from "@chakra-ui/react";
import { Controller, Control } from "react-hook-form";
import { ProcessedField } from "@/types/discovery";

interface FilterFieldProps {
  field: ProcessedField;
  control: Control<any>;
  isVisible: boolean;
}

type SelectOption = {
  value: string;
  label: string;
};

const createFieldCollection = (field: ProcessedField) => {
  if (!field.options || field.options.length === 0) {
    return createListCollection<SelectOption>({
      items: [],
    });
  }

  const items: SelectOption[] = field.options.map((option) => ({
    value: option,
    label: option,
  }));

  return createListCollection<SelectOption>({ items });
};

export const FilterField: React.FC<FilterFieldProps> = ({
  field,
  control,
  isVisible,
}) => {
  if (!isVisible) {
    return null;
  }

  const renderInputField = () => (
    <Controller
      name={field.field}
      control={control}
      render={({ field: formField }) => (
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
      )}
    />
  );

  const renderSingleSelectField = () => {
    const selectCollection = createFieldCollection(field);

    return (
      <Controller
        name={field.field}
        control={control}
        render={({ field: formField }) => (
          <Select.Root
            collection={selectCollection}
            multiple={false}
            bg="white"
            borderRadius="15px"
            border="1px solid"
            borderColor="gray.200"
            w="100%"
            h="40px"
            value={
              Array.isArray(formField.value)
                ? formField.value
                : formField.value
                  ? [formField.value]
                  : []
            }
            onValueChange={(details) => {
              console.log(`[${field.field}] SINGLE onChange details:`, details);

              const stringValue = Array.isArray(details.value)
                ? details.value[0] || ""
                : details.value || "";

              console.log(
                `[${field.field}] SINGLE stringValue:`,
                stringValue,
                typeof stringValue
              );
              formField.onChange(stringValue);
            }}
          >
            <Select.Control w="100%" h="100%">
              <Select.Trigger>
                <Select.ValueText placeholder={`Select ${field.label}`} />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
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
          </Select.Root>
        )}
      />
    );
  };

  const renderMultiSelectField = () => {
    const selectCollection = createFieldCollection(field);

    return (
      <Controller
        name={field.field}
        control={control}
        render={({ field: formField }) => (
          <Select.Root
            collection={selectCollection}
            multiple={true}
            bg="white"
            borderRadius="15px"
            border="1px solid"
            borderColor="gray.200"
            w="100%"
            h="40px"
            value={Array.isArray(formField.value) ? formField.value : []}
            onValueChange={(details) => {
              console.log(`[${field.field}] MULTI onChange details:`, details);

              const arrayValue = Array.isArray(details.value)
                ? details.value
                : details.value
                  ? [details.value]
                  : [];

              console.log(`[${field.field}] MULTI arrayValue:`, arrayValue);
              formField.onChange(arrayValue);
            }}
          >
            <Select.Control w="100%" h="100%">
              <Select.Trigger>
                <Select.ValueText placeholder={`Select ${field.label}`} />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
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
          </Select.Root>
        )}
      />
    );
  };

  const renderRangeField = () => {
    return (
      <Controller
        name={field.field}
        control={control}
        render={({ field: formField }) => (
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
        )}
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

  return (
    <Box w="100%">
      <Box w="100%" h="40px">
        {getFieldContent()}
      </Box>
    </Box>
  );
};
