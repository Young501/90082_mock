import { Opportunity, AccessibleOpportunity } from "@/types/opportunities";
import React from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Link,
} from "@chakra-ui/react";
import { ExternalLink, MoreVertical } from "lucide-react";
import IconMoreEllipsis from "@/components/Icons/IconMoreEllipsis";
import Image from "next/image";
import IconExternalLink from "@/components/Icons/IconExternalLink";

interface OpportunityDescriptionCardProps {
  opportunity: Opportunity | AccessibleOpportunity;
  currentOpportunity?: AccessibleOpportunity | null;
  links?: Array<{ label: string; url: string }>;
}

export const OpportunityDescriptionCard = ({
  opportunity,
  currentOpportunity,
  links = [],
}: OpportunityDescriptionCardProps) => {
  const accessibleOpportunity =
    currentOpportunity || (opportunity as AccessibleOpportunity);
  const enrollmentStatus =
    accessibleOpportunity?.enrollment_status ||
    (currentOpportunity?.is_enrolled ? "enrolled" : "not_enrolled");

  const visibilityDisplay =
    accessibleOpportunity?.visibility_display || "Public Opportunity";

  const isEnrolled = enrollmentStatus === "enrolled";

  return (
    <Box
      bg="white"
      borderRadius="12px"
      border="1px solid"
      borderColor="#E4E4E7"
      py={{ base: 4, md: 6 }}
      px={{ base: 4, md: 5 }}
      maxW="100%"
      w="100%"
    >
      <VStack align="flex-start" gap={3}>
        <HStack align="start" justify="space-between" gap={1} w="full">
          <Flex
            align="flex-start"
            justify="space-between"
            gap={{ base: 2, md: 3 }}
            flex="1"
            minW="0"
          >
            <Box
              flexShrink={0}
              w={{ base: "36px", md: "60px" }}
              h={{ base: "36px", md: "60px" }}
              bg="#F4F4F5"
              borderRadius={{ base: "12px", md: "20px" }}
              p={3}
            >
              {opportunity.logo_url ? (
                <Image
                  src={opportunity.logo_url}
                  alt={opportunity.title}
                  width={36}
                  height={36}
                />
              ) : (
                <Image
                  src="/assets/opportunityLogoPlaceholder.svg"
                  alt="Placeholder"
                  width={36}
                  height={36}
                  style={{
                    objectFit: "contain",
                  }}
                />
              )}
            </Box>

            {/* Title and Type */}
            <VStack
              align="flex-start"
              gap={{ base: 1, md: 2 }}
              flex="1"
              minW="0"
            >
              <Text
                fontSize={{ base: "md", md: "2xl" }}
                fontWeight="semibold"
                color="black"
                lineHeight="1.2"
              >
                {opportunity.title}
              </Text>
              <HStack gap={2} align="center" flexWrap="no-wrap">
                <Text
                  fontSize={{ base: "xs", md: "md" }}
                  color="#1679AB"
                  fontWeight="500"
                >
                  {visibilityDisplay} {""} Opportunity
                </Text>
                <Badge
                  bg="#F4F4F5"
                  color="#27272A"
                  fontSize={{ base: "2xs", md: "xs" }}
                  px={2}
                  py={0.5}
                  borderRadius="4px"
                  fontWeight="normal"
                >
                  Default
                </Badge>
              </HStack>
            </VStack>
          </Flex>

          <HStack gap={2} align="center" flexShrink={0}>
            <Badge
              bg="transparent"
              // border="1px solid"
              boxShadow={
                isEnrolled
                  ? "0px 0px 1px 0px #116932 inset"
                  : "0px 0px 1px 0px #EA580C inset"
              }
              fontSize={{ base: "xs", md: "sm" }}
              px={{ base: "6px", md: 3 }}
              py={{ base: "2px", md: 1 }}
              borderRadius="4px"
              fontWeight="normal"
              color={isEnrolled ? "#116932" : "#EA580C"}
            >
              {isEnrolled ? "Enrolled" : "Pending Enrollment"}
            </Badge>
            <IconButton aria-label="More options" variant="ghost">
              <IconMoreEllipsis color="#52525B" />
            </IconButton>
          </HStack>
        </HStack>
        <HStack>
          {opportunity.description && (
            <Text fontSize="sm" color="black" maxW="788px">
              {opportunity.description}
            </Text>
          )}

          {/* Links Section */}
          {links.length > 0 && (
            <HStack gap={4} flexWrap="wrap">
              {links.map((link, index) => (
                <Box
                  key={index}
                  display="inline-flex"
                  alignItems="center"
                  gap={{ base: 1, md: 2 }}
                >
                  <Link
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="#52525B"
                    fontSize={{ base: "xs", md: "sm" }}
                    fontWeight="medium"
                  >
                    {link.label}
                  </Link>
                  <IconExternalLink />
                </Box>
              ))}
            </HStack>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};
