import React, { useState } from "react";
import {
  Box,
  Text,
  HStack,
  VStack,
  Checkbox,
  Slider,
  RadioGroup,
} from "@chakra-ui/react";
import {
  FacetField,
  FacetOption,
  FilterValue,
  ArrayFilterValue,
} from "@/types/opportunity";

interface FilterFieldV2Props {
  facet: FacetField;
  value: FilterValue | undefined;
  onChange: (value: FilterValue | undefined) => void;
}

export const FilterFieldV2: React.FC<FilterFieldV2Props> = ({
  facet,
  value,
  onChange,
}) => {
  const [arrayMode, setArrayMode] = useState<"and" | "or">("or");

  const renderScalarFilter = () => {
    const selectedValues = Array.isArray(value) ? value : [];
    // Filter out options with 0 count
    const availableOptions = facet.options.filter((option) => option.count > 0);

    return (
      <VStack align="stretch" gap={3} w="100%">
        {availableOptions.map((option) => {
          const isChecked = selectedValues.includes(option.value);

          return (
            <HStack key={option.value} w="100%" justify="space-between">
              <Checkbox.Root
                checked={isChecked}
                onCheckedChange={(details) => {
                  const checked = !!details.checked;
                  const newValues = checked
                    ? [...selectedValues, option.value]
                    : selectedValues.filter((v) => v !== option.value);

                  onChange(newValues.length > 0 ? newValues : undefined);
                }}
                size="sm"
                // variant="outline"
                colorPalette="#2AA8E0"
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control
                  bg={isChecked ? "#2AA8E0" : "transparent"}
                  border={isChecked ? "1px solid #2AA8E0" : "1px solid #E4E4E7"}
                />
                <Checkbox.Label fontSize="xs" color="#3F3F46">
                  {option.value}
                </Checkbox.Label>
              </Checkbox.Root>
              <Text fontSize="xs" color="#52525B">
                ({option.count})
              </Text>
            </HStack>
          );
        })}
      </VStack>
    );
  };

  const renderArrayFilter = () => {
    const isArrayValue =
      value && typeof value === "object" && "values" in value;
    const selectedValues = isArrayValue
      ? (value as ArrayFilterValue).values
      : [];
    const currentMode = isArrayValue
      ? (value as ArrayFilterValue).mode
      : arrayMode;

    return (
      <VStack align="stretch" gap={4} w="100%">
        {/* Mode selector */}
        <Box
          bg="gray.50"
          p={3}
          borderRadius="md"
          border="1px solid"
          borderColor="gray.200"
        >
          <Text fontSize="12px" fontWeight="600" color="#4A4A4A" mb={2}>
            Match mode:
          </Text>
          <RadioGroup.Root
            value={currentMode}
            onValueChange={(details) => {
              const newMode = details.value as "and" | "or";
              setArrayMode(newMode);
              if (selectedValues.length > 0) {
                onChange({
                  values: selectedValues,
                  mode: newMode,
                });
              }
            }}
            size="sm"
            colorPalette="#2AA8E0"
          >
            <HStack gap={4}>
              <RadioGroup.Item value="or">
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemControl
                  bg={currentMode === "or" ? "#2AA8E0" : "transparent"}
                  border="1px solid #E4E4E7"
                />
                <RadioGroup.ItemText fontSize="xs" color="#3F3F46">
                  Any (OR)
                </RadioGroup.ItemText>
              </RadioGroup.Item>
              <RadioGroup.Item value="and">
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemControl
                  bg={currentMode === "and" ? "#2AA8E0" : "transparent"}
                  border="1px solid #E4E4E7"
                />
                <RadioGroup.ItemText fontSize="xs" color="#3F3F46">
                  All (AND)
                </RadioGroup.ItemText>
              </RadioGroup.Item>
            </HStack>
          </RadioGroup.Root>
        </Box>

        {/* Options */}
        <VStack align="stretch" gap={3} w="100%">
          {facet.options
            .filter((option) => option.count > 0)
            .map((option) => {
              const isChecked = selectedValues.includes(option.value);

              return (
                <HStack key={option.value} w="100%" justify="space-between">
                  <Checkbox.Root
                    checked={isChecked}
                    onCheckedChange={(details) => {
                      const checked = !!details.checked;
                      const newValues = checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter((v) => v !== option.value);

                      onChange(
                        newValues.length > 0
                          ? { values: newValues, mode: currentMode }
                          : undefined
                      );
                    }}
                    size="sm"
                    colorPalette="#2AA8E0"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control
                      bg={isChecked ? "#2AA8E0" : "transparent"}
                      border={
                        isChecked ? "1px solid #2AA8E0" : "1px solid #E4E4E7"
                      }
                    />
                    <Checkbox.Label fontSize="xs" color="#3F3F46">
                      {option.value}
                    </Checkbox.Label>
                  </Checkbox.Root>
                  <Text fontSize="xs" color="#52525B">
                    ({option.count})
                  </Text>
                </HStack>
              );
            })}
        </VStack>
      </VStack>
    );
  };

  const renderBooleanFilter = () => {
    const isChecked = value === true;

    return (
      <Checkbox.Root
        checked={isChecked}
        onCheckedChange={(details) => {
          const checked = !!details.checked;
          onChange(checked ? true : undefined);
        }}
        size="sm"
        colorPalette="#2AA8E0"
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control
          bg={isChecked ? "#2AA8E0" : "transparent"}
          border="1px solid #E4E4E7"
        />
        <Checkbox.Label fontSize="xs" color="#3F3F46">
          Yes
        </Checkbox.Label>
      </Checkbox.Root>
    );
  };

  const renderRangeFilter = () => {
    const currentValue = typeof value === "number" ? value : 50;

    return (
      <VStack align="stretch" gap={3} w="100%">
        <HStack justify="space-between">
          <Text fontSize="xs" color="#3F3F46">
            Distance:
          </Text>
          <Text fontSize="16px" fontWeight="600" color="#3F3F46">
            {currentValue} km
          </Text>
        </HStack>
        <Slider.Root
          value={[currentValue]}
          onValueChange={(details) => {
            const newValue = details.value[0];
            onChange(newValue);
          }}
          min={1}
          max={200}
          step={1}
          width="100%"
        >
          <Slider.Control>
            <Slider.Track bg="#F4F4F5">
              <Slider.Range bg="#2AA8E0" />
            </Slider.Track>
            <Slider.Thumb index={0} bg="#2AA8E0" border="2px solid #2AA8E0" />
          </Slider.Control>
        </Slider.Root>
      </VStack>
    );
  };

  const renderFilter = () => {
    switch (facet.kind) {
      case "scalar":
        return renderScalarFilter();
      case "array":
        return renderArrayFilter();
      case "boolean":
        return renderBooleanFilter();
      case "range":
        return renderRangeFilter();
      default:
        return null;
    }
  };

  return <Box w="100%">{renderFilter()}</Box>;
};
