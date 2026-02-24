import {
  Select,
  createListCollection,
  Field,
  Input,
  VStack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { Control, Controller } from "react-hook-form";

interface SelectOption {
  label: string;
  value: string;
  /** Unique key for React when value is duplicated (e.g. taxonomy nodes) */
  key?: string | number;
}

interface SelectFieldProps {
  name: string;
  label?: string;
  control: Control<any>;
  options: string[] | SelectOption[];
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
      options.map((option) => {
        const label =
          typeof option === "string"
            ? option
            : String(option.label ?? option.value ?? "");
        const value =
          typeof option === "string"
            ? option
            : String(option.value ?? option.label ?? "");
        const key =
          typeof option === "object" && "key" in option
            ? option.key
            : undefined;
        return { label, value, key };
      }),
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

  const toDisplayString = (val: unknown): string => {
    if (val == null || val === "") return "";
    if (typeof val === "string") return val;
    if (
      typeof val === "object" &&
      "label" in val &&
      typeof (val as any).label === "string"
    )
      return (val as any).label;
    if (
      typeof val === "object" &&
      "code" in val &&
      typeof (val as any).code === "string"
    )
      return (val as any).code;
    return String(val);
  };

  const toOptionValue = (val: unknown): string => {
    if (val == null || val === "") return "";
    if (typeof val === "string") return val;
    if (
      typeof val === "object" &&
      "code" in val &&
      typeof (val as any).code === "string"
    )
      return (val as any).code;
    if (typeof val === "object" && "id" in val) return String((val as any).id);
    return String(val);
  };

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
              style={{ color: "#666", marginLeft: "8px", fontSize: "11px" }}
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
              multiple
                ? (Array.isArray(field.value)
                    ? field.value
                    : field.value
                      ? [field.value]
                      : []
                  ).map((v: unknown) => toOptionValue(v))
                : field.value
                  ? [toOptionValue(field.value)]
                  : [""]
            }
            onValueChange={(details) => handleValueChange(details, field)}
            onBlur={field.onBlur}
            width="100%"
            size="md"
            positioning={{ strategy: "fixed" }}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger
                h="48px"
                //  px={6}
                borderRadius="sm"
                border="1px solid"
                borderColor="#E4E4E7"
              >
                <Select.ValueText>
                  {field.value
                    ? multiple
                      ? (Array.isArray(field.value)
                          ? field.value
                          : [field.value]
                        )
                          .map((val: unknown) => {
                            const code = toOptionValue(val);
                            const option = optionItems.find(
                              (opt) => opt.value === code
                            );
                            return option ? option.label : toDisplayString(val);
                          })
                          .join(", ")
                      : (() => {
                          const code = toOptionValue(field.value);
                          const option = optionItems.find(
                            (opt) => opt.value === code
                          );
                          return option
                            ? option.label
                            : toDisplayString(field.value);
                        })()
                    : placeholder || defaultPlaceholder}
                </Select.ValueText>
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
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
                    <Select.Item
                      item={{
                        label: String(opt.label),
                        value: String(opt.value),
                      }}
                      key={String(opt.key ?? opt.value)}
                    >
                      {String(opt.label)}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </VStack>
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        )}
      />
      {error && <Field.ErrorText>{error}</Field.ErrorText>}
    </Field.Root>
  );
};
