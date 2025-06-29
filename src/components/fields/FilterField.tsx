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
          size="sm"
          w="100%"
          h="40px"
          bg="white"
          borderRadius="15px"
          border="1px solid"
          borderColor="gray.200"
          _focus={{
            borderColor: "#2CA9DF",
            boxShadow: "0 0 0 1px #2CA9DF",
          }}
          _hover={{
            borderColor: "gray.300",
          }}
        />
      )}
    />
  );

  const renderSelectField = () => {
    const selectCollection = createFieldCollection(field);

    return (
      <Controller
        name={field.field}
        control={control}
        render={({ field: formField }) => (
          <Select.Root
            collection={selectCollection}
            multiple={true}
            size="sm"
            bg="white"
            borderRadius="15px"
            border="1px solid"
            borderColor="gray.200"
            w="100%"
            value={formField.value || []}
            onValueChange={(details) => formField.onChange(details.value)}
          >
            <Select.Control
              w="100%"
              h="40px"
              _focus={{
                borderColor: "#2CA9DF",
                boxShadow: "0 0 0 1px #2CA9DF",
              }}
              _hover={{
                borderColor: "gray.300",
              }}
            >
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
      case "multi-select":
        return renderSelectField();

      case "text":
      case "input":
      default:
        return renderInputField();
    }
  };

  return (
    <Box w="100%" h="100%">
      <Text fontSize="sm" mb={2} fontWeight="medium">
        {/* {field.label} */}
        {field.displayHint && (
          <Text as="span" fontSize="xs" color="gray.500" ml={2} display="block">
            {field.displayHint}
          </Text>
        )}
      </Text>
      <Box w="100%" flex="1">
        {getFieldContent()}
      </Box>
    </Box>
  );
};
