"use client";

import React from "react";
import { Box, VStack, HStack, Text, Flex } from "@chakra-ui/react";
import { Link } from "@chakra-ui/react";
import Image from "next/image";
import { ExternalLink, Mail } from "lucide-react";
import type { AccessibleOpportunity } from "@/types/opportunities";

interface OpportunityHeaderProps {
  opportunity: AccessibleOpportunity;
}

export function OpportunityHeader({ opportunity }: OpportunityHeaderProps) {
  return (
    <Box
      bg="white"
      borderRadius="12px"
      border="1px solid"
      borderColor="#E4E4E7"
      py={{ base: 4, md: 6 }}
      px={{ base: 4, md: 5 }}
      w="100%"
    >
      <VStack align="flex-start" gap={3}>
        <HStack align="center" gap={{ base: 2, md: 4 }} w="full">
          <Box
            flexShrink={0}
            w={{ base: "36px", md: "60px" }}
            h={{ base: "36px", md: "60px" }}
          >
            {opportunity.logo_url ? (
              <Image
                src={opportunity.logo_url}
                alt={opportunity.title}
                width={60}
                height={60}
                style={{ objectFit: "contain", borderRadius: "8px" }}
              />
            ) : (
              <Image
                src="/assets/opportunityLogoPlaceholder.svg"
                alt="Placeholder"
                width={60}
                height={60}
                style={{ objectFit: "contain" }}
              />
            )}
          </Box>

          <Text
            fontSize={{ base: "md", md: "2xl" }}
            fontWeight="semibold"
            color="black"
            lineHeight="1.2"
          >
            {opportunity.title}
          </Text>
        </HStack>

        {opportunity.description && (
          <Text fontSize="sm" color="black">
            {opportunity.description}
          </Text>
        )}

        {Array.isArray(opportunity.links) && opportunity.links.length > 0 && (
          <Flex flexWrap="wrap" gap={4} align="center" rowGap={1.5}>
            {opportunity.links.map((link, index) => {
              const href = link.url?.trim() ?? "";
              const label = link.label?.trim() ?? href;
              if (!href) return null;
              const isHttp =
                href.startsWith("https://") || href.startsWith("http://");
              const isMailto = href.startsWith("mailto:");
              return (
                <Link
                  key={`${href}-${index}`}
                  href={href}
                  fontSize="sm"
                  color="#52525B"
                  fontWeight="medium"
                  _hover={{ textDecoration: "underline" }}
                  {...(isHttp
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : isMailto
                      ? { target: "_self" }
                      : {})}
                >
                  <HStack gap={2} align="center">
                    {label}
                    {isHttp && (
                      <ExternalLink size={12} strokeWidth={3} color="#71717A" aria-hidden />
                    )}
                    {isMailto && (
                      <Mail size={12} strokeWidth={3} color="#71717A" aria-hidden />
                    )}
                  </HStack>
                </Link>
              );
            })}
          </Flex>
        )}
      </VStack>
    </Box>
  );
}
