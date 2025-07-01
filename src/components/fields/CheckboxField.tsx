import { Box, VStack, Text, Checkbox } from "@chakra-ui/react";
import { Control, useController } from "react-hook-form";

interface CheckboxFieldProps {
  name: string;
  label: string;
  options: string[];
  control: Control<any>;
  required?: boolean;
  maxSelections?: number;
}

export const CheckboxField = ({
  name,
  label,
  options,
  control,
  required = false,
  maxSelections,
}: CheckboxFieldProps) => {
  const isSingleSelect = maxSelections === 1;

  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: isSingleSelect ? "" : [],
  });

  const currentValue = isSingleSelect
    ? value || ""
    : Array.isArray(value)
      ? value
      : [];

  const handleChange = (option: string, isChecked: boolean) => {
    if (isSingleSelect) {
      onChange(isChecked ? option : "");
    } else {
      if (isChecked) {
        if (!!maxSelections && currentValue.length >= maxSelections) {
          return;
        }
        const cleanOption = String(option).trim();
        onChange([...currentValue, cleanOption]);
      } else {
        onChange(currentValue.filter((item: string) => item !== option));
      }
    }
  };

  const isOptionDisabled = (option: string) => {
    if (isSingleSelect) {
      return false;
    }
    return (
      !currentValue.includes(option) &&
      !!maxSelections &&
      currentValue.length >= maxSelections
    );
  };

  return (
    <Box>
      <Box mb={4}>
        <Text fontSize="18px" fontWeight="medium">
          {label}
          {required && (
            <Text as="span" color="red.500" ml={1}>
              *
            </Text>
          )}
        </Text>
        {maxSelections && maxSelections > 1 && (
          <Text fontSize="sm" color="gray.600" mt={1}>
            (Select up to {maxSelections} options)
          </Text>
        )}
      </Box>

      <VStack align="stretch" gap={2} ml={4}>
        {options.map((option) => (
          <Checkbox.Root
            key={option}
            checked={
              isSingleSelect
                ? currentValue === option
                : currentValue.includes(option)
            }
            onCheckedChange={(details) =>
              handleChange(option, Boolean(details.checked))
            }
            disabled={isOptionDisabled(option)}
            size="md"
            colorPalette="blue"
            style={{
              border: "1px solid #A2DDF0",
              borderRadius: "8px",
              padding: "12px",
              width: "260px",
              opacity: isOptionDisabled(option) ? 0.5 : 1,
            }}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>
              <Text fontSize="sm">{option}</Text>
            </Checkbox.Label>
          </Checkbox.Root>
        ))}
      </VStack>

      {error && (
        <Text color="red.500" fontSize="sm" mt={2}>
          {error.message}
        </Text>
      )}
    </Box>
  );
};
