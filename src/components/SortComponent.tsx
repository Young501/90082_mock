import React, { useState } from "react";
import {
  Box,
  Text,
  HStack,
  VStack,
  Checkbox,
  Popover,
  Button,
} from "@chakra-ui/react";
import { ChevronDown, ChevronUp } from "lucide-react";
export interface SortOption<T extends string = string> {
  label: string;
  value: T;
}

interface SortComponentProps<T extends string = string> {
  triggerLabel?: string;
  value?: T | null;
  options: SortOption<T>[];
  onChange: (value: T | null) => void;
}

export function SortComponent<T extends string = string>({
  triggerLabel = "Sort by",
  value,
  options,
  onChange,
}: SortComponentProps<T>) {
  const [openPopover, setOpenPopover] = useState(false);
  const selectedOption = value
    ? options.find((opt) => opt.value === value)
    : null;

  const handleCheckboxChange = (optionValue: T, checked: boolean) => {
    if (checked) {
      onChange(optionValue);
    } else {
      if (value === optionValue) {
        onChange(null);
      }
    }
  };

  return (
    <Box>
      <Popover.Root
        positioning={{ placement: "bottom-start", sameWidth: true }}
        closeOnInteractOutside
        onOpenChange={(open) => setOpenPopover(open.open)}
      >
        <Popover.Trigger asChild>
          <Button
            variant="outline"
            size="sm"
            fontWeight="600"
            color="#111827"
            border="none"
            bg="white"
            px={3}
            py={2}
            minW="140px"
            justifyContent="space-between"
          >
            <HStack gap={1} w="100%" justify="space-between">
              <Text fontSize="sm" fontWeight="400" color="#111827">
                <span style={{ fontWeight: "600" }}>{triggerLabel} : </span>
                {selectedOption ? selectedOption.label : "Select an option"}
              </Text>

              {openPopover ? (
                <ChevronUp size={16} style={{ fontWeight: "600" }} />
              ) : (
                <ChevronDown size={16} style={{ fontWeight: "600" }} />
              )}
            </HStack>
          </Button>
        </Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content
            bg="white"
            borderRadius="md"
            borderWidth="1px"
            borderColor="#E4E4E7"
            boxShadow="sm"
            p={1}
            maxW="200px"
          >
            <Popover.Body p={0}>
              <VStack align="stretch" gap={2}>
                {options.map((opt) => {
                  const isChecked = value === opt.value;
                  return (
                    <Checkbox.Root
                      key={opt.value}
                      checked={isChecked}
                      onCheckedChange={(details) =>
                        handleCheckboxChange(opt.value as T, !!details.checked)
                      }
                      size="sm"
                      colorPalette="#2AA8E0"
                      py={1.5}
                      px={2}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control
                        bg={isChecked ? "#2AA8E0" : "transparent"}
                        border={
                          isChecked ? "1px solid #2AA8E0" : "1px solid #E4E4E7"
                        }
                        borderRadius="50%"
                      />
                      <Checkbox.Label fontSize="sm" color="#000000">
                        {opt.label}
                      </Checkbox.Label>
                    </Checkbox.Root>
                  );
                })}
              </VStack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    </Box>
  );
}
