"use client";

import React from "react";
import { Box, VStack, HStack } from "@chakra-ui/react";
import { SearchInput } from "@/components/ui/SearchInput";
import { Search } from "lucide-react";
import { ConversationId, ConversationSummary } from "@/types/messaging";
import { EmptyInbox } from "./EmptyInbox";
import { formatRelativeTime } from "@/utils/formatDate";
import { ArchiveFilterPopover } from "./ArchiveFilterPopover";
import { ConversationBox } from "./conversationBox";

interface ConversationListProps {
  conversations: ConversationSummary[];
  selectedConversationId: ConversationId | null;
  showArchived: boolean;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onShowArchivedChange: (value: boolean) => void;
  onSelectConversation: (id: ConversationId) => void;
  onToggleArchive: (id: ConversationId) => void;
  hasAnyConversations: boolean;
}

export const ConversationList = ({
  conversations,
  selectedConversationId,
  showArchived,
  searchTerm,
  onSearchTermChange,
  onShowArchivedChange,
  onSelectConversation,
  onToggleArchive,
  hasAnyConversations,
}: ConversationListProps) => {
  if (!hasAnyConversations) {
    return <EmptyInbox />;
  }

  return (
    <Box
      w="100%"
      overflow="hidden"
      display="flex"
      flexDirection="column"
      h="100%"
      gap={{ base: 4, lg: 5 }}
    >
      <Box>
        <HStack gap={2} w="100%">
          <Box position="relative" flex={1}>
            <SearchInput
              placeholder="Search conversations"
              value={searchTerm}
              onChange={onSearchTermChange}
              paddingY={0}
            />
          </Box>
          <ArchiveFilterPopover
            showArchived={showArchived}
            onShowArchivedChange={onShowArchivedChange}
          />
        </HStack>
      </Box>

      <Box
        flex={1}
        overflowY="auto"
        maxH="calc(100vh - 220px)"
        borderWidth="1px"
        borderColor="#E4E4E7"
        borderRadius="xl"
      >
        <VStack align="stretch" gap={0} w="100%">
          {conversations.map((conversation) => {
            const isActive = conversation.id === selectedConversationId;
            return (
              <ConversationBox
                key={conversation.id}
                conversation={conversation}
                isActive={isActive}
                onSelect={onSelectConversation}
                onToggleArchive={onToggleArchive}
              />
            );
          })}
        </VStack>
      </Box>
    </Box>
  );
};
