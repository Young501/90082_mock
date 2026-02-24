"use client";

import React from "react";
import {
  Box,
  Text,
  Flex,
  Avatar,
  Button,
  IconButton,
  VStack,
  HStack,
  Separator,
} from "@chakra-ui/react";
import { Copy, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import { ButtonV2 } from "@/components/ui/ButtonV2";

export interface ProfileSummaryCardProps {
  profilePictureUrl?: string | null;
  fullName: string;
  userId?: string;
  email?: string;
  university?: string;
  course?: string;
  yearOfStudy?: string;
  onPreviewProfile?: () => void;
}

function safeString(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value === "string") return value.trim() || undefined;
  if (typeof value === "number") return String(value);
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    if (typeof obj.label === "string") return obj.label.trim() || undefined;
    if (typeof obj.name === "string") return obj.name.trim() || undefined;
  }
  return undefined;
}

export function ProfileSummaryCard({
  profilePictureUrl,
  fullName,
  userId,
  email,
  university,
  course,
  yearOfStudy,
  onPreviewProfile,
}: ProfileSummaryCardProps) {
  const userIdStr = safeString(userId);
  const emailStr = safeString(email);
  const universityStr = safeString(university);
  const courseStr = safeString(course);
  const yearStr = safeString(yearOfStudy);

  const handleCopyUserId = () => {
    if (userIdStr) {
      navigator.clipboard.writeText(userIdStr);
      toast.success("User ID copied to clipboard");
    }
  };

  return (
    <Box
      w="100%"
      bg="white"
      borderRadius="12px"
      border="1px solid"
      borderColor="#E4E4E7"
      p={{ base: "16px", md: "24px" }}
      position="relative"
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "flex-start", md: "flex-start" }}
        justify="space-between"
        gap={6}
      >
        <Avatar.Root
          w="60px"
          h="60px"
          borderRadius="full"
          border="2px solid"
          borderColor="#D6EDFB"
        >
          {profilePictureUrl && (
            <Avatar.Image src={profilePictureUrl} alt={fullName} />
          )}
          <Avatar.Fallback
            name={fullName}
            bg="#F4F4F5"
            color="#71717A"
            fontWeight="600"
            fontSize="xl"
          />
        </Avatar.Root>
        <VStack flex={1} align="stretch" gap={1}>
          <Text fontSize="xl" fontWeight="bold" color="#000000">
            {fullName || "—"}
          </Text>
          <VStack align="stretch" gap={2}>
            {userIdStr && (
              <HStack align="center" gap={2}>
                <Text fontSize="sm" color="#71717A">
                  User ID: {userIdStr}
                </Text>
                <IconButton
                  aria-label="Copy User ID"
                  size="xs"
                  variant="ghost"
                  onClick={handleCopyUserId}
                >
                  <Copy size={14} color="#71717A" />
                </IconButton>
              </HStack>
            )}
            {emailStr && (
              <Text fontSize="sm" color="#71717A">
                {emailStr}
              </Text>
            )}
          </VStack>
          {(universityStr || courseStr || yearStr) && (
            <Flex
              mt={4}
              gap={{ base: 6, md: 8, lg: 10 }}
              flexWrap="wrap"
              align="center"
            >
              {universityStr && (
                <VStack align="stretch" gap={1}>
                  <Text fontSize="sm" color="#A1A1AA">
                    University
                  </Text>
                  <Text fontSize="md" color="#52525B">
                    {universityStr}
                  </Text>
                </VStack>
              )}
              {universityStr && (courseStr || yearStr) && (
                <Separator orientation="vertical" minH="49px" />
              )}
              {courseStr && (
                <VStack align="stretch" gap={1}>
                  <Text fontSize="sm" color="#A1A1AA">
                    Course
                  </Text>
                  <Text fontSize="md" color="#52525B">
                    {courseStr}
                  </Text>
                </VStack>
              )}

              {courseStr && yearStr && (
                <Separator orientation="vertical" minH="49px" />
              )}
              {yearStr && (
                <VStack align="stretch" gap={1}>
                  <Text fontSize="sm" color="#A1A1AA">
                    Year of Study
                  </Text>
                  <Text fontSize="md" color="#52525B">
                    {yearStr}
                  </Text>
                </VStack>
              )}
            </Flex>
          )}
        </VStack>

        {/* {onPreviewProfile && ( */}
        <ButtonV2
          position="absolute"
          right={{ base: 4, md: 6 }}
          top={{ base: 4, md: 6 }}
          icon={<ChevronDown size={16} style={{ marginLeft: 4 }} />}
          variant="secondary"
          h="44px"
          iconPosition="end"
          onClick={onPreviewProfile}
        >
          Preview Profile
        </ButtonV2>
        {/* )} */}
      </Flex>
    </Box>
  );
}
