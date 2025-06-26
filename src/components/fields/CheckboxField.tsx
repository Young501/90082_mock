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
  const {
    field: { value = [], onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: [],
  });

  const handleChange = (option: string, isChecked: boolean) => {
    if (isChecked) {
      if (maxSelections && value.length >= maxSelections) {
        return;
      }
      const cleanOption = String(option).trim();
      onChange([...value, cleanOption]);
    } else {
      onChange(value.filter((item: string) => item !== option));
    }
  };

  const isOptionDisabled = (option: string) => {
    return (
      !value.includes(option) &&
      !!maxSelections &&
      value.length >= maxSelections
    );
  };

  return (
    <Box>
      <Text fontSize="18px" fontWeight="medium" mb={4}>
        {label}
        {required && (
          <Text as="span" color="red.500" ml={1}>
            *
          </Text>
        )}
        {maxSelections && (
          <Text fontSize="sm" color="gray.600" mt={1}>
            (Select up to {maxSelections}{" "}
            {maxSelections === 1 ? "option" : "options"})
          </Text>
        )}
      </Text>

      <VStack align="stretch" gap={2} ml={4}>
        {options.map((option) => (
          <Checkbox.Root
            key={option}
            checked={value.includes(option)}
            onCheckedChange={(checked) => handleChange(option, !!checked)}
            disabled={isOptionDisabled(option)}
            size="md"
            colorPalette="blue"
            style={{
              border: "1px solid rgba(57, 113, 185, 0.6)",
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
