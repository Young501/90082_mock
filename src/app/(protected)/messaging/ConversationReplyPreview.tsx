"use client";

import React from "react";
import { Box, HStack, VStack, Text, IconButton } from "@chakra-ui/react";
import { Message } from "@/types/messaging";
import { Paperclip, Reply, X } from "lucide-react";

export interface ConversationReplyPreviewProps {
  replyToMessage: Message | null;
  selectedFiles: File[];
  profileType: "coordinator" | "organisation" | "student";
  onCancelReply: () => void;
  onRemoveFile: (index: number) => void;
}

export const ConversationReplyPreview = ({
  replyToMessage,
  selectedFiles,
  profileType,
  onCancelReply,
  onRemoveFile,
}: ConversationReplyPreviewProps) => {
  if (selectedFiles.length === 0 && !replyToMessage) {
    return null;
  }

  return (
    <Box
      px={{ base: 4, md: 5 }}
      pt={3}
      pb={2}
      borderTopWidth="1px"
      borderColor="#E4E4E7"
    >
      <VStack align="stretch" gap={2}>
        {replyToMessage && (
          <Box
            px={3}
            py={2}
            bg={profileType === "organisation" ? "#14B8A6" : "#EFF6FF"}
            borderRadius="md"
            position="relative"
          >
            <HStack justify="space-between" align="flex-start" gap={2}>
              <VStack align="flex-start" gap={1} flex={1} minW={0}>
                <HStack gap={2}>
                  <Reply
                    size={14}
                    color={
                      profileType === "organisation" ? "#FFFFFF" : "#1679AB"
                    }
                  />
                  <Text
                    fontSize="xs"
                    fontWeight="semibold"
                    color={
                      profileType === "organisation" ? "#FFFFFF" : "#1679AB"
                    }
                  >
                    Replying to{" "}
                    {replyToMessage.sender === "me" ? "yourself" : "message"}
                  </Text>
                </HStack>
                <Text
                  fontSize="sm"
                  color="#111827"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  display="-webkit-box"
                  style={{
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {replyToMessage.text || "Message with attachment"}
                </Text>
              </VStack>
              <IconButton
                aria-label="Cancel reply"
                variant="ghost"
                size="sm"
                minW="fit-content"
                h="fit-content"
                onClick={onCancelReply}
              >
                <X size={16} color="#71717A" />
              </IconButton>
            </HStack>
          </Box>
        )}
        {selectedFiles.map((file, index) => (
          <HStack
            key={`${file.name}-${index}`}
            gap={2}
            px={3}
            py={2}
            bg="#F4F4F5"
            borderRadius="md"
            justify="space-between"
          >
            <HStack gap={2} minW={0} flex={1}>
              <Paperclip size={16} color="#52525B" />
              <Text fontSize="sm" color="#111827" truncate>
                {file.name}
              </Text>
              <Text fontSize="xs" color="#71717A">
                ({(file.size / 1024).toFixed(1)} KB)
              </Text>
            </HStack>
            <IconButton
              aria-label="Remove file"
              variant="ghost"
              size="sm"
              minW="fit-content"
              h="fit-content"
              onClick={() => onRemoveFile(index)}
            >
              <X size={16} color="#71717A" />
            </IconButton>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};
