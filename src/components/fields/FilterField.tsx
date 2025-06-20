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
        <Input {...formField} placeholder={`Enter ${field.label}`} size="sm" />
      )}
    />
  );

  const renderSelectField = (multiple = false) => {
    const selectCollection = createFieldCollection(field);

    return (
      <Controller
        name={field.field}
        control={control}
        render={({ field: formField }) => (
          <Select.Root
            collection={selectCollection}
            multiple={multiple}
            size="sm"
            value={
              multiple
                ? formField.value || []
                : formField.value
                  ? [formField.value]
                  : []
            }
            onValueChange={(details) =>
              formField.onChange(multiple ? details.value : details.value[0])
            }
          >
            <Select.Control>
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

  const getFieldContent = () => {
    switch (field.type) {
      case "select":
        return renderSelectField(false);

      case "multi-select":
        return renderSelectField(true);

      case "text":
      case "input":
      default:
        return renderInputField();
    }
  };

  return (
    <Box minW="200px">
      <Text fontSize="sm" mb={2} fontWeight="medium">
        {field.label}
        {field.displayHint && (
          <Text as="span" fontSize="xs" color="gray.500" ml={2}>
            {field.displayHint}
          </Text>
        )}
      </Text>
      {getFieldContent()}
    </Box>
  );
};
