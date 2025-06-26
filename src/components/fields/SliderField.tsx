import { Box, Text, Slider } from "@chakra-ui/react";
import { Control, useController } from "react-hook-form";

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
  min = 1,
  max = 200,
  unit = "km",
  required = false,
}: SliderFieldProps) => {
  const {
    field: { value = min, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: min,
  });

  return (
    <Box>
      <Text fontSize="16px" fontWeight="medium" mb={4}>
        {label.replace(".....", String(Number(value) || min))} {unit}
        {required && (
          <Text as="span" color="red.500" ml={1}>
            *
          </Text>
        )}
      </Text>

      <Box px={4}>
        <Slider.Root
          value={[Number(value) || min]}
          onValueChange={(details) => {
            const newValue = details.value[0];
            onChange(newValue);
          }}
          min={min}
          max={max}
          step={1}
          width="100%"
        >
          <Slider.Control>
            <Slider.Track bg="gray.200" height="8px" borderRadius="full">
              <Slider.Range bg="blue.500" />
            </Slider.Track>
            <Slider.Thumb
              index={0}
              boxSize="20px"
              bg="blue.500"
              border="2px solid white"
              boxShadow="md"
            />
          </Slider.Control>
        </Slider.Root>

        <Box display="flex" justifyContent="space-between" mt={2}>
          <Text fontSize="sm" color="gray.600">
            {min} {unit}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {max} {unit}
          </Text>
        </Box>
      </Box>

      {error && (
        <Text color="red.500" fontSize="sm" mt={2}>
          {error.message}
        </Text>
      )}
    </Box>
  );
};
