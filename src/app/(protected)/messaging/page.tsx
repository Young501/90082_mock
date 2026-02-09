"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Box, Flex, Spinner, Text, useBreakpointValue } from "@chakra-ui/react";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { ConversationList } from "./ConversationList";
import { ConversationView } from "./ConversationView";
import {
  useConversationsList,
  useConversationMessages,
  useSendMessage,
  useToggleConversationArchive,
} from "@/services/messaging";
import {
  ConversationSummary,
  ConversationId,
  Message,
  messageListItemToMessage,
} from "@/types/messaging";
import { useAuthStore } from "@/store";

const Inbox = () => {
  const isSinglePane = useBreakpointValue({ base: true, md: true, lg: false });

  const [selectedConversationId, setSelectedConversationId] =
    useState<ConversationId | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isShowingThreadOnSinglePane, setIsShowingThreadOnSinglePane] =
    useState(false);
  const [composerText, setComposerText] = useState("");

  const { getUserType } = useAuthStore();
  const userType = getUserType();
  const profileType =
    userType === "coordinator"
      ? "coordinator"
      : userType === "organisation"
        ? "organisation"
        : "student";

  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    isError: conversationsError,
  } = useConversationsList({
    archived: showArchived,
    page_size: 50,
  });

  const [messagesCursor, setMessagesCursor] = useState<string | null>(null);
  const [allMessages, setAllMessages] = useState<Message[]>([]);

  // Cursor pagination: API returns newest-first. No cursor = first page (newest).
  // messagesData.previous = cursor to fetch the next older page; we store that
  // in messagesCursor and merge each older page into allMessages by prepending.
  const { data: messagesData, isLoading: messagesLoading } =
    useConversationMessages(selectedConversationId, {
      page_size: 5,
      cursor: messagesCursor || undefined,
    });

  const selectedMessages = useMemo(() => {
    if (!messagesData) return [];
    const currentUserId = useAuthStore.getState().user?.id;
    const numericUserId =
      currentUserId != null ? Number(currentUserId) : undefined;
    return messagesData.results.map((item) =>
      messageListItemToMessage(item, selectedConversationId!, numericUserId)
    );
  }, [messagesData, selectedConversationId]);

  const hasMoreMessages = !!messagesData?.previous;
  const isLoadingMoreMessages = messagesLoading && !!messagesCursor;

  useEffect(() => {
    if (selectedConversationId) {
      setAllMessages([]);
      setMessagesCursor(null);
    }
  }, [selectedConversationId]);

  // Sync API page(s) into allMessages: initial page replaces; older pages prepend.
  useEffect(() => {
    if (selectedMessages.length === 0) return;
    if (messagesCursor) {
      setAllMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newMessages = selectedMessages.filter(
          (m) => !existingIds.has(m.id)
        );
        return [...newMessages, ...prev];
      });
    } else {
      setAllMessages(selectedMessages);
    }
  }, [selectedMessages, messagesCursor]);

  const handleLoadMoreMessages = () => {
    if (messagesData?.previous && !messagesLoading) {
      setMessagesCursor(messagesData.previous);
    }
  };

  const sendMessageMutation = useSendMessage();
  const toggleArchiveMutation = useToggleConversationArchive();

  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    const q = searchTerm.toLowerCase();
    return conversations.filter(
      (c) =>
        c.organisationTitle?.toLowerCase().includes(q) ||
        c.studentTitle.toLowerCase().includes(q) ||
        c.organisationSubtitle.toLowerCase().includes(q) ||
        c.studentSubtitle.toLowerCase().includes(q) ||
        c.lastMessagePreview.toLowerCase().includes(q)
    );
  }, [conversations, searchTerm]);

  console.log("filteredConversations", filteredConversations);

  const selectedConversation = useMemo(
    () =>
      selectedConversationId
        ? (conversations.find((c) => c.id === selectedConversationId) ?? null)
        : null,
    [conversations, selectedConversationId]
  );

  useEffect(() => {
    if (selectedConversationId == null) return;

    const existsInFiltered = filteredConversations.some(
      (c) => c.id === selectedConversationId
    );

    if (!existsInFiltered) {
      setSelectedConversationId(null);
      setIsShowingThreadOnSinglePane(false);
    }
  }, [filteredConversations, selectedConversationId]);

  const handleSelectConversation = (conversationId: ConversationId) => {
    setSelectedConversationId(conversationId);
    if (isSinglePane) setIsShowingThreadOnSinglePane(true);
  };

  const handleToggleArchive = (conversationId: ConversationId) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) return;

    toggleArchiveMutation.mutate({
      conversationId,
      isArchived: !conversation.isArchived,
    });
  };

  const hasAnyConversations = filteredConversations.length > 0;

  const handleSendMessage = (files?: File[], replyToId?: number) => {
    if (
      !selectedConversation ||
      (!composerText.trim() && !files?.length && !replyToId)
    )
      return;
    sendMessageMutation.mutate(
      {
        conversationId: selectedConversation.id,
        content: composerText.trim() || "",
        files: files,
        replyToId: replyToId,
      },
      {
        onSuccess: () => {
          setComposerText("");
          setMessagesCursor(null);
        },
      }
    );
  };

  const renderContent = () => {
    if (conversationsError) {
      return (
        <Flex w="100%" h="100%" align="center" justify="center" p={4}>
          <Text color="red.500">Failed to load conversations.</Text>
        </Flex>
      );
    }

    if (conversationsLoading) {
      return (
        <Flex w="100%" h="100%" align="center" justify="center" p={4}>
          <Spinner size="lg" />
        </Flex>
      );
    }

    // if (!hasAnyConversations) {
    //   return (
    //     <Flex w="100%" h="100%" gap={4} align="center" justify="center">
    //       <ConversationList
    //         conversations={[]}
    //         selectedConversationId={selectedConversationId}
    //         showArchived={showArchived}
    //         searchTerm={searchTerm}
    //         onSearchTermChange={setSearchTerm}
    //         onShowArchivedChange={setShowArchived}
    //         onSelectConversation={handleSelectConversation}
    //         onToggleArchive={handleToggleArchive}
    //         hasAnyConversations={false}
    //         profileType={profileType}
    //       />
    //     </Flex>
    //   );
    // }

    if (isSinglePane) {
      return (
        <Box w="100%" h="100%">
          {isShowingThreadOnSinglePane && selectedConversation ? (
            <ConversationView
              isSinglePane={isSinglePane}
              conversation={selectedConversation}
              messages={allMessages}
              composerText={composerText}
              onComposerTextChange={setComposerText}
              onSendMessage={handleSendMessage}
              onBackToList={() => setIsShowingThreadOnSinglePane(false)}
              onToggleArchive={handleToggleArchive}
              messagesLoading={messagesLoading && !messagesCursor}
              profileType={profileType}
              hasMoreMessages={hasMoreMessages}
              onLoadMoreMessages={handleLoadMoreMessages}
              isLoadingMoreMessages={isLoadingMoreMessages}
            />
          ) : (
            <Box p={4} h="100%">
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
                profileType={profileType}
              />
            </Box>
          )}
        </Box>
      );
    }

    return (
      <Flex w="100%" gap={4} align="stretch" p={4}>
        <Box flexBasis="358px" maxW="358px" h="100%">
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
            profileType={profileType}
          />
        </Box>
        <Box flex={1} h="100%">
          <ConversationView
            isSinglePane={isSinglePane}
            conversation={selectedConversation}
            messages={allMessages}
            composerText={composerText}
            onComposerTextChange={setComposerText}
            onSendMessage={handleSendMessage}
            onBackToList={() => setIsShowingThreadOnSinglePane(false)}
            onToggleArchive={handleToggleArchive}
            messagesLoading={messagesLoading && !messagesCursor}
            profileType={profileType}
            hasMoreMessages={hasMoreMessages}
            onLoadMoreMessages={handleLoadMoreMessages}
            isLoadingMoreMessages={isLoadingMoreMessages}
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
        // maxH=""
        // maxH="calc(100vh - 256px)"
        display="flex"
        justifyContent="center"
        alignItems="start"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="#E4E4E7"
        bg="white"
      >
        {renderContent()}
      </Box>
    </>
  );
};

export default Inbox;
