"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Flex, Spinner, Text, useBreakpointValue } from "@chakra-ui/react";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { ConversationList } from "./ConversationList";
import { ConversationView } from "./ConversationView";
import {
  useInfiniteConversationsList,
  useConversationMessages,
  useMarkConversationAsRead,
  useSendMessage,
  useToggleConversationArchive,
} from "@/services/messaging";
import {
  ConversationId,
  Message,
  messageListItemToMessage,
  conversationListItemToSummary,
} from "@/types/messaging";
import { useAuthStore } from "@/store";

const Inbox = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSinglePane = useBreakpointValue({ base: true, md: true, lg: false });

  const deepLinkConversationId = useMemo(() => {
    const id = searchParams.get("conversation") ?? searchParams.get("id");
    if (!id) return null;
    const num = Number(id);
    return num;
  }, [searchParams]);

  const [selectedConversationId, setSelectedConversationId] =
    useState<ConversationId | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isShowingThreadOnSinglePane, setIsShowingThreadOnSinglePane] =
    useState(false);
  const [composerText, setComposerText] = useState("");

  const { getUserType } = useAuthStore();
  const userType = getUserType();
  const profileType: "student" | "organisation" = userType === "organisation" ? "organisation" : "student";

  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    isError: conversationsError,
    hasNextPage: hasMoreConversations,
    fetchNextPage: fetchNextConversationsPage,
    isFetchingNextPage: isFetchingMoreConversations,
  } = useInfiniteConversationsList({
    archived: showArchived,
    page_size: 10,
  });

  const conversations = useMemo(
    () =>
      conversationsData?.pages.flatMap((page) =>
        page.results.map(conversationListItemToSummary)
      ) ?? [],
    [conversationsData]
  );

  const handleLoadMoreConversations = useCallback(() => {
    if (hasMoreConversations && !isFetchingMoreConversations) {
      fetchNextConversationsPage();
    }
  }, [
    hasMoreConversations,
    isFetchingMoreConversations,
    fetchNextConversationsPage,
  ]);

  const setUnreadCount = useAuthStore((s) => s.setUnreadCount);

  useEffect(() => {
    if (!showArchived) {
      const total = conversations.reduce(
        (sum, c) => sum + (c.unreadCount ?? 0),
        0
      );
      setUnreadCount(total);
    }
  }, [conversations, showArchived, setUnreadCount]);

  const [messagesCursor, setMessagesCursor] = useState<string | null>(null);
  const [allMessages, setAllMessages] = useState<Message[]>([]);

  const { data: messagesData, isLoading: messagesLoading } =
    useConversationMessages(selectedConversationId, {
      page_size: 50,
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

  useEffect(() => {
    if (selectedMessages.length > 0) {
      if (messagesCursor) {
        // Loading older messages - prepend them
        setAllMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMessages = selectedMessages.filter(
            (m) => !existingIds.has(m.id)
          );

          return [...newMessages, ...prev];
        });
      } else {
        // Initial load or new conversation - replace
        setAllMessages(selectedMessages);
      }
    }
  }, [selectedMessages, messagesCursor]);

  const handleLoadMoreMessages = () => {
    if (messagesData?.previous && !messagesLoading) {
      try {
        const cursor = new URL(messagesData.previous).searchParams.get(
          "cursor"
        );
        setMessagesCursor(cursor);
      } catch {
        setMessagesCursor(messagesData.previous);
      }
    }
  };

  const sendMessageMutation = useSendMessage();
  const toggleArchiveMutation = useToggleConversationArchive();
  const markReadMutation = useMarkConversationAsRead();
  const markReadMutateRef = React.useRef(markReadMutation.mutate);
  markReadMutateRef.current = markReadMutation.mutate;

  useEffect(() => {
    if (selectedConversationId != null) {
      markReadMutateRef.current(selectedConversationId);
    }
  }, [selectedConversationId]);

  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    const q = searchTerm.toLowerCase();
    return conversations.filter(
      (c) =>
        c.organisationTitle?.toLowerCase().includes(q) ||
        c.otherUserName.toLowerCase().includes(q) ||
        c.organisationSubtitle.toLowerCase().includes(q) ||
        c.studentSubtitle.toLowerCase().includes(q) ||
        c.lastMessagePreview.toLowerCase().includes(q)
    );
  }, [conversations, searchTerm]);

  // console.log("filteredConversations", filteredConversations);

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

  useEffect(() => {
    if (
      !conversationsLoading &&
      filteredConversations.length > 0 &&
      selectedConversationId == null
    ) {
      const deepLinkExists =
        deepLinkConversationId != null &&
        filteredConversations.some((c) => c.id === deepLinkConversationId);
      const idToSelect = deepLinkExists
        ? deepLinkConversationId!
        : filteredConversations[0].id;
      setSelectedConversationId(idToSelect);
      if (isSinglePane) setIsShowingThreadOnSinglePane(true);
    }
  }, [
    conversationsLoading,
    filteredConversations,
    selectedConversationId,
    isSinglePane,
    deepLinkConversationId,
  ]);

  const handleSelectConversation = (conversationId: ConversationId) => {
    setSelectedConversationId(conversationId);
    if (isSinglePane) setIsShowingThreadOnSinglePane(true);
    router.replace(`/messaging/?conversation=${conversationId}`, {
      scroll: false,
    });
  };

  const handleBackToList = () => {
    setIsShowingThreadOnSinglePane(false);
    router.replace("/messaging/", { scroll: false });
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

    const storeUser = useAuthStore.getState().user;
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConversation.id,
      sender: "me",
      text: composerText.trim() || undefined,
      createdAt: new Date().toISOString(),
      messanger: storeUser
        ? {
            id: Number(storeUser.id),
            email: storeUser.email ?? "",
            full_name:
              `${storeUser.first_name ?? ""} ${storeUser.last_name ?? ""}`.trim(),
            profile_picture_url: storeUser.profile_picture_url ?? null,
            user_types: storeUser.user_types ?? [],
            organisation_name: null,
            organisation_logo_url: null,
            organisation_id: null,
          }
        : null,
    };
    setAllMessages((prev) => [...prev, tempMessage]);
    setComposerText("");

    sendMessageMutation.mutate(
      {
        conversationId: selectedConversation.id,
        content: tempMessage.text || "",
        files: files,
        replyToId: replyToId,
      },
      {
        onSuccess: () => {
          setMessagesCursor(null);
        },
        onError: () => {
          setAllMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
          setComposerText(tempMessage.text ?? "");
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
              onBackToList={handleBackToList}
              onToggleArchive={handleToggleArchive}
              messagesLoading={messagesLoading && !messagesCursor}
              profileType={profileType}
              hasMoreMessages={hasMoreMessages}
              onLoadMoreMessages={handleLoadMoreMessages}
              isLoadingMoreMessages={isLoadingMoreMessages}
              isSending={sendMessageMutation.isPending}
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
                onLoadMoreConversations={handleLoadMoreConversations}
                hasMoreConversations={hasMoreConversations}
                isLoadingMoreConversations={isFetchingMoreConversations}
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
            onLoadMoreConversations={handleLoadMoreConversations}
            hasMoreConversations={hasMoreConversations}
            isLoadingMoreConversations={isFetchingMoreConversations}
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
            onBackToList={handleBackToList}
            onToggleArchive={handleToggleArchive}
            messagesLoading={messagesLoading && !messagesCursor}
            profileType={profileType}
            hasMoreMessages={hasMoreMessages}
            onLoadMoreMessages={handleLoadMoreMessages}
            isLoadingMoreMessages={isLoadingMoreMessages}
            isSending={sendMessageMutation.isPending}
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
