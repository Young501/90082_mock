import React from "react";
import { Box, HStack, Text, VStack, Popover } from "@chakra-ui/react";
import { FilterButton } from "@/components/ui/FilterButton";

interface ArchiveFilterPopoverProps {
  showArchived: boolean;
  onShowArchivedChange: (value: boolean) => void;
}

export const ArchiveFilterPopover: React.FC<ArchiveFilterPopoverProps> = ({
  showArchived,
  onShowArchivedChange,
}) => {
  return (
    <Popover.Root positioning={{ placement: "bottom-end" }}>
      <Popover.Trigger>
        <Box>
          <FilterButton paddingX={2.5} />
        </Box>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content
          bg="white"
          borderRadius="lg"
          boxShadow="lg"
          borderWidth="1px"
          borderColor="gray.100"
          p={3}
          minW="200px"
        >
          <VStack align="stretch" gap={2}>
            <Text fontWeight="semibold" fontSize="sm">
              Filter conversations
            </Text>
            <VStack align="stretch" gap={1}>
              <HStack
                gap={2}
                cursor="pointer"
                px={2}
                py={1}
                borderRadius="md"
                bg={!showArchived ? "#F4F4F5" : "transparent"}
                _hover={{ bg: "#F4F4F5" }}
                onClick={() => onShowArchivedChange(false)}
              >
                <Text fontSize="sm" color="#111827">
                  Inbox
                </Text>
              </HStack>
              <HStack
                gap={2}
                cursor="pointer"
                px={2}
                py={1}
                borderRadius="md"
                bg={showArchived ? "#F4F4F5" : "transparent"}
                _hover={{ bg: "#F4F4F5" }}
                onClick={() => onShowArchivedChange(true)}
              >
                <Text fontSize="sm" color="#111827">
                  Archived
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
};
