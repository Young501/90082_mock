import { Portal, Select, createListCollection, Field } from "@chakra-ui/react";
import { useMemo } from "react";
import { Control, Controller } from "react-hook-form";

interface SelectFieldProps {
  name: string;
  label: string;
  control: Control<any>;
  options: string[];
  placeholder?: string;
  multiple?: boolean;
  error?: string;
  required?: boolean;
  maxSelection?: number;
}

export const SelectField = ({
  name,
  label,
  control,
  options,
  placeholder,
  multiple = false,
  error,
  required,
  maxSelection,
}: SelectFieldProps) => {
  const optionItems = useMemo(
    () =>
      options.map((option) => ({
        label: option,
        value: option,
      })),
    [options]
  );

  const collection = useMemo(
    () =>
      createListCollection({
        items: optionItems,
      }),
    [optionItems]
  );

  const defaultPlaceholder = multiple
    ? "Select option(s)"
    : "-- Select an option --";

  return (
    <Field.Root invalid={!!error}>
      <Field.Label>
        {label}
        {required && <span style={{ color: "red", marginLeft: "4px" }}>*</span>}
      </Field.Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select.Root
            multiple={multiple}
            collection={collection}
            value={
              multiple ? field.value || [] : field.value ? [field.value] : []
            }
            onValueChange={(details) => {
              const newValue = multiple ? details.value : details.value[0];

              field.onChange(newValue);
            }}
            width="100%"
            size="md"
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText
                  placeholder={placeholder || defaultPlaceholder}
                />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {optionItems.map((opt) => (
                    <Select.Item item={opt} key={opt.value}>
                      {opt.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        )}
      />
      {error && <Field.ErrorText>{error}</Field.ErrorText>}
    </Field.Root>
  );
};
