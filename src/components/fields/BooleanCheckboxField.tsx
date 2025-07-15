import { Box, Text, Checkbox, VStack } from "@chakra-ui/react";
import { Control, useController } from "react-hook-form";

interface BooleanCheckboxFieldProps {
  name: string;
  label: string;
  control: Control<any>;
  required?: boolean;
  description?: string;
  trueLabel?: string;
  falseLabel?: string;
}

export const BooleanCheckboxField = ({
  name,
  label,
  control,
  required = false,
  description,
  trueLabel = "Yes",
  falseLabel = "No",
}: BooleanCheckboxFieldProps) => {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: false,
  });

  const handleChange = (selectedValue: boolean) => {
    onChange(selectedValue);
  };

  const options = [
    { value: true, label: trueLabel },
    { value: false, label: falseLabel },
  ];

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
        {description && (
          <Text fontSize="sm" color="gray.600" mt={1}>
            {description}
          </Text>
        )}
      </Box>

      <VStack align="stretch" gap={2} ml={4}>
        {options.map((option) => (
          <Checkbox.Root
            key={option.value.toString()}
            checked={Boolean(value) === option.value}
            onCheckedChange={() => handleChange(option.value)}
            size="md"
            colorPalette="blue"
            style={{
              border: "1px solid #A2DDF0",
              borderRadius: "8px",
              padding: "12px",
              width: "260px",
            }}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>
              <Text fontSize="sm">{option.label}</Text>
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
