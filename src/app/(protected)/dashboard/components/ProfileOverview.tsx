"use client";

import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Avatar,
  Separator,
} from "@chakra-ui/react";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { CircleCheck, CircleCheckBig, Info } from "lucide-react";
import type { HomepageProfile } from "@/types/homepage";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { useAuthStore } from "@/store/authStore";

interface ProfileOverviewProps {
  profile: HomepageProfile;
  userType: string;
}

// TODO: Add STUDENT PROFILE NAME TO API RESPONSE

export function ProfileOverview({ profile, userType }: ProfileOverviewProps) {
  const router = useRouter();
  const { userProfile } = useAuthStore();
  const allItemsCompleted = profile.completion_items?.every(
    (item) => item.completed
  );

  const studentName = `${userProfile?.first_name} ${userProfile?.last_name}`;

  return (
    <Box
      bg="white"
      borderRadius="12px"
      p={{ base: 4, md: 5 }}
      border="1px solid #E4E4E7"
      width="100%"
      minW={0}
      flex={1}
      minH={0}
      overflowY="auto"
      overflowX="hidden"
      display="flex"
      flexDirection="column"
      gap={4}
    >
      <Text fontSize="md" fontWeight="600" color="black">
        Profile Overview
      </Text>

      <VStack gap={6} align="stretch">
        <VStack align="center" gap={2}>
          <Avatar.Root w="60px" h="60px">
            <Avatar.Image
              src={
                userType === "organisation"
                  ? (profile.logo_url ?? "")
                  : (profile.profile_picture_url ?? "")
              }
              alt={
                userType === "organisation"
                  ? profile.organisation_name
                  : profile.name
              }
            />
            <Avatar.Fallback bg="#E4E4E7" color="black">
              {profile.name?.slice(0, 2).toUpperCase()}
            </Avatar.Fallback>
          </Avatar.Root>
          <VStack gap={1} align="center" w="100%" minW={0}>
            <Text fontSize="md" fontWeight="600" textAlign="center">
              {userType === "organisation"
                ? profile.organisation_name
                : studentName}
            </Text>

            {userType === "student" && (
              <Box w="100%" minW={0} overflow="hidden" alignSelf="stretch">
                <HStack gap={2} align="center" justify="center" py={0.5}>
                  {profile.course_name && (
                    <Tooltip content={profile.course_name}>
                      <Box
                        minW={0}
                        maxW="200px"
                        flexShrink={1}
                        overflow="hidden"
                        cursor="default"
                      >
                        <Text
                          fontSize="xs"
                          color="#52525B"
                          truncate
                          display="block"
                        >
                          {profile.course_name}
                        </Text>
                      </Box>
                    </Tooltip>
                  )}
                  {profile.course_name && profile.course_progression && (
                    <Separator
                      orientation="vertical"
                      height="4"
                      flexShrink={0}
                    />
                  )}
                  {profile.course_progression && (
                    <Tooltip content={profile.course_progression}>
                      <Box
                        minW={0}
                        maxW="200px"
                        flexShrink={1}
                        overflow="hidden"
                        cursor="default"
                      >
                        <Text
                          fontSize="xs"
                          color="#52525B"
                          truncate
                          display="block"
                        >
                          {profile.course_progression}
                        </Text>
                      </Box>
                    </Tooltip>
                  )}
                </HStack>
              </Box>
            )}

            {userType === "organisation" && profile.abn && (
              <Text fontSize="xs" color="#52525B">
                {profile.abn}
              </Text>
            )}
          </VStack>
        </VStack>

        {profile.skills && profile.skills.length > 0 && (
          <VStack align="stretch" gap={2}>
            <Text fontSize="sm" fontWeight="500" color="#52525B">
              Skills
            </Text>
            <HStack gap={2} flexWrap="wrap">
              {profile.skills.slice(0, 2).map((skill, index) => (
                <Box
                  key={index}
                  bg="#F3E8FF"
                  color="#641BA3"
                  borderRadius="4px"
                  py={1.5}
                  px={2}
                  fontSize="2xs"
                  fontWeight="400"
                  boxShadow="0px 0px 1px 0px #641BA3 inset"
                >
                  {skill}
                </Box>
              ))}
              {profile.skills.length > 2 && (
                <Tooltip
                  content={profile.skills.join(", ")}
                  positioning={{ placement: "top", offset: { mainAxis: 8 } }}
                >
                  <Box
                    as="span"
                    bg="#F3E8FF"
                    color="#641BA3"
                    borderRadius="4px"
                    py={1.5}
                    px={2}
                    fontSize="2xs"
                    fontWeight="400"
                    boxShadow="0px 0px 1px 0px #641BA3 inset"
                    cursor="pointer"
                  >
                    +{profile.skills.length - 2} more
                  </Box>
                </Tooltip>
              )}
            </HStack>
          </VStack>
        )}

        <VStack align="stretch" gap={2}>
          {userType === "organisation" && (
            <Text fontSize="sm" fontWeight="500" color="#52525B" mb={2.5}>
              Profile status
            </Text>
          )}
          {profile.completion_items && profile.completion_items.map((item) => (
            <HStack key={item.key} gap={3}>
              <CircleCheck
                size={20}
                color={item.completed ? "#16A34A" : "#E4E4E7"}
                style={{ flexShrink: 0 }}
              />
              <Text
                fontSize="sm"
                color="#52525B"
                // opacity={item.completed ? 1 : 0.7}
              >
                {item.label}
              </Text>
            </HStack>
          ))}
        </VStack>

        {!allItemsCompleted && (
          <HStack
            gap={2}
            align="start"
            fontSize="xs"
            bg="#FAFAFA"
            boxShadow="0px 0px 0px 1px var(--graymuted) inset"
            p={3}
            borderRadius="8px"
            border="1px solid #E4E4E7"
            // justifyContent="start"
          >
            <Box
              w="fit-content"
              h="fit-content"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Info size={16} color="black" fontWeight="bold" />
            </Box>
            <Text fontSize="xs" color="#000000">
              Complete your profile to get better job matches and increase your
              visibility to recruiters.
            </Text>
          </HStack>
        )}
      </VStack>

      <ButtonV2
        width="100%"
        mt="auto"
        bg={
          userType === "organisation"
            ? allItemsCompleted
              ? "#E9F7F6"
              : "#3AADA8"
            : allItemsCompleted
              ? "#EAF6FD"
              : "#2AA8E0"
        }
        color={
          userType === "organisation"
            ? allItemsCompleted
              ? "#1F7F7B"
              : "#FFFFFF"
            : allItemsCompleted
              ? "#1679AB"
              : "#FFFFFF"
        }
        h="36px"
        border={
          userType === "organisation"
            ? allItemsCompleted
              ? "1px solid #D3EFEA"
              : "1px solid #3AADA8"
            : allItemsCompleted
              ? "1px solid #D6EDFB"
              : "1px solid #2AA8E0"
        }
        size="sm"
        // _hover={{ bg: "profile.500", opacity: 0.9 }}
        onClick={() => router.push("/profile/")}
      >
        {allItemsCompleted ? "Edit Profile" : "Complete Profile"}
      </ButtonV2>
    </Box>
  );
}
