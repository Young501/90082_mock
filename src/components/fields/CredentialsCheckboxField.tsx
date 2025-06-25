import { Box, VStack, Text, Checkbox } from "@chakra-ui/react";
import { Control, useController } from "react-hook-form";

interface CredentialsCheckboxFieldProps {
  name: string;
  label: string;
  options: string[];
  control: Control<any>;
  required?: boolean;
}

export const CredentialsCheckboxField = ({
  name,
  label,
  options,
  control,
  required = false,
}: CredentialsCheckboxFieldProps) => {
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
      onChange([...value, option]);
    } else {
      onChange(value.filter((item: string) => item !== option));
    }
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
      </Text>

      <VStack align="stretch" gap={2} ml={4}>
        {options.map((option) => (
          <Checkbox.Root
            key={option}
            checked={value.includes(option)}
            onCheckedChange={(checked) => handleChange(option, !!checked)}
            size="md"
            colorPalette="blue"
            style={{
              border: "1px solid rgba(57, 113, 185, 0.6)",
              borderRadius: "8px",
              padding: "12px",
              width: "260px",
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
