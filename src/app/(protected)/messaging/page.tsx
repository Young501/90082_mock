"use client";

import React, { useMemo, useState } from "react";
import { Box, Flex, useBreakpointValue } from "@chakra-ui/react";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { ConversationList } from "./ConversationList";
import { ConversationView } from "./ConversationView";
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from "./mockData";
import {
  ConversationSummary,
  ConversationId,
  MessagesByConversation,
  Message,
} from "@/types/messaging";

const Inbox = () => {
  const isSinglePane = useBreakpointValue({ base: true, md: true, lg: false });

  const [conversations, setConversations] =
    useState<ConversationSummary[]>(MOCK_CONVERSATIONS);
  const [messagesByConversation, setMessagesByConversation] =
    useState<MessagesByConversation>(MOCK_MESSAGES);
  const [selectedConversationId, setSelectedConversationId] =
    useState<ConversationId | null>(
      MOCK_CONVERSATIONS.length ? MOCK_CONVERSATIONS[0].id : null
    );
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isShowingThreadOnSinglePane, setIsShowingThreadOnSinglePane] =
    useState(false);
  const [composerText, setComposerText] = useState("");

  const filteredConversations = useMemo(() => {
    return conversations
      .filter((c) => c.isArchived === showArchived)
      .filter((c) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.subtitle.toLowerCase().includes(q) ||
          c.lastMessagePreview.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        return (
          new Date(b.lastActivityAt).getTime() -
          new Date(a.lastActivityAt).getTime()
        );
      });
  }, [conversations, searchTerm, showArchived]);

  const selectedConversation = useMemo(
    () =>
      selectedConversationId
        ? conversations.find((c) => c.id === selectedConversationId) || null
        : null,
    [conversations, selectedConversationId]
  );

  const selectedMessages: Message[] = useMemo(() => {
    if (!selectedConversation) return [];
    return messagesByConversation[selectedConversation.id] || [];
  }, [messagesByConversation, selectedConversation]);

  const markConversationAsRead = (conversationId: ConversationId) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, hasUnread: false, unreadCount: 0 } : c
      )
    );
  };

  const handleSelectConversation = (conversationId: ConversationId) => {
    setSelectedConversationId(conversationId);
    markConversationAsRead(conversationId);
    if (isSinglePane) {
      setIsShowingThreadOnSinglePane(true);
    }
  };

  const handleToggleArchive = (conversationId: ConversationId) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, isArchived: !c.isArchived } : c
      )
    );
  };

  const handleSendMessage = () => {
    if (!selectedConversation || !composerText.trim()) return;

    const newMessage: Message = {
      id: `local-${Date.now()}`,
      conversationId: selectedConversation.id,
      sender: "me",
      text: composerText.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessagesByConversation((prev) => {
      const existing = prev[selectedConversation.id] || [];
      return {
        ...prev,
        [selectedConversation.id]: [...existing, newMessage],
      };
    });

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversation.id
          ? {
              ...c,
              lastMessagePreview: newMessage.text || "",
              lastActivityAt: newMessage.createdAt,
              hasUnread: false,
              unreadCount: 0,
            }
          : c
      )
    );

    setComposerText("");
  };

  const hasAnyConversations = conversations.length > 0;

  const renderContent = () => {
    if (!hasAnyConversations) {
      return (
        <Flex w="100%" h="100%" gap={4} align="center" justify="center">
          <ConversationList
            conversations={filteredConversations}
            selectedConversationId={selectedConversationId}
            showArchived={showArchived}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onShowArchivedChange={setShowArchived}
            onSelectConversation={handleSelectConversation}
            onToggleArchive={handleToggleArchive}
            hasAnyConversations={hasAnyConversations}
          />
        </Flex>
      );
    }

    if (isSinglePane) {
      return (
        <Box w="100%" py={4}>
          {isShowingThreadOnSinglePane ? (
            <ConversationView
              isSinglePane={isSinglePane}
              conversation={selectedConversation}
              messages={selectedMessages}
              // hasAnyConversations={hasAnyConversations}
              composerText={composerText}
              onComposerTextChange={setComposerText}
              onSendMessage={handleSendMessage}
              onBackToList={() => setIsShowingThreadOnSinglePane(false)}
              onToggleArchive={handleToggleArchive}
            />
          ) : (
            <Box p={4}>
              <ConversationList
                conversations={filteredConversations}
                selectedConversationId={selectedConversationId}
                showArchived={showArchived}
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                onShowArchivedChange={setShowArchived}
                onSelectConversation={handleSelectConversation}
                onToggleArchive={handleToggleArchive}
                hasAnyConversations={hasAnyConversations}
              />
            </Box>
          )}
        </Box>
      );
    }

    return (
      <Flex w="100%" gap={4} align="stretch" p={4}>
        <Box flexBasis="340px" maxW="360px">
          <ConversationList
            conversations={filteredConversations}
            selectedConversationId={selectedConversationId}
            showArchived={showArchived}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onShowArchivedChange={setShowArchived}
            onSelectConversation={handleSelectConversation}
            onToggleArchive={handleToggleArchive}
            hasAnyConversations={hasAnyConversations}
          />
        </Box>
        <Box flex={1}>
          <ConversationView
            isSinglePane={isSinglePane}
            conversation={selectedConversation}
            messages={selectedMessages}
            // hasAnyConversations={hasAnyConversations}
            composerText={composerText}
            onComposerTextChange={setComposerText}
            onSendMessage={handleSendMessage}
            onBackToList={() => setIsShowingThreadOnSinglePane(false)}
            onToggleArchive={handleToggleArchive}
          />
        </Box>
      </Flex>
    );
  };

  return (
    <>
      <PageTitle title={PAGE_TITLES.MESSAGING} />
      <Box
        w="100%"
        h="100%"
        display="flex"
        justifyContent="center"
        alignItems="start"
        borderRadius="xl"
        // border={{ base: "none", md: "1px solid #E4E4E7" }}
        borderWidth="1px"
        borderColor="#E4E4E7"
        // border={{ base: "none", md: "1px solid #E4E4E7" }}
        bg="white"
        // py={4}
        // px={{ base: 0, md: 4 }}
      >
        {renderContent()}
      </Box>
    </>
  );
};

export default Inbox;
