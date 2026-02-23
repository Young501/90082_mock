import React from "react";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { FilterButton } from "@/components/ui/FilterButton";
import { MenuPopover } from "@/components/ui/MenuPopover";

interface ArchiveFilterPopoverProps {
  showArchived: boolean;
  onShowArchivedChange: (value: boolean) => void;
}

export const ArchiveFilterPopover: React.FC<ArchiveFilterPopoverProps> = ({
  showArchived,
  onShowArchivedChange,
}) => {
  return (
    <MenuPopover
      placement="bottom-end"
      title="Filter conversations"
      minW="200px"
      contentProps={{ p: 3 }}
      trigger={
        <Box>
          <FilterButton paddingX={2.5} />
        </Box>
      }
    >
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
    </MenuPopover>
  );
};
