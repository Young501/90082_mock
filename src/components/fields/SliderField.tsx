import { Box, Text, Slider, HStack } from "@chakra-ui/react";
import { Control, useController } from "react-hook-form";
import { useEffect } from "react";

interface SliderFieldProps {
  name: string;
  label: string;
  control: Control<any>;
  min?: number;
  max?: number;
  unit?: string;
  required?: boolean;
}

export const SliderField = ({
  name,
  label,
  control,
  min = 0,
  max = 100,
  unit = "",
  required = false,
}: SliderFieldProps) => {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: undefined,
  });

  const currentValue = typeof value === "number" ? value : min;

  useEffect(() => {
    if (value === undefined || value === null) {
      const timeoutId = setTimeout(() => {
        onChange(min);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [min, onChange, name]);

  const handleValueChange = (details: { value: number[] }) => {
    const newValue = details.value[0];
    onChange(newValue);
  };

  return (
    <Box>
      <Slider.Root
        value={[currentValue]}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        step={1}
        width="100%"
      >
        <HStack justify="space-between" mb={2}>
          <Text fontSize="16px" fontWeight="medium">
            {label}
            {required && (
              <Text as="span" color="red.500" ml={1}>
                *
              </Text>
            )}
          </Text>
          <Text fontSize="16px" fontWeight="medium" color="blue.500">
            {currentValue} {unit}
          </Text>
        </HStack>

        <Box px={4}>
          <Slider.Control>
            <Slider.Track bg="gray.200" height="8px" borderRadius="full">
              <Slider.Range bg="blue.500" />
            </Slider.Track>
            <Slider.Thumbs
              boxSize="20px"
              bg="blue.500"
              border="2px solid white"
              boxShadow="md"
              rounded="full"
            />
          </Slider.Control>

          <Box display="flex" justifyContent="space-between" mt={2}>
            <Text fontSize="sm" color="gray.600">
              {min} {unit}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {max} {unit}
            </Text>
          </Box>
        </Box>
      </Slider.Root>

      {error && (
        <Text color="red.500" fontSize="sm" mt={2}>
          {error.message}
        </Text>
      )}
    </Box>
  );
};
