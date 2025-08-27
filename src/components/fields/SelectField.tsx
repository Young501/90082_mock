import {
  Portal,
  Select,
  createListCollection,
  Field,
  Input,
  VStack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { Control, Controller } from "react-hook-form";

interface SelectFieldProps {
  name: string;
  label?: string;
  control: Control<any>;
  options: string[] | { label: string; value: string }[];
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
  const [filter, setFilter] = useState("");
  const optionItems = useMemo(
    () =>
      options.map((option) => ({
        label: typeof option === "string" ? option : option.label,
        value: typeof option === "string" ? option : option.value,
      })),
    [options]
  );
  const filteredItems = useMemo(() => {
    if (!filter) return optionItems;
    const lower = filter.toLowerCase();
    return optionItems.filter(
      (item) =>
        typeof item.label === "string" &&
        item.label.toLowerCase().includes(lower)
    );
  }, [optionItems, filter]);
  const collection = useMemo(
    () =>
      createListCollection({
        items: filteredItems,
      }),
    [filteredItems]
  );
  const defaultPlaceholder = multiple
    ? "Select option(s)"
    : "-- Select an option --";

  const handleValueChange = (details: any, field: any) => {
    if (multiple && maxSelection) {
      const newValue = details.value;
      if (newValue.length > maxSelection) {
        return;
      }
    }

    const newValue = multiple
      ? details.value
      : details.value.length > 0
        ? details.value[0]
        : "";
    field.onChange(newValue);
  };

  return (
    <Field.Root invalid={!!error}>
      {label && (
        <Field.Label>
          {label}
          {required && (
            <span style={{ color: "red", marginLeft: "4px" }}>*</span>
          )}
          {multiple && maxSelection && (
            <span
              style={{ color: "#666", marginLeft: "8px", fontSize: "14px" }}
            >
              (Max {maxSelection})
            </span>
          )}
        </Field.Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select.Root
            multiple={multiple}
            collection={collection}
            value={
              multiple ? field.value || [] : field.value ? [field.value] : [""]
            }
            onValueChange={(details) => handleValueChange(details, field)}
            onBlur={field.onBlur}
            width="100%"
            size="md"
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText>
                  {field.value
                    ? multiple
                      ? field.value.join(", ")
                      : field.value
                    : placeholder || defaultPlaceholder}
                </Select.ValueText>
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
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
                    {filteredItems.length === 0 && (
                      <span style={{ color: "#888", padding: "8px" }}>
                        No options
                      </span>
                    )}
                    {filteredItems.map((opt) => (
                      <Select.Item item={opt} key={opt.value}>
                        {opt.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </VStack>
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
