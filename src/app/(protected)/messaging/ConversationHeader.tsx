"use client";

import React from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  IconButton,
  Avatar,
  Tag,
} from "@chakra-ui/react";
import { MenuPopover } from "@/components/ui/MenuPopover";
import { ConversationId, ConversationSummary } from "@/types/messaging";
import { ChevronLeft, EllipsisVertical, Search } from "lucide-react";

export interface ConversationHeaderProps {
  conversation: ConversationSummary;
  isSinglePane: boolean | undefined;
  profileType: "coordinator" | "organisation" | "student";
  onBackToList: () => void;
  onToggleArchive: (id: ConversationId) => void;
}

export const ConversationHeader = ({
  conversation,
  isSinglePane,
  profileType,
  onBackToList,
  onToggleArchive,
}: ConversationHeaderProps) => {
  return (
    <HStack
      px={{ base: 3, md: 4 }}
      py={3}
      borderBottomWidth="1px"
      borderColor="#E4E4E7"
      alignItems="center"
      gap={{ base: 2, md: 3 }}
      h="fit-content"
    >
      {isSinglePane && (
        <IconButton
          aria-label="back"
          variant="ghost"
          minW="fit-content"
          h="fit-content"
          onClick={onBackToList}
        >
          <ChevronLeft size={20} />
        </IconButton>
      )}
      <Box
        w="32px"
        h="32px"
        borderRadius="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontWeight="semibold"
        flexShrink={0}
      >
        {conversation?.avatar && profileType === "organisation" ? (
          <Avatar.Root size="sm">
            <Avatar.Image
              src={conversation?.avatar ?? ""}
              alt={conversation?.studentTitle}
              w="32px"
              h="32px"
            />
            <Avatar.Fallback bg="#E4E4E7" color="black">
              {conversation?.studentTitle.slice(0, 2).toUpperCase()}
            </Avatar.Fallback>
          </Avatar.Root>
        ) : (
          <Avatar.Root size="sm">
            <Avatar.Image
              src={conversation?.avatar ?? ""}
              alt={conversation?.organisationTitle ?? ""}
              w="32px"
              h="32px"
            />
            <Avatar.Fallback bg="#E4E4E7" color="black">
              {conversation?.organisationTitle?.slice(0, 2).toUpperCase()}
            </Avatar.Fallback>
          </Avatar.Root>
        )}
      </Box>
      <VStack align="flex-start" gap={0} flex={1} minW={0}>
        <Text fontWeight="semibold" color="black" fontSize="sm" truncate>
          {profileType === "organisation"
            ? conversation?.studentTitle
            : conversation?.organisationTitle}
        </Text>
        <HStack flexWrap="wrap">
          {profileType === "organisation" && conversation?.studentSubtitle && (
            <Tag.Root>
              <Tag.Label fontSize="xs" color="black" truncate>
                {conversation?.studentSubtitle}
              </Tag.Label>
            </Tag.Root>
          )}
          {profileType === "student" &&
            conversation?.organisationSubtitle && (
              <Tag.Root>
                <Tag.Label fontSize="xs" color="black" truncate>
                  {conversation?.organisationSubtitle}
                </Tag.Label>
              </Tag.Root>
            )}
        </HStack>
      </VStack>

      <HStack>
        <IconButton
          aria-label="Search"
          variant="ghost"
          minW="fit-content"
          h="fit-content"
        >
          <Search size={20} color="#71717A" />
        </IconButton>

        <MenuPopover
          trigger={
            <IconButton
              variant="ghost"
              minW="fit-content"
              aria-label="Conversation options"
              h="fit-content"
              onClick={(e) => e.stopPropagation()}
            >
              <EllipsisVertical size={20} color="#71717A" />
            </IconButton>
          }
          placement="bottom-start"
        >
          <HStack
            gap={2}
            cursor="pointer"
            px={2}
            py={1}
            borderRadius="md"
            _hover={{ bg: "#F4F4F5" }}
            onClick={(e) => {
              e.stopPropagation();
              if (conversation?.id != null) onToggleArchive(conversation.id);
            }}
          >
            <Text fontSize="sm" color="#111827">
              {conversation?.isArchived ? "Unarchive chat" : "Archive chat"}
            </Text>
          </HStack>
        </MenuPopover>
      </HStack>
    </HStack>
  );
};
