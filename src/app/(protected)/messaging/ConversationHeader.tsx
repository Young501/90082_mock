"use client";

import React, { useState } from "react";
import { Box, HStack, VStack, Text, IconButton, Tag } from "@chakra-ui/react";
import { MenuPopover } from "@/components/ui/MenuPopover";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { FullProfileCard } from "@/app/(protected)/discover/cards/FullProfileCard";
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
  const [showProfile, setShowProfile] = useState(false);
  const otherProfileType: "student" | "organisation" =
    conversation.otherOrganisationId != null ? "organisation" : "student";
  const isCoordinatorView = profileType === "coordinator";
  const otherProfileId =
    otherProfileType === "organisation"
      ? conversation?.otherOrganisationId
      : conversation?.otherUserId;

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
        cursor={otherProfileId ? "pointer" : "default"}
        onClick={() => {
          if (otherProfileId) setShowProfile(true);
        }}
        borderRadius="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontWeight="semibold"
        flexShrink={0}
        position="relative"
        w="fit-content"
      >
        <ProfileAvatar
          src={
            profileType === "organisation"
              ? (conversation?.avatar ?? undefined)
              : (conversation?.organisationLogo ?? undefined)
          }
          alt={
            profileType === "organisation"
              ? conversation?.studentTitle
              : (conversation?.organisationTitle ?? undefined)
          }
          fallback={
            profileType === "organisation"
              ? conversation?.studentTitle
              : (conversation?.organisationTitle ?? undefined)
          }
          size="md"
        />
        {profileType !== "organisation" && (
          <Box
            position="absolute"
            right={-1}
            bottom={-1}
            borderRadius="6px"
            overflow="hidden"
            boxShadow="0 0 0 2px white"
          >
            <ProfileAvatar
              src={conversation?.avatar ?? undefined}
              alt={conversation?.organisationMemberName ?? undefined}
              fallback={conversation?.organisationMemberName ?? undefined}
              size="20px"
              fallbackFontSize="2xs"
              borderRadius="6px"
            />
          </Box>
        )}
      </Box>
      {showProfile && otherProfileId && (
        <FullProfileCard
          profileId={otherProfileId.toString()}
          profileType={otherProfileType}
          opportunityId={conversation.opportunityId?.toString()}
          onClose={() => setShowProfile(false)}
        />
      )}
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
            conversation?.organisationMemberName && (
              <Text fontSize="xs" truncate color="#2563EB">
                {conversation?.organisationMemberName}
              </Text>
            )}
          {profileType === "student" && conversation?.opportunityTitle && (
            <Tag.Root>
              <Tag.Label fontSize="xs" color="black" truncate>
                {conversation?.opportunityTitle}
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
