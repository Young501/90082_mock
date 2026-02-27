"use client";

import React, { useState } from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  IconButton,
  Avatar,
} from "@chakra-ui/react";
import { MenuPopover } from "@/components/ui/MenuPopover";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { Tooltip } from "@/components/ui/tooltip";
import { Message, MessageAttachment } from "@/types/messaging";
import { formatDateTimeToReadable } from "@/utils/formatDate";
import { File, MoreHorizontal, Paperclip, Reply } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface MessageBoxProps {
  message: Message;
  isMine: boolean;
  profileType: "coordinator" | "organisation" | "student";
  showActions: boolean;
  isSinglePane: boolean | undefined;
  numericUserId: number | undefined;
  onHoverIn: () => void;
  onHoverOut: () => void;
  onMessageClick: () => void;
  onCloseActions: () => void;
  onReply: (message: Message) => void;
  onScrollToMessage: (messageId: string | number) => void;
  messageRef: (el: HTMLDivElement | null) => void;
  isCopied: boolean;
  onCopy: () => void;
}

export const MessageBox = ({
  message,
  isMine,
  profileType,
  showActions,
  isSinglePane,
  numericUserId,
  onHoverIn,
  onHoverOut,
  onMessageClick,
  onCloseActions,
  onReply,
  onScrollToMessage,
  messageRef,
  isCopied,
  onCopy,
}: MessageBoxProps) => {
  const bubbleBg = isMine ? "profile.500" : "#F4F4F5";
  const bubbleBorder = isMine ? "profile.500" : "#E4E4E7";
  const bubbleBorderRadius = isMine
    ? "12px 0px 12px 12px"
    : "0px 12px 12px 12px";

  const isAttachmentOnly =
    !message.text?.trim() && (message.attachments?.length ?? 0) > 0;
  const showCopy = !isAttachmentOnly;

  const hasAttachments = !!(
    message.attachments && message.attachments?.length > 0
  );

  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const TRUNCATE_LENGTH = 180;
  const text = message.text ?? "";
  const shouldTruncate = text.length > TRUNCATE_LENGTH;
  const displayText =
    shouldTruncate && !isTextExpanded
      ? text.slice(0, TRUNCATE_LENGTH).trim() + "…"
      : text;

  return (
    <Box
      key={message.id}
      ref={messageRef}
      display="flex"
      justifyContent={isMine ? "flex-end" : "flex-start"}
      onMouseEnter={onHoverIn}
      onMouseLeave={onHoverOut}
      onClick={onMessageClick}
    >
      <Box
        maxW="100%"
        display="flex"
        flexDirection="row"
        gap={1}
        alignItems="center"
        w="100%"
        justifyContent={isMine ? "flex-end" : "flex-start"}
      >
        <VStack gap={1}>
          <HStack alignItems="center" gap={1}>
            <HStack gap={3} align="flex-start">
              {!isMine && (
                <Avatar.Root size="sm">
                  <Avatar.Image
                    src={message.messanger?.profile_picture_url ?? ""}
                    alt={message.messanger?.full_name ?? ""}
                    w="28px"
                    h="28px"
                  />
                  <Avatar.Fallback bg="#E4E4E7" color="black">
                    {message.messanger?.full_name?.slice(0, 2).toUpperCase()}
                  </Avatar.Fallback>
                </Avatar.Root>
              )}
              <VStack gap={1}>
                <HStack gap={1}>
                  {isMine && (
                    <MessageActionsMenu
                      isMine={isMine}
                      showActions={showActions}
                      isSinglePane={isSinglePane}
                      onCopy={onCopy}
                      isCopied={isCopied}
                      showCopy={showCopy}
                      profileType={profileType}
                      onMessageClick={onMessageClick}
                      onCloseActions={onCloseActions}
                    />
                  )}
                  <Box
                    borderRadius="xl"
                    px={4}
                    py={3}
                    bg={bubbleBg}
                    color={isMine ? "white" : "#18181B"}
                    maxW={`${hasAttachments ? "317px" : "396px"}`}
                    w={
                      hasAttachments
                        ? { base: "100%", md: "317px" }
                        : { base: "100%" }
                    }
                    borderWidth="1px"
                    borderColor={bubbleBorder}
                    style={{ borderRadius: bubbleBorderRadius }}
                  >
                    {message.replyToPreview && (
                      <ReplyPreview
                        message={message}
                        isMine={isMine}
                        profileType={profileType}
                        numericUserId={numericUserId}
                        onScrollToMessage={onScrollToMessage}
                      />
                    )}
                    {text && (
                      <VStack align="flex-start" gap={0}>
                        <Text fontSize="sm" whiteSpace="pre-wrap">
                          {displayText}
                        </Text>
                        {shouldTruncate && (
                          <Box
                            as="span"
                            role="button"
                            tabIndex={0}
                            fontSize="sm"
                            fontWeight="semibold"
                            mt={1}
                            cursor="pointer"
                            opacity={0.9}
                            color="inherit"
                            _hover={{ opacity: 1, textDecoration: "underline" }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setIsTextExpanded((prev) => !prev);
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsTextExpanded((prev) => !prev);
                            }}
                          >
                            {isTextExpanded ? "Show less" : "Read more"}
                          </Box>
                        )}
                      </VStack>
                    )}
                    {hasAttachments && message.attachments && (
                      <MessageAttachments
                        attachments={message.attachments}
                        isMine={isMine}
                      />
                    )}
                  </Box>
                  {!isMine && (
                    <MessageActionsMenu
                      isMine={isMine}
                      showActions={showActions}
                      isSinglePane={isSinglePane}
                      onCopy={onCopy}
                      isCopied={isCopied}
                      showCopy={showCopy}
                      profileType={profileType}
                      onMessageClick={onMessageClick}
                      onCloseActions={onCloseActions}
                      onReply={() => onReply(message)}
                    />
                  )}
                </HStack>
                <Text
                  mt={1}
                  flexShrink={0}
                  whiteSpace="nowrap"
                  alignSelf={isMine ? "flex-end" : "flex-start"}
                  fontSize="10px"
                  color="#52525B"
                  textAlign={isMine ? "right" : "left"}
                >
                  {formatDateTimeToReadable(message.createdAt)}
                </Text>
              </VStack>
              {isMine && (
                <Avatar.Root size="sm">
                  <Avatar.Image
                    src={message.messanger?.profile_picture_url ?? ""}
                    alt={message.messanger?.full_name ?? ""}
                    w="28px"
                    h="28px"
                  />
                  <Avatar.Fallback bg="#E4E4E7" color="black">
                    {message.messanger?.full_name?.slice(0, 2).toUpperCase()}
                  </Avatar.Fallback>
                </Avatar.Root>
              )}
            </HStack>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

interface ReplyPreviewProps {
  message: Message;
  isMine: boolean;
  profileType: "coordinator" | "organisation" | "student";
  numericUserId: number | undefined;
  onScrollToMessage: (messageId: string | number) => void;
}

function ReplyPreview({
  message,
  isMine,
  profileType,
  numericUserId,
  onScrollToMessage,
}: ReplyPreviewProps) {
  const preview = message.replyToPreview!;

  return (
    <Box
      mb={2}
      pb={2}
      borderBottomWidth="1px"
      borderBottomColor={
        isMine ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.1)"
      }
    >
      <HStack gap={2} align="flex-start">
        <Box
          w="3px"
          h="100%"
          bg={isMine ? "rgba(255, 255, 255, 0.5)" : "profile.500"}
          borderRadius="sm"
          flexShrink={0}
        />
        <VStack
          align="flex-start"
          gap={0}
          flex={1}
          minW={0}
          cursor={preview.isSoftDeleted ? "default" : "pointer"}
          onClick={(e) => {
            e.stopPropagation();
            if (!preview.isSoftDeleted) {
              onScrollToMessage(preview.id);
            }
          }}
          _hover={!preview.isSoftDeleted ? { opacity: 0.8 } : {}}
        >
          <HStack gap={1}>
            <Reply
              size={12}
              color={isMine ? "rgba(255, 255, 255, 0.8)" : "var(--profile-500)"}
            />
            <Text
              fontSize="xs"
              fontWeight="semibold"
              color={isMine ? "rgba(255, 255, 255, 0.9)" : "profile.500"}
            >
              {preview.isSoftDeleted
                ? "Deleted message"
                : preview.senderId === numericUserId
                  ? "Replying to your message"
                  : "Replying to message"}
            </Text>
          </HStack>
          {!preview.isSoftDeleted && (
            <Text
              fontSize="xs"
              color={isMine ? "rgba(255, 255, 255, 0.8)" : "#71717A"}
              overflow="hidden"
              textOverflow="ellipsis"
              display="-webkit-box"
              style={{
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {preview.contentPreview}
            </Text>
          )}
        </VStack>
      </HStack>
    </Box>
  );
}

function MessageAttachments({
  attachments,
  isMine,
}: {
  attachments: MessageAttachment[];
  isMine: boolean;
}) {
  return (
    <VStack
      align="center"
      gap={1}
      mt={2}
      justify="center"
      alignItems="center"
      w="100%"
    >
      {attachments.map((att) => (
        <Link
          href={att.file_url}
          target="_blank"
          key={att.id}
          style={{
            cursor: "pointer",
            width: "100%",
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Tooltip
            key={att.id}
            content={att.original_filename}
            contentProps={{ maxW: "240px" }}
          >
            <VStack
              gap={2}
              justify="center"
              align="center"
              bg="#FAFAFA"
              p={2}
              h="162px"
              w="100%"
              borderRadius="md"
              borderWidth="1px"
              borderColor="#E4E4E7"
              maxW={{ base: "160px", md: "198px" }}
              minW={0}
              cursor="default"
            >
              <Image
                src="/assets/file.png"
                alt={att.original_filename}
                width={53}
                height={93}
                style={{
                  objectFit: "cover",
                  borderRadius: "md",
                }}
              />
              <Text
                fontSize="xs"
                color="black"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                w="100%"
                minW={0}
                textAlign="center"
              >
                {att.original_filename}
              </Text>
              <Text
                fontSize="xs"
                color="#71717A"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                w="100%"
                minW={0}
                textAlign="center"
              >
                {att.file_size}
              </Text>
            </VStack>
          </Tooltip>
        </Link>
      ))}
    </VStack>
  );
}

interface MessageActionsMenuProps {
  isMine: boolean;
  showActions: boolean;
  isSinglePane: boolean | undefined;
  onCopy: () => void;
  isCopied: boolean;
  showCopy: boolean;
  profileType: "coordinator" | "organisation" | "student";
  onMessageClick: () => void;
  onCloseActions: () => void;
  onReply?: () => void;
}

function MessageActionsMenu({
  isMine,
  showActions,
  isSinglePane,
  onCopy,
  isCopied,
  showCopy,
  profileType,
  onMessageClick,
  onCloseActions,
  onReply,
}: MessageActionsMenuProps) {
  return (
    <HStack
      justifyContent={isMine ? "flex-end" : "flex-start"}
      opacity={showActions ? 1 : 0}
      transition="opacity 0.15s ease"
      flexShrink={0}
    >
      <MenuPopover
        variant={isSinglePane ? "drawer" : "popover"}
        title="Message actions"
        open={isSinglePane ? showActions : undefined}
        placement={isMine ? "left-start" : "right-start"}
        onOpenChange={isSinglePane ? (v) => !v && onCloseActions() : undefined}
        trigger={
          <IconButton
            variant="ghost"
            minW="fit-content"
            h="fit-content"
            aria-label="Message actions"
            onClick={isSinglePane ? onMessageClick : undefined}
          >
            <MoreHorizontal size={16} color={isMine ? "#1679AB" : "#4B5563"} />
          </IconButton>
        }
      >
        {onReply && (
          <ButtonV2
            variant="ghost"
            minW="fit-content"
            h="fit-content"
            display="flex"
            alignItems="start"
            justifyContent="start"
            aria-label="Reply to message"
            px={2}
            py={0}
            color="black"
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
            gap={2}
            cursor="pointer"
            onClick={onReply}
          >
            <Text fontSize="sm">Reply</Text>
          </ButtonV2>
        )}
        {showCopy && (
          <ButtonV2
            variant="ghost"
            minW="fit-content"
            h="fit-content"
            display="flex"
            alignItems="start"
            justifyContent="start"
            aria-label="Copy message"
            px={2}
            py={0}
            color="black"
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
            onClick={onCopy}
          >
            {isCopied ? (
              <Text fontSize="sm" fontWeight="semibold" color="profile.500">
                Copied
              </Text>
            ) : (
              <Text fontSize="sm">Copy</Text>
            )}
          </ButtonV2>
        )}
        <Box mt={1} borderTopWidth="1px" borderTopColor="#E4E4E7" />
        <HStack gap={2} cursor="pointer" px={2} py={1}>
          <Text fontSize="sm" color="red.500">
            Delete message
          </Text>
        </HStack>
      </MenuPopover>
    </HStack>
  );
}
