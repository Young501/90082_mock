"use client";

import React from "react";
import { Box, VStack, HStack, Text, Image, Flex } from "@chakra-ui/react";
import Link from "next/link";
import type { HomepageTeamMember } from "@/types/homepage";

interface TeamMembersProps {
  members?: HomepageTeamMember[];
}

function formatMemberSince(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return `Member since ${date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

export function TeamMembers({ members = [] }: TeamMembersProps) {
  return (
    <Box
      bg="white"
      borderRadius="12px"
      p={{ base: 4, md: 5 }}
      border="1px solid #E4E4E7"
      width="100%"
      h="100%"
      overflow="auto"
      display="flex"
      flexDirection="column"
      gap={4}
    >
      <HStack justify="space-between" align="center">
        <Text fontSize="md" fontWeight="600" color="black">
          Team Members
        </Text>
        {members.length > 0 && (
          <Link
            href="/profile/"
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--profile-500)",
            }}
          >
            View all
          </Link>
        )}
      </HStack>

      <VStack align="stretch" gap={3}>
        {members.length === 0 ? (
          <Text color="gray.600" fontSize="sm">
            No team members to display.
          </Text>
        ) : (
          members.slice(0, 4).map((member) => (
            <HStack
              key={member.id}
              gap={3}
              p={3}
              borderRadius="xl"
              _hover={{ bg: "border.100" }}
              transition="background 0.2s"
              align="flex-start"
            >
              <Box
                w={10}
                h={10}
                borderRadius="full"
                overflow="hidden"
                flexShrink={0}
                bg="profile.500"
              >
                {member.profile_picture_url ? (
                  <Image
                    src={member.profile_picture_url}
                    alt={member.full_name}
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
                    {member.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </Flex>
                )}
              </Box>
              <VStack align="stretch" gap={0} flex={1} minW={0}>
                <HStack gap={2} flexWrap="wrap">
                  <Text fontSize="sm" fontWeight="600" color="gray.800">
                    {member.full_name}
                  </Text>
                  {member.role && (
                    <Box
                      px={2}
                      py={0.5}
                      borderRadius="md"
                      bg="profile.500"
                      color="white"
                      fontSize="xs"
                      fontWeight="600"
                    >
                      {member.role}
                    </Box>
                  )}
                </HStack>
                <Text fontSize="xs" color="gray.600">
                  {member.email}
                </Text>
                {member.job_title && (
                  <Text fontSize="xs" color="gray.500">
                    {member.job_title}
                  </Text>
                )}
                {member.member_since && (
                  <Text fontSize="xs" color="gray.400">
                    {formatMemberSince(member.member_since)}
                  </Text>
                )}
              </VStack>
            </HStack>
          ))
        )}
      </VStack>
    </Box>
  );
}
