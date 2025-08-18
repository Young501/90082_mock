import { useState, useMemo } from "react";
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
import { Plus, X } from "lucide-react";

interface SkillsPillFieldProps {
  name: string;
  label: string;
  options: string[] | { label: string; value: string }[];
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
  const [filter, setFilter] = useState("");
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
      const cleanSkill = String(skill).trim();
      onChange([...value, cleanSkill]);
      setSelectedOption("");
      setCustomSkill("");
      setShowDropdown(false);
      setShowCustomInput(false);
      setFilter("");
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
  const filteredOptions = useMemo(() => {
    if (!filter) return availableOptions;
    const lower = filter.toLowerCase();
    return availableOptions.filter(
      (opt) => typeof opt === "string" && opt.toLowerCase().includes(lower)
    );
  }, [availableOptions, filter]);
  const selectOptions = allowCustom
    ? [...filteredOptions, "other"]
    : filteredOptions;
  const collection = createListCollection({
    items: selectOptions.map((option) => ({
      label:
        option === "other"
          ? "Add custom skill..."
          : typeof option === "string"
            ? option
            : option.label,
      value: typeof option === "string" ? option : option.value,
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
                padding="10px 15px"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={2}
              >
                <Tag.Label>{skill}</Tag.Label>
                <IconButton
                  aria-label="Remove skill"
                  size="sm"
                  color="#fff"
                  backgroundColor="transparent"
                  variant="ghost"
                  onClick={() => handleRemoveSkill(skill)}
                  display="contents"
                >
                  <X size={10} />
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
            <Plus size={10} /> {value.length === 0 ? "ADD SKILLS" : "ADD MORE"}
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
                  <VStack px={2} py={2} gap={2} align="stretch">
                    <Input
                      autoFocus
                      placeholder="Type to filter..."
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      size="sm"
                      borderRadius="md"
                      bg="gray.50"
                      onKeyDown={(e) => {
                        if (e.key === " ") {
                          e.stopPropagation();
                        }
                      }}
                    />
                    {selectOptions.length === 0 && (
                      <span style={{ color: "#888", padding: "8px" }}>
                        No options
                      </span>
                    )}
                    {collection.items.map((item) => (
                      <Select.Item key={item.value} item={item.value}>
                        <Select.ItemText>{item.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </VStack>
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
                  setFilter("");
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
