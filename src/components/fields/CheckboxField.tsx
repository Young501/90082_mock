import { Box, VStack, Text, Checkbox } from "@chakra-ui/react";
import { Control, useController } from "react-hook-form";
import { parseQuestionnaireOptions } from "@/utils/questionnaireParser";

interface CheckboxFieldProps {
  name: string;
  label: string;
  options: (string | { value: string; label: string })[];
  control: Control<any>;
  required?: boolean;
  maxSelection?: number;
  isBoolean?: boolean;
}

export const CheckboxField = ({
  name,
  label,
  options,
  control,
  required = false,
  maxSelection,
  isBoolean = false,
}: CheckboxFieldProps) => {
  const isSingleSelect = maxSelection === 1 || isBoolean;
  const parsedOptions = parseQuestionnaireOptions(options).map(opt => opt.value);

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
        if (!!maxSelection && currentValue.length >= maxSelection) {
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
      !!maxSelection &&
      currentValue.length >= maxSelection
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
        {maxSelection && maxSelection > 1 && (
          <Text fontSize="sm" color="gray.600" mt={1}>
            (Select up to {maxSelection} options)
          </Text>
        )}
      </Box>

      <VStack align="stretch" gap={2} ml={4}>
        {parsedOptions.map((option) => (
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
