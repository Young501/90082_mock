"use client";

import React, { useState } from "react";
import { Box, HStack, VStack, Text, IconButton } from "@chakra-ui/react";
import { MenuPopover } from "@/components/ui/MenuPopover";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { FullProfileCard } from "@/app/(protected)/discover/cards/FullProfileCard";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { Message, MessageAttachment } from "@/types/messaging";
import { formatDateTimeToReadable } from "@/utils/formatDate";
import { ExternalLink, MoreHorizontal, Reply } from "lucide-react";
import Link from "next/link";

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function isLocalUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return hostname === window.location.hostname;
  } catch {
    return false;
  }
}

function renderTextWithLinks(text: string, isMine: boolean) {
  const parts = text.split(URL_REGEX);
  return parts.map((part, i) =>
    /^https?:\/\/[^\s]+$/.test(part) ? (
      <Link
        key={i}
        href={part}
        {...(!isLocalUrl(part) && {
          target: "_blank",
          rel: "noopener noreferrer",
        })}
        style={{
          textDecoration: "underline",
          color: isMine ? "rgba(255,255,255,0.9)" : "#3182ce",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {part}
      </Link>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

export interface MessageBoxProps {
  message: Message;
  isMine: boolean;
  profileType: "student" | "organisation";
  showActions: boolean;
  isSinglePane: boolean | undefined;
  numericUserId: number | undefined;
  opportunityId?: number | null;
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
  opportunityId,
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
    ? "0px 12px 12px 12px"
    : "12px 0px 12px 12px";

  const isAttachmentOnly =
    !message.text?.trim() && (message.attachments?.length ?? 0) > 0;
  const showCopy = !isAttachmentOnly;

  const hasAttachments = !!(
    message.attachments && message.attachments?.length > 0
  );

  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [showSenderProfile, setShowSenderProfile] = useState(false);

  const otherProfileType =
    profileType === "organisation" ? "student" : "organisation";
  const senderProfileId =
    otherProfileType === "organisation"
      ? message.messanger?.organisation_id
      : message.messanger?.id;
  const TRUNCATE_LENGTH = 500;
  const text = message.text ?? "";
  const shouldTruncate = text.length > TRUNCATE_LENGTH;
  const displayText =
    shouldTruncate && !isTextExpanded
      ? text.slice(0, TRUNCATE_LENGTH).trim() + "…"
      : text;

  return (
    <>
      <Box
        key={message.id}
        ref={messageRef}
        display="flex"
        justifyContent={isMine ? "flex-start" : "flex-end"}
        onMouseEnter={onHoverIn}
        onMouseLeave={onHoverOut}
      >
        <Box
          maxW="100%"
          display="flex"
          flexDirection="row"
          gap={1}
          alignItems="center"
          w="100%"
          justifyContent={isMine ? "flex-start" : "flex-end"}
        >
          <VStack gap={1}>
            <HStack alignItems="center" gap={1}>
              <HStack gap={3} align="flex-start">
                {isMine &&
                  (message.messanger ? (
                    <Box
                      cursor="pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSenderProfile(true);
                      }}
                    >
                      <ProfileAvatar
                        src={
                          message.messanger?.profile_picture_url ?? undefined
                        }
                        alt={message.messanger?.full_name ?? undefined}
                        fallback={message.messanger?.full_name ?? "U"}
                        size="52px"
                        borderRadius="8px"
                      />
                    </Box>
                  ) : (
                    <ProfileAvatar
                      fallback="U"
                      size="52px"
                      borderRadius="8px"
                    />
                  ))}
                <VStack gap={1} align={isMine ? "flex-start" : "flex-end"}>
                  {message.messanger?.full_name && (
                    <Text
                      fontSize="xs"
                      fontWeight="500"
                      color="#71717A"
                      alignSelf={isMine ? "flex-start" : "flex-end"}
                    >
                      {isMine ? "You" : message.messanger.full_name}
                    </Text>
                  )}
                  <HStack gap={1}>
                    {!isMine && (
                      <MessageActionsMenu
                        isMine={isMine}
                        showActions={showActions}
                        isSinglePane={isSinglePane}
                        onCopy={onCopy}
                        isCopied={isCopied}
                        showCopy={showCopy}
                        onMessageClick={onMessageClick}
                        onCloseActions={onCloseActions}
                        onReply={() => onReply(message)}
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
                      cursor={isSinglePane ? "pointer" : "default"}
                      onClick={isSinglePane ? onMessageClick : undefined}
                    >
                      {message.replyToPreview && (
                        <ReplyPreview
                          message={message}
                          isMine={isMine}
                          numericUserId={numericUserId}
                          onScrollToMessage={onScrollToMessage}
                        />
                      )}
                      {text && (
                        <VStack align="flex-start" gap={0}>
                          <Text fontSize="sm" whiteSpace="pre-wrap">
                            {renderTextWithLinks(displayText, isMine)}
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
                              _hover={{
                                opacity: 1,
                                textDecoration: "underline",
                              }}
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
                    {isMine && (
                      <MessageActionsMenu
                        isMine={isMine}
                        showActions={showActions}
                        isSinglePane={isSinglePane}
                        onCopy={onCopy}
                        isCopied={isCopied}
                        showCopy={showCopy}
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
                    alignSelf={isMine ? "flex-start" : "flex-end"}
                    fontSize="10px"
                    color="#52525B"
                    textAlign={isMine ? "left" : "right"}
                  >
                    {formatDateTimeToReadable(message.createdAt)}
                  </Text>
                </VStack>
                {!isMine &&
                  (message.messanger ? (
                    <ProfileAvatar
                      src={message.messanger?.profile_picture_url ?? undefined}
                      alt={message.messanger?.full_name ?? undefined}
                      fallback={message.messanger?.full_name ?? "U"}
                      size="52px"
                      borderRadius="8px"
                    />
                  ) : (
                    <ProfileAvatar
                      fallback="U"
                      size="52px"
                      borderRadius="8px"
                    />
                  ))}
              </HStack>
            </HStack>
          </VStack>
        </Box>
      </Box>
      {showSenderProfile && !isMine && message.messanger && senderProfileId && (
        <FullProfileCard
          profileId={senderProfileId.toString()}
          profileType={otherProfileType}
          opportunityId={opportunityId?.toString()}
          onClose={() => setShowSenderProfile(false)}
        />
      )}
    </>
  );
};

interface ReplyPreviewProps {
  message: Message;
  isMine: boolean;
  numericUserId: number | undefined;
  onScrollToMessage: (messageId: string | number) => void;
}

function ReplyPreview({
  message,
  isMine,
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getDocMeta(
  contentType: string,
  filename: string
): { label: string; color: string } {
  const lower = filename.toLowerCase();
  if (contentType.includes("pdf") || lower.endsWith(".pdf"))
    return { label: "PDF", color: "#E53E3E" };
  if (
    contentType.includes("word") ||
    lower.endsWith(".docx") ||
    lower.endsWith(".doc")
  )
    return { label: "DOC", color: "#3182CE" };
  if (
    contentType.includes("spreadsheet") ||
    contentType.includes("excel") ||
    lower.endsWith(".xlsx") ||
    lower.endsWith(".xls")
  )
    return { label: "XLS", color: "#38A169" };
  if (
    contentType.includes("presentation") ||
    contentType.includes("powerpoint") ||
    lower.endsWith(".pptx") ||
    lower.endsWith(".ppt")
  )
    return { label: "PPT", color: "#DD6B20" };
  if (lower.endsWith(".csv")) return { label: "CSV", color: "#38A169" };
  if (
    contentType.includes("zip") ||
    lower.endsWith(".zip") ||
    lower.endsWith(".rar")
  )
    return { label: "ZIP", color: "#805AD5" };
  if (contentType.startsWith("text/") || lower.endsWith(".txt"))
    return { label: "TXT", color: "#718096" };
  return { label: "FILE", color: "#718096" };
}

function MessageAttachments({
  attachments,
}: {
  attachments: MessageAttachment[];
  isMine: boolean;
}) {
  return (
    <VStack align="stretch" gap={2} mt={2} w="100%">
      {attachments.map((att) => {
        const isImage = att.content_type?.startsWith("image/");

        if (isImage) {
          return (
            <Link
              href={att.file_url}
              target="_blank"
              key={att.id}
              style={{ display: "block" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={att.file_url}
                alt={att.original_filename}
                style={{
                  width: "100%",
                  maxHeight: "220px",
                  objectFit: "cover",
                  display: "block",
                  borderRadius: "8px",
                }}
              />
            </Link>
          );
        }

        const { label, color } = getDocMeta(
          att.content_type,
          att.original_filename
        );
        return (
          <Link
            href={att.file_url}
            target="_blank"
            key={att.id}
            style={{ display: "block", textDecoration: "none" }}
          >
            <HStack
              gap={3}
              bg="#FAFAFA"
              p={3}
              borderRadius="md"
              borderWidth="1px"
              borderColor="#E4E4E7"
              w="100%"
              _hover={{ bg: "#F0F0F0" }}
            >
              <Box
                w="40px"
                h="48px"
                bg={color}
                borderRadius="6px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Text
                  fontSize="9px"
                  fontWeight="bold"
                  color="white"
                  letterSpacing="0.05em"
                >
                  {label}
                </Text>
              </Box>
              <VStack align="flex-start" gap={0} flex={1} minW={0}>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color="black"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  w="100%"
                >
                  {att.original_filename}
                </Text>
                <Text fontSize="xs" color="#71717A">
                  {formatFileSize(att.file_size)}
                </Text>
              </VStack>
              <Box flexShrink={0}>
                <ExternalLink size={14} color="#71717A" />
              </Box>
            </HStack>
          </Link>
        );
      })}
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
