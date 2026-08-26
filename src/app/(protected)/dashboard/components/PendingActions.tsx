"use client";

import React from "react";
import { Badge, Box, HStack, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  Handshake,
  MessageSquareText,
  Users,
} from "lucide-react";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import type { HomepagePendingAction } from "@/types/homepage";
import {
  PROFILE_COLORS,
  PROFILE_DARK_COLORS,
  PROFILE_SECONDARY_COLORS,
  PROFILE_TINT_COLORS,
} from "@/theme/theme";

interface PendingActionsProps {
  actions?: HomepagePendingAction[];
  userType: "organisation" | "student";
  embedded?: boolean;
}

const categoryIcons = {
  match: Handshake,
  profile: CheckCircle2,
  message: MessageSquareText,
  team: Users,
  opportunity: Bell,
} as const;

export function PendingActions({
  actions = [],
  userType,
  embedded = false,
}: PendingActionsProps) {
  const router = useRouter();
  const accent = PROFILE_DARK_COLORS[userType];
  const primary = PROFILE_COLORS[userType];
  const soft = PROFILE_SECONDARY_COLORS[userType];
  const tint = PROFILE_TINT_COLORS[userType];

  const content = (
    <>
      <HStack justify="space-between" align="center">
        <Text fontSize="md" fontWeight="600" color="black">
          Pending Actions
        </Text>
        <Badge
          bg={soft}
          color={accent}
          borderRadius="md"
          px={2}
          py={1}
          fontWeight="600"
        >
          {actions.length} to review
        </Badge>
      </HStack>

      <VStack align="stretch" gap={3}>
        {actions.length === 0 ? (
          <Box border="1px solid #E4E4E7" borderRadius="xl" bg="#FAFBFC" p={4}>
            <Text fontSize="sm" color="#52525B">
              Nothing needs your attention right now.
            </Text>
          </Box>
        ) : (
          actions.map((action) => {
            const Icon = categoryIcons[action.category];

            return (
              <Box
                key={action.id}
                border="1px solid #E4E4E7"
                borderRadius="xl"
                p={3}
                bg={embedded ? "#FAFBFC" : "#FFFFFF"}
              >
                <HStack gap={3} align="flex-start">
                  <Box
                    w="34px"
                    h="34px"
                    borderRadius="10px"
                    bg={soft}
                    color={accent}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Icon size={17} strokeWidth={1.9} />
                  </Box>

                  <VStack align="stretch" gap={2} flex={1} minW={0}>
                    <VStack align="stretch" gap={1}>
                      <HStack gap={2} align="center" flexWrap="wrap">
                        <Text fontSize="sm" fontWeight="700" color="#18181B">
                          {action.title}
                        </Text>
                        {action.priority === "high" && (
                          <Badge
                            bg="#F4F4F5"
                            color="#3F3F46"
                            borderRadius="md"
                            px={1.5}
                            py={0.5}
                            fontWeight="600"
                          >
                            Important
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="sm" color="#52525B" lineHeight="1.45">
                        {action.description}
                      </Text>
                      {action.meta && (
                        <Text fontSize="xs" color="#71717A">
                          {action.meta}
                        </Text>
                      )}
                    </VStack>

                    {embedded ? (
                      <ButtonV2
                        h="30px"
                        px={3}
                        alignSelf="flex-start"
                        bg={action.priority === "high" ? primary : soft}
                        color={action.priority === "high" ? "white" : accent}
                        border={`1px solid ${
                          action.priority === "high" ? primary : tint
                        }`}
                        fontSize="sm"
                        onClick={() => router.push(action.href)}
                      >
                        {action.action_label}
                      </ButtonV2>
                    ) : (
                      <ButtonV2
                        h="32px"
                        px={3}
                        alignSelf="flex-start"
                        bg={action.priority === "high" ? primary : soft}
                        color={action.priority === "high" ? "white" : accent}
                        border={`1px solid ${
                          action.priority === "high" ? primary : tint
                        }`}
                        fontSize="sm"
                        onClick={() => router.push(action.href)}
                      >
                        {action.action_label}
                      </ButtonV2>
                    )}
                  </VStack>
                </HStack>
              </Box>
            );
          })
        )}
      </VStack>
    </>
  );

  if (embedded) {
    return (
      <Box mt={2} pt={4} borderTop="1px solid #E4E4E7">
        <VStack align="stretch" gap={4}>
          {content}
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      bg="white"
      borderRadius="12px"
      p={{ base: 4, md: 5 }}
      border="1px solid #E4E4E7"
      width="100%"
      display="flex"
      flexDirection="column"
      gap={4}
    >
      {content}
    </Box>
  );
}
