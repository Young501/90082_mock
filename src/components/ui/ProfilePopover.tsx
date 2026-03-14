"use client";

import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Popover,
} from "@chakra-ui/react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type ProfilePopoverPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

export interface ProfilePopoverData {
  name: string;
  avatarUrl?: string | null;
  subtitle?: string | null;
  organisationLogo?: string | null;
}

export interface ProfilePopoverProps {
  trigger: React.ReactNode;
  profile: ProfilePopoverData;
  viewProfileHref?: string;
  placement?: ProfilePopoverPlacement;
  avatarSize?: "sm" | "md" | "lg";
}

const contentStyles = {
  bg: "white",
  borderRadius: "lg",
  boxShadow: "lg",
  borderWidth: "1px",
  borderColor: "#E4E4E7",
  p: 3,
  minW: "220px",
  maxW: "280px",
};

export function ProfilePopover({
  trigger,
  profile,
  viewProfileHref,
  placement = "bottom-start",
  avatarSize = "md",
}: ProfilePopoverProps) {
  const avatarSizes = {
    sm: { w: "32px", h: "32px" },
    md: { w: "48px", h: "48px" },
    lg: { w: "64px", h: "64px" },
  };
  const size = avatarSizes[avatarSize];

  return (
    <Popover.Root
      positioning={{ placement }}
      closeOnInteractOutside
    >
      <Popover.Trigger asChild>
        <Box
          cursor="pointer"
          borderRadius="full"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          _hover={{ opacity: 0.9 }}
          _focusVisible={{ outline: "2px solid", outlineColor: "profile.500" }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {trigger}
        </Box>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content {...contentStyles}>
          <VStack align="stretch" gap={3}>
            <HStack gap={3} align="flex-start">
              <Avatar.Root size={avatarSize} flexShrink={0}>
                <Avatar.Image
                  src={profile.avatarUrl ?? profile.organisationLogo ?? ""}
                  alt={profile.name}
                  w={size.w}
                  h={size.h}
                />
                <Avatar.Fallback bg="#E4E4E7" color="black">
                  {profile.name.slice(0, 2).toUpperCase()}
                </Avatar.Fallback>
              </Avatar.Root>
              <VStack align="flex-start" gap={0} flex={1} minW={0}>
                <Text
                  fontWeight="semibold"
                  fontSize="sm"
                  color="#18181B"
                  truncate
                  w="100%"
                >
                  {profile.name}
                </Text>
                {profile.subtitle && (
                  <Text
                    fontSize="xs"
                    color="#71717A"
                    truncate
                    w="100%"
                    lineClamp={2}
                  >
                    {profile.subtitle}
                  </Text>
                )}
              </VStack>
            </HStack>
            {viewProfileHref && (
              <Link
                href={viewProfileHref}
                style={{ textDecoration: "none", width: "100%" }}
                onClick={(e) => e.stopPropagation()}
              >
                <HStack
                  gap={2}
                  px={2}
                  py={1.5}
                  borderRadius="md"
                  _hover={{ bg: "#F4F4F5" }}
                  color="profile.500"
                  fontSize="sm"
                  fontWeight="medium"
                >
                  <Text>View profile</Text>
                  <ChevronRight size={14} />
                </HStack>
              </Link>
            )}
          </VStack>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}
