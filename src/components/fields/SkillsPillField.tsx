import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button as ChakraButton,
  Select,
  Input,
  Flex,
  Tag,
  IconButton,
  createListCollection,
} from "@chakra-ui/react";
import { Control, useController } from "react-hook-form";
import { Button } from "@/components/ui/Button";

interface SkillsPillFieldProps {
  name: string;
  label: string;
  options: string[];
  control: Control<any>;
  allowCustom?: boolean;
  required?: boolean;
}

export const SkillsPillField = ({
  name,
  label,
  options,
  control,
  allowCustom = false,
  required = false,
}: SkillsPillFieldProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const {
    field: { value = [], onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: [],
  });

  const handleAddSkill = (skill: string) => {
    if (skill && !value.includes(skill)) {
      onChange([...value, skill]);
      setSelectedOption("");
      setCustomSkill("");
      setShowDropdown(false);
      setShowCustomInput(false);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onChange(value.filter((skill: string) => skill !== skillToRemove));
  };

  const handleDropdownChange = (selectedValue: string) => {
    if (selectedValue === "other" && allowCustom) {
      setShowCustomInput(true);
      setSelectedOption("");
    } else if (selectedValue) {
      handleAddSkill(selectedValue);
    }
  };

  const handleCustomAdd = () => {
    if (customSkill.trim()) {
      handleAddSkill(customSkill.trim());
    }
  };

  const availableOptions = options.filter(
    (option) => !value.includes(option) && option !== "other"
  );
  const selectOptions = allowCustom
    ? [...availableOptions, "other"]
    : availableOptions;
  const collection = createListCollection({
    items: selectOptions.map((option) => ({
      label: option === "other" ? "Add custom skill..." : option,
      value: option,
    })),
  });

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

      <VStack align="stretch" gap={4} ml={4}>
        {value.length > 0 && (
          <Flex wrap="wrap" gap={2}>
            {value.map((skill: string) => (
              <Tag.Root
                key={skill}
                size="md"
                borderRadius="full"
                backgroundColor="#002157"
                color="#A2DDF0"
                fontSize="16px"
                padding="10px 30px"
              >
                <Tag.Label>{skill}</Tag.Label>
                <IconButton
                  aria-label="Remove skill"
                  size="sm"
                  color="#fff"
                  backgroundColor="transparent"
                  variant="ghost"
                  onClick={() => handleRemoveSkill(skill)}
                  ml={1}
                  display="contents"
                >
                  ×
                </IconButton>
              </Tag.Root>
            ))}
          </Flex>
        )}

        {!showDropdown ? (
          <ChakraButton
            variant="outline"
            onClick={() => setShowDropdown(true)}
            style={{
              width: "fit-content",
              padding: "10px 20px",
              borderRadius: "50px",
              border: "1px solide #CFF3FF",
              fontWeight: "bold",
              color: "#282F68",
              backgroundColor: "#CFF3FF",
            }}
          >
            + ADD MORE
          </ChakraButton>
        ) : (
          <VStack align="stretch" gap={3}>
            {!showCustomInput ? (
              <Select.Root
                collection={collection}
                value={[selectedOption]}
                onValueChange={(details) =>
                  handleDropdownChange(details.value[0] || "")
                }
                size="md"
              >
                <Select.Trigger>
                  <Select.ValueText placeholder="Select a skill..." />
                </Select.Trigger>
                <Select.Content>
                  {collection.items.map((item) => (
                    <Select.Item key={item.value} item={item.value}>
                      <Select.ItemText>{item.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            ) : (
              <HStack gap={2}>
                <Input
                  placeholder="Enter custom skill..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  size="md"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCustomAdd();
                    }
                  }}
                />
                <ChakraButton
                  colorScheme="blue"
                  size="md"
                  onClick={handleCustomAdd}
                  disabled={!customSkill.trim()}
                >
                  Add
                </ChakraButton>
              </HStack>
            )}

            <HStack gap={2}>
              <ChakraButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowDropdown(false);
                  setShowCustomInput(false);
                  setSelectedOption("");
                  setCustomSkill("");
                }}
              >
                Cancel
              </ChakraButton>
            </HStack>
          </VStack>
        )}
      </VStack>

      {error && (
        <Text color="red.500" fontSize="sm" mt={1}>
          {error.message}
        </Text>
      )}
    </Box>
  );
};
