"use client";

import React, { useRef, useEffect } from "react";
import { Box, VStack, HStack, Spinner } from "@chakra-ui/react";
import { SearchInput } from "@/components/ui/SearchInput";
import { ConversationId, ConversationSummary } from "@/types/messaging";
import { EmptyInbox } from "./EmptyInbox";
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
  profileType: "coordinator" | "organisation" | "student";
  onLoadMoreConversations?: () => void;
  hasMoreConversations?: boolean;
  isLoadingMoreConversations?: boolean;
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
  profileType,
  onLoadMoreConversations,
  hasMoreConversations,
  isLoadingMoreConversations,
}: ConversationListProps) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Handles scroll-triggered loading: fires when the sentinel enters the viewport
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !onLoadMoreConversations || !hasMoreConversations) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMoreConversations();
        }
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    hasMoreConversations,
    isLoadingMoreConversations,
    onLoadMoreConversations,
  ]);

  // Fallback for initial load: if content doesn't fill the container (nothing to scroll),
  // the IntersectionObserver never fires. Directly check after each batch of conversations loads.
  useEffect(() => {
    if (
      !onLoadMoreConversations ||
      !hasMoreConversations ||
      isLoadingMoreConversations
    )
      return;
    const container = scrollContainerRef.current;
    if (!container) return;
    if (container.scrollHeight <= container.clientHeight) {
      onLoadMoreConversations();
    }
  }, [
    conversations,
    hasMoreConversations,
    isLoadingMoreConversations,
    onLoadMoreConversations,
  ]);

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
        ref={scrollContainerRef}
        flex={1}
        overflowY="auto"
        maxH="calc(100vh - 220px)"
        borderWidth="1px"
        borderColor="#E4E4E7"
        borderRadius="xl"
      >
        <VStack align="stretch" gap={0} w="100%">
          {hasAnyConversations ? (
            <>
              {conversations.map((conversation) => {
                const isActive = conversation.id === selectedConversationId;
                return (
                  <ConversationBox
                    key={conversation.id}
                    conversation={conversation}
                    isActive={isActive}
                    onSelect={onSelectConversation}
                    onToggleArchive={onToggleArchive}
                    profileType={profileType}
                  />
                );
              })}

              <Box ref={sentinelRef} h="1px" flexShrink={0} />
              {isLoadingMoreConversations && (
                <Box display="flex" justifyContent="center" py={3}>
                  <Spinner size="sm" color="#71717A" />
                </Box>
              )}
            </>
          ) : (
            <EmptyInbox
              title="No conversations yet"
              description="When you start messaging organisations, your conversations will appear here."
            />
          )}
        </VStack>
      </Box>
    </Box>
  );
};
