import { Box, Text, Grid } from "@chakra-ui/react";
import { Control, useController } from "react-hook-form";

interface CardSelectFieldProps {
  name: string;
  label: string;
  options: string[];
  control: Control<any>;
  required?: boolean;
  maxSelection?: number;
}

export const CardSelectField = ({
  name,
  label,
  options,
  control,
  required = false,
  maxSelection,
}: CardSelectFieldProps) => {
  const isSingleSelect = maxSelection === 1;

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

  const handleCardClick = (option: string) => {
    if (isSingleSelect) {
      const isSelected = currentValue === option;
      onChange(isSelected ? "" : option);
    } else {
      const valueArray = currentValue;
      const isSelected = valueArray.includes(option);

      if (isSelected) {
        onChange(valueArray.filter((item: string) => item !== option));
      } else {
        if (maxSelection && valueArray.length >= maxSelection) {
          return;
        }
        onChange([...valueArray, option]);
      }
    }
  };

  const isCardDisabled = (option: string) => {
    if (isSingleSelect) {
      return false;
    }
    const valueArray = currentValue;
    return (
      !valueArray.includes(option) &&
      maxSelection &&
      valueArray.length >= maxSelection
    );
  };

  const isCardSelected = (option: string) => {
    if (isSingleSelect) {
      return currentValue === option;
    }
    const valueArray = currentValue;
    return valueArray.includes(option);
  };

  return (
    <Box>
      <Box mb={6}>
        <Text fontSize="18px" fontWeight="medium" mb={2}>
          {label}
          {required && (
            <Text as="span" color="red.500" ml={1}>
              *
            </Text>
          )}
        </Text>
        {maxSelection && (
          <Text fontSize="sm" color="gray.600">
            (Choose up to {maxSelection})
          </Text>
        )}
      </Box>

      <Grid
        templateColumns="repeat(auto-fit, minmax(180px, 1fr))"
        gap={4}
        maxW="600px"
      >
        {options.map((option) => (
          <Box
            key={option}
            onClick={() => handleCardClick(option)}
            cursor={isCardDisabled(option) ? "not-allowed" : "pointer"}
            border="2px solid"
            borderColor={isCardSelected(option) ? "#167BB3" : "#E2E8F0"}
            borderRadius="12px"
            p={4}
            minH="80px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            bg={isCardSelected(option) ? "rgba(44, 169, 223, 0.05)" : "white"}
            opacity={isCardDisabled(option) ? 0.5 : 1}
            transition="all 0.2s ease-in-out"
            _hover={{
              borderColor: isCardDisabled(option) ? "#E2E8F0" : "#167BB3",
              transform: isCardDisabled(option) ? "none" : "translateY(-2px)",
              boxShadow: isCardDisabled(option) ? "none" : "0 4px 12px #2CA9DF",
            }}
            position="relative"
          >
            <Text
              fontSize="14px"
              fontWeight={isCardSelected(option) ? "600" : "500"}
              color={isCardSelected(option) ? "#167BB3" : "#4A5568"}
              lineHeight="1.3"
            >
              {option}
            </Text>

            {isCardSelected(option) && (
              <Box
                position="absolute"
                top="8px"
                right="8px"
                w="20px"
                h="20px"
                borderRadius="50%"
                bg="#167BB3"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="white" fontSize="12px" fontWeight="bold">
                  ✓
                </Text>
              </Box>
            )}
          </Box>
        ))}
      </Grid>

      {error && (
        <Text color="red.500" fontSize="sm" mt={3}>
          {error.message}
        </Text>
      )}
    </Box>
  );
};
