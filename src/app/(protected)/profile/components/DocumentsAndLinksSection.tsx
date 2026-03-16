"use client";

import React from "react";
import { Box, Text, Flex, Heading, VStack } from "@chakra-ui/react";
import { PenLine, FileText, Link as LinkIcon } from "lucide-react";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { getLinkDisplayText } from "@/utils/formatLink";

export interface DocumentsAndLinksSectionProps {
  profile: Record<string, unknown>;
  onEdit?: () => void;
}

function getResumeDisplayName(url: string): string {
  try {
    const path = new URL(url).pathname;
    const filename = path.split("/").filter(Boolean).pop();
    return filename ? decodeURIComponent(filename) : "CV / Resume";
  } catch {
    return "CV / Resume";
  }
}

function DocLinkEntry({
  label,
  href,
  displayText,
  icon: Icon,
}: {
  label: string;
  href: string;
  displayText: string;
  icon: React.ElementType;
}) {
  const resolvedHref = href.startsWith("http") ? href : `https://${href}`;
  return (
    <VStack align="stretch" gap={2}>
      <Text fontSize="sm" fontWeight="500" color="black">
        {label}
      </Text>
      <Flex
        as="a"
        {...({
          href: resolvedHref,
          target: "_blank",
          rel: "noopener noreferrer",
        } as React.ComponentProps<typeof Flex>)}
        align="center"
        gap={3}
        px={4}
        py={3}
        bg="#F4F4F5"
        borderRadius="4px"
        // _hover={{ textDecoration: "none", bg: "#EEEEEE" }}
      >
        <Icon size={18} color="black" />
        <Text fontSize="sm" color="black" lineClamp={1}>
          {displayText}
        </Text>
      </Flex>
    </VStack>
  );
}

export function DocumentsAndLinksSection({
  profile,
  onEdit,
}: DocumentsAndLinksSectionProps) {
  const resumeUrl = profile.resume_url ?? profile.resume;
  const homepage = profile.homepage;
  const linkedin = profile.linkedin;
  const instagram = profile.instagram;
  const bluesky = profile.bluesky;

  const hasContent = resumeUrl || homepage || linkedin || instagram || bluesky;

  const entries: Array<{
    label: string;
    value: string;
    icon: React.ElementType;
  }> = [];

  if (resumeUrl && typeof resumeUrl === "string") {
    entries.push({
      label: "CV",
      value: resumeUrl,
      icon: FileText,
    });
  }
  if (linkedin && typeof linkedin === "string") {
    entries.push({
      label: "LinkedIn Profile",
      value: linkedin,
      icon: LinkIcon,
    });
  }
  if (homepage && typeof homepage === "string") {
    entries.push({
      label: "Portfolio URL",
      value: homepage,
      icon: LinkIcon,
    });
  }
  if (instagram && typeof instagram === "string") {
    entries.push({
      label: "Instagram",
      value: instagram,
      icon: LinkIcon,
    });
  }
  if (bluesky && typeof bluesky === "string") {
    entries.push({
      label: "Bluesky",
      value: bluesky,
      icon: LinkIcon,
    });
  }

  return (
    <Box
      bg="white"
      borderRadius="12px"
      border="1px solid"
      borderColor="#E4E4E7"
      overflow="hidden"
      boxShadow="0 1px 3px rgba(0,0,0,0.06)"
    >
      <Flex
        justify="space-between"
        align="center"
        p={5}
        borderBottom="1px solid"
        borderColor="#E4E4E7"
      >
        <Heading fontSize="lg" fontWeight="600" color="#18181B">
          Documents & Links
        </Heading>
        {onEdit && (
          <ButtonV2
            size="sm"
            borderRadius="xl"
            variant="ghost"
            border="1px solid"
            borderColor="#D6EDFB"
            px={4}
            py={3}
            fontSize="sm"
            color="#1679AB"
            onClick={onEdit}
          >
            <PenLine size={14} style={{ marginRight: 6 }} color="#1679AB" />
            Edit
          </ButtonV2>
        )}
      </Flex>

      <Box p={5}>
        {!hasContent ? (
          <Text color="#A1A1AA" fontSize="sm">
            No documents or links added yet.
          </Text>
        ) : (
          <VStack align="stretch" gap={6}>
            {entries.map((entry) => (
              <DocLinkEntry
                key={entry.label}
                label={entry.label}
                href={entry.value}
                displayText={
                  entry.label === "CV"
                    ? getResumeDisplayName(entry.value)
                    : getLinkDisplayText(entry.value)
                }
                icon={entry.icon}
              />
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
}
