import React from "react";
import {
  Box,
  Text,
  HStack,
  VStack,
  Checkbox,
  Spacer,
} from "@chakra-ui/react";
import { Controller, Control } from "react-hook-form";
import { ProcessedField } from "@/types/discovery";
import { SliderField } from "./SliderField";
import { getDisplayLabel } from "@/utils/questionnaireParser";

interface FilterFieldV2Props {
  field: ProcessedField;
  control: Control<any>;
  isVisible: boolean;
  availableOptions?: Array<{ label: string; value: string; count: number }>;
  isAutoSelected?: boolean;
}

export const FilterFieldV2: React.FC<FilterFieldV2Props> = ({
  field,
  control,
  isVisible,
  availableOptions,
  isAutoSelected = false,
}) => {
  if (!isVisible) {
    return null;
  }

  const hasOnlyOneOption = availableOptions && availableOptions.length === 1;

  const renderCheckboxGroup = () => {
    const isMultiSelect =
      field.type === "multi-select" ||
      field.type === "tag-select" ||
      field.type === "checkbox-group";

    return (
      <Controller
        name={field.field}
        control={control}
        render={({ field: formField }) => {
          const currentValue = formField.value;
          
          return (
            <VStack align="stretch" gap={3} w="100%">
              {availableOptions?.map((option) => {
                const isChecked = isMultiSelect
                  ? Array.isArray(currentValue) && currentValue.includes(option.value)
                  : currentValue === option.value;

                const isDisabled = hasOnlyOneOption && isAutoSelected;

                return (
                  <HStack key={option.value} w="100%" justify="space-between">
                    <Checkbox.Root
                      checked={isChecked}
                      disabled={isDisabled}
                      onCheckedChange={(details) => {
                        if (isDisabled) return;
                        const checked = !!details.checked;
                        if (isMultiSelect) {
                          const values = Array.isArray(currentValue) ? currentValue : [];
                          const newValues = checked
                            ? [...values, option.value]
                            : values.filter((v: string) => v !== option.value);
                          formField.onChange(newValues);
                        } else {
                          formField.onChange(checked ? option.value : "");
                        }
                      }}
                      size="sm"
                      variant="outline"
                      colorPalette="blue"
                      opacity={isDisabled ? 0.6 : 1}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                      <Checkbox.Label 
                        fontSize="14px" 
                        color="#4A4A4A" 
                        cursor={isDisabled ? "not-allowed" : "pointer"}
                      >
                        {option.label}
                      </Checkbox.Label>
                    </Checkbox.Root>
                    <Text fontSize="14px" color="#717171">
                      {option.count}
                    </Text>
                  </HStack>
                );
              })}
            </VStack>
          );
        }}
      />
    );
  };

  const renderRangeField = () => {
    return (
      <Box w="100%">
        <SliderField
          name={field.field}
          label="From your location"
          control={control}
          min={(field as any).min || 1}
          max={(field as any).max || 200}
          unit={(field as any).unit || "KM"}
          required={false}
          props={{
            w: "100%",
          }}
        />
      </Box>
    );
  };

  const getFieldContent = () => {
    switch (field.type) {
      case "range":
        return renderRangeField();
      case "select":
      case "multi-select":
      case "tag-select":
      case "checkbox-group":
      default:
        return renderCheckboxGroup();
    }
  };

  return <Box w="100%">{getFieldContent()}</Box>;
};
