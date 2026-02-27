"use client";

import React from "react";
import {
  Badge,
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react";
import Link from "next/link";
import type { HomepageRecentMessage } from "@/types/homepage";
import { formatRelativeTime } from "@/utils/formatDate";
import { MessageCircleX } from "lucide-react";

interface RecentMessagesProps {
  messages: HomepageRecentMessage[];
  userType: string;
}

const truncateToWords = (text: string, maxWords = 10) => {
  if (!text) return text;
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
};

export function RecentMessages({ messages, userType }: RecentMessagesProps) {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const displayName = (msg: HomepageRecentMessage) =>
    msg.other_user.organisation_name ?? msg.other_user.full_name ?? "Unknown";

  return (
    <Box
      bg="white"
      borderRadius="12px"
      p={{ base: 4, md: 5 }}
      border="1px solid #E4E4E7"
      // width={userType === "student" && !isMobile ? "294px" : "100%"}
      overflow="auto"
      display="flex"
      flexDirection="column"
      gap={4}
      flexShrink={0}
    >
      <HStack justify="space-between" align="center">
        <Text fontSize="md" fontWeight="600" color="black">
          Recent Messages
        </Text>

        {messages.length > 0 && (
          <Link
            href="/messaging/"
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--profile-500)",
            }}
          >
            View all
          </Link>
        )}
      </HStack>

      <VStack align="stretch" gap={3}>
        {messages.length === 0 ? (
          <VStack
            align="center"
            justify="center"
            h="100%"
            gap={4}
            w="100%"
            minH="261px"
          >
            <MessageCircleX size={25} color="#A1A1AA" />
            <Text
              color="black"
              fontSize="md"
              textAlign="center"
              fontWeight="600"
            >
              No conversations yet.
            </Text>
            <Text fontSize="sm" color="#52525B" textAlign="center">
              Once you start a conversation, your messages will appear here.
              Reach out to get the conversation going.
            </Text>
          </VStack>
        ) : (
          messages.slice(0, 4).map((msg) => (
            <Link
              key={msg.id}
              href={`/messaging/?conversation=${msg.id}`}
              style={{ textDecoration: "none" }}
            >
              <HStack gap={3} borderRadius="xl" align="flex-start">
                <Box
                  w={8}
                  h={8}
                  borderRadius="full"
                  overflow="hidden"
                  flexShrink={0}
                  bg="profile.500"
                >
                  {msg.other_user.profile_picture_url ? (
                    <Image
                      src={msg.other_user.profile_picture_url}
                      alt={displayName(msg)}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                    />
                  ) : (
                    <Flex
                      w="100%"
                      h="100%"
                      align="center"
                      justify="center"
                      color="white"
                      fontWeight="600"
                      fontSize="sm"
                    >
                      {displayName(msg).charAt(0)}
                    </Flex>
                  )}
                </Box>
                <VStack
                  align="stretch"
                  justifyContent="flex-start"
                  gap={1}
                  flex={2}
                  minW={0}
                >
                  <HStack
                    justify="space-between"
                    align="center"
                    w="100%"
                    gap={2}
                  >
                    <VStack
                      align="flex-start"
                      justifyContent="flex-start"
                      gap={1}
                      flex={1}
                    >
                      <Text fontSize="sm" fontWeight="600" color="black">
                        {displayName(msg)}
                      </Text>
                      <Text fontSize="xs" color="#52525B" lineHeight="1.4">
                        {truncateToWords(msg.last_message.content)}
                      </Text>
                    </VStack>
                    {msg.unread_count > 0 && (
                      <Badge
                        borderRadius="6px"
                        bg={userType === "organisation" ? "#1F7F7B" : "#1679AB"}
                        color="white"
                        fontSize="10px"
                        textAlign="center"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        px={1}
                        py={0.5}
                        flexShrink={0}
                        minW="20px"
                      >
                        {msg.unread_count}
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="2xs" color="#A1A1AA">
                    {formatRelativeTime(msg.last_message_at)}
                  </Text>
                </VStack>
              </HStack>
            </Link>
          ))
        )}
      </VStack>
    </Box>
  );
}
