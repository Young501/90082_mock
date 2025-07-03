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

  const renderSelectField = (isMultiple: boolean = false) => {
    const selectCollection = createFieldCollection(field);

    return (
      <Controller
        name={field.field}
        control={control}
        render={({ field: formField }) => (
          <>
            <Select.Root
              collection={selectCollection}
              multiple={isMultiple}
              bg="white"
              borderRadius="15px"
              border="1px solid"
              borderColor="gray.200"
              w="100%"
              h="40px"
              value={
                isMultiple
                  ? Array.isArray(formField.value)
                    ? formField.value
                    : formField.value
                      ? [formField.value]
                      : []
                  : Array.isArray(formField.value)
                    ? formField.value[0] || ""
                    : formField.value || ""
              }
              onValueChange={(details) => {
                let cleanValue: any = details.value;

                // For multi-select fields, ensure we have an array
                if (isMultiple && !Array.isArray(cleanValue)) {
                  cleanValue = cleanValue ? [cleanValue] : [];
                }

                // For single-select fields, ensure we have a string
                if (!isMultiple && Array.isArray(cleanValue)) {
                  cleanValue = cleanValue[0] || "";
                }

                formField.onChange(cleanValue);
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
          </>
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
        return renderSelectField(false);

      case "multi-select":
      case "tag-select":
      case "checkbox-group":
        return renderSelectField(true);

      case "range":
        return renderRangeField();

      case "text":
      case "input":
      case "location":
      case "url":
        return renderInputField();

      default:
        return renderSelectField(false);
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
