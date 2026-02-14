"use client";

import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Flex,
  Avatar,
  Badge,
  IconButton,
} from "@chakra-ui/react";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { useRouter } from "next/navigation";
import { EllipsisVertical } from "lucide-react";
import type { HomepageOpportunity } from "@/types/homepage";

import Image from "next/image";

interface MyOpportunitiesProps {
  opportunities: HomepageOpportunity[];
  userType: string;
}

// TODO: Add opportunity summary

export function MyOpportunities({
  opportunities,
  userType,
}: MyOpportunitiesProps) {
  const router = useRouter();

  const getStatusLabel = (opp: HomepageOpportunity) => {
    if (opp.visibility_display === "Public") {
      return "Public Opportunity";
    }
    if (opp.visibility_display === "Invite only") {
      return "Invite only";
    }
    return opp.visibility_display ?? "Opportunity";
  };

  const isEnrolled = (opp: HomepageOpportunity) =>
    opp.enrollment_status === "enrolled";

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
      <Text fontSize="md" fontWeight="600" color="black">
        My Opportunities
      </Text>

      <VStack align="stretch" gap={4} w="100%">
        {opportunities.length === 0 ? (
          <Text color="#52525B" fontSize="sm">
            No opportunities yet. Discover opportunities to get started.
          </Text>
        ) : (
          opportunities.map((opp, index) => (
            <VStack
              key={opp.id}
              p={3}
              borderRadius="12px"
              border="1px solid #E4E4E7"
              w="full"
              align="stretch"
              gap={6}
            >
              <HStack align="flex-start" gap={3} flex={1} minW={0}>
                <Box
                  flexShrink={0}
                  w="48px"
                  h="48px"
                  bg="#F4F4F5"
                  borderRadius="16px"
                  p={2}
                >
                  {opp.logo_url ? (
                    <Image
                      src={opp.logo_url as string}
                      alt={opp.title}
                      width={32}
                      height={32}
                    />
                  ) : (
                    <Image
                      src="/assets/opportunityLogoPlaceholder.svg"
                      alt="Placeholder"
                      width={32}
                      height={32}
                      style={{
                        objectFit: "contain",
                      }}
                    />
                  )}
                </Box>

                <VStack align="stretch" gap={1} flex={1} minW={0}>
                  <Text fontSize="md" fontWeight="600" color="gray.800">
                    {opp.title}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {getStatusLabel(opp)}
                  </Text>
                </VStack>

                <HStack gap={4} flexShrink={0}>
                  {" "}
                  {isEnrolled(opp) && (
                    <Badge
                      bg=""
                      // border="1px solid"
                      boxShadow="0px 0px 1px 0px #116932 inset"
                      fontSize={{ base: "xs", md: "sm" }}
                      px={{ base: "6px", md: 3 }}
                      py={{ base: "2px", md: 1 }}
                      borderRadius="4px"
                      fontWeight="normal"
                      color="#116932"
                    >
                      Enrolled
                    </Badge>
                  )}
                  <IconButton
                    aria-label="More options"
                    variant="ghost"
                    w="fit-content"
                    h="fit-content"
                  >
                    <EllipsisVertical size={20} color="#52525B" />
                  </IconButton>
                </HStack>
              </HStack>
              <HStack gap={2} flexShrink={0} w="full" align="stretch">
                {/* {MISSING OPPORTUNITY SUMMARY} */}
                <ButtonV2
                  bg={
                    userType === "organisation"
                      ? isEnrolled(opp)
                        ? "#E9F7F6"
                        : "#3AADA8"
                      : isEnrolled(opp)
                        ? "#EAF6FD"
                        : "#2AA8E0"
                  }
                  w="full"
                  color={
                    userType === "organisation"
                      ? isEnrolled(opp)
                        ? "#1F7F7B"
                        : "#FFFFFF"
                      : isEnrolled(opp)
                        ? "#1679AB"
                        : "#FFFFFF"
                  }
                  h="36px"
                  border={
                    userType === "organisation"
                      ? isEnrolled(opp)
                        ? "1px solid #D3EFEA"
                        : "1px solid #3AADA8"
                      : isEnrolled(opp)
                        ? "1px solid #D6EDFB"
                        : "1px solid #2AA8E0"
                  }
                  size="sm"
                  onClick={() => router.push(`/discover/?opp=${opp.slug}`)}
                >
                  {isEnrolled(opp) ? "Explore Opportunity" : "Enroll"}
                </ButtonV2>
              </HStack>
            </VStack>
          ))
        )}
      </VStack>
    </Box>
  );
}
