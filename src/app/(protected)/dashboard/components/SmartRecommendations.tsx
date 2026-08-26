"use client";

import React from "react";
import { Badge, Box, HStack, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  Sparkles,
  UserRound,
} from "lucide-react";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import type { HomepageSmartRecommendation } from "@/types/homepage";
import {
  PROFILE_COLORS,
  PROFILE_DARK_COLORS,
  PROFILE_SECONDARY_COLORS,
  PROFILE_TINT_COLORS,
} from "@/theme/theme";

interface SmartRecommendationsProps {
  recommendations?: HomepageSmartRecommendation[];
  userType: "organisation" | "student";
}

function RecommendationGlyph({
  item,
  accent,
  soft,
}: {
  item: HomepageSmartRecommendation;
  accent: string;
  soft: string;
}) {
  if (item.kind === "profile") {
    return (
      <ProfileAvatar
        src={item.image_url || null}
        alt={item.title}
        fallback={item.title}
        size="42px"
        borderRadius="10px"
      />
    );
  }

  const Icon = item.kind === "opportunity" ? BriefcaseBusiness : UserRound;

  return (
    <Box
      w="42px"
      h="42px"
      borderRadius="10px"
      bg={soft}
      color={accent}
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
    >
      <Icon size={20} strokeWidth={1.8} />
    </Box>
  );
}

export function SmartRecommendations({
  recommendations = [],
  userType,
}: SmartRecommendationsProps) {
  const router = useRouter();
  const accent = PROFILE_DARK_COLORS[userType];
  const primary = PROFILE_COLORS[userType];
  const soft = PROFILE_SECONDARY_COLORS[userType];
  const tint = PROFILE_TINT_COLORS[userType];

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
      <HStack justify="space-between" align="center">
        <HStack gap={2}>
          <Text fontSize="md" fontWeight="600" color="black">
            Smart Recommendations
          </Text>
          <Box color={accent} display="flex" alignItems="center">
            <Sparkles size={16} strokeWidth={1.8} />
          </Box>
        </HStack>
      </HStack>

      <VStack align="stretch" gap={3}>
        {recommendations.length === 0 ? (
          <Box border="1px solid #E4E4E7" borderRadius="xl" bg="#FAFBFC" p={4}>
            <Text fontSize="sm" color="#52525B">
              Recommendations will appear after the profile and opportunity
              activity are available.
            </Text>
          </Box>
        ) : (
          recommendations.map((item) => (
            <HStack
              key={item.id}
              gap={3}
              align="stretch"
              border="1px solid #E4E4E7"
              borderRadius="xl"
              p={3}
              bg="#FFFFFF"
            >
              <RecommendationGlyph item={item} accent={accent} soft={soft} />

              <VStack align="stretch" gap={1} flex={1} minW={0}>
                <HStack gap={2} align="center" flexWrap="wrap">
                  <Text fontSize="sm" fontWeight="700" color="#18181B">
                    {item.title}
                  </Text>
                  {item.score && (
                    <Badge
                      bg="#DCFCE7"
                      color="#116932"
                      borderRadius="md"
                      px={1.5}
                      py={0.5}
                      fontWeight="600"
                    >
                      {item.score}
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="sm" color="#52525B" lineHeight="1.45">
                  {item.description}
                </Text>
                <Text fontSize="xs" color="#71717A">
                  {item.reason}
                </Text>
              </VStack>

              <ButtonV2
                h="32px"
                px={3}
                flexShrink={0}
                bg={soft}
                color={accent}
                border={`1px solid ${tint}`}
                fontSize="sm"
                onClick={() => router.push(item.href)}
              >
                <HStack gap={1.5}>
                  <Text>{item.action_label}</Text>
                  <ArrowRight size={14} color={primary} />
                </HStack>
              </ButtonV2>
            </HStack>
          ))
        )}
      </VStack>
    </Box>
  );
}
