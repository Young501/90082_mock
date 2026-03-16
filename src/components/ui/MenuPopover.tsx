"use client";

import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Portal,
  Popover,
} from "@chakra-ui/react";

export type MenuPopoverPlacement =
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

export interface MenuPopoverProps {
  trigger: React.ReactNode;
  title?: string;
  children?: React.ReactNode;
  placement?: MenuPopoverPlacement;
  variant?: "popover" | "drawer" | "profile";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  minW?: string | number;
  contentProps?: Record<string, unknown>;
  maxW?: string | number;
  profile?: ProfilePopoverData;
  avatarSize?: "sm" | "md" | "lg";
}

const defaultContentStyles = {
  bg: "white",
  borderRadius: "lg",
  boxShadow: "lg",
  borderWidth: "1px",
  borderColor: "gray.100",
  p: 2,
};

const profileContentStyles = {
  bg: "white",
  borderRadius: "lg",
  boxShadow: "lg",
  borderWidth: "1px",
  borderColor: "#E4E4E7",
  p: 3,
  minW: "220px",
  maxW: "280px",
};

const drawerContentStyles = {
  borderRadius: "xl",
  p: 3,
  maxH: "60vh",
  overflowY: "auto" as const,
};

const avatarSizes = {
  sm: { w: "32px", h: "32px" },
  md: { w: "36px", h: "36px" },
  lg: { w: "48px", h: "48px" },
};

export function MenuPopover({
  trigger,
  title,
  children,
  placement = "bottom-start",
  variant = "popover",
  open = false,
  onOpenChange,
  minW,
  contentProps = {},
  maxW = "250px",
  profile,
  avatarSize = "md",
}: MenuPopoverProps) {
  if (variant === "drawer") {
    const isOpen = open ?? false;
    const setIsOpen = onOpenChange ?? (() => {});

    return (
      <>
        {trigger}
        {isOpen && (
          <Portal>
            <Box
              position="fixed"
              inset={0}
              bg="blackAlpha.600"
              zIndex={9998}
              onClick={() => setIsOpen(false)}
              onMouseDown={() => setIsOpen(false)}
              onTouchStart={() => setIsOpen(false)}
            />
            <Box
              position="fixed"
              bottom={4}
              left={4}
              right={4}
              zIndex={9999}
              bg="white"
              {...drawerContentStyles}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              {...contentProps}
            >
              <VStack align="stretch" gap={1}>
                {title && (
                  <Text fontWeight="semibold" fontSize="md" pb={1}>
                    {title}
                  </Text>
                )}
                {children}
              </VStack>
            </Box>
          </Portal>
        )}
      </>
    );
  }

  if (variant === "profile" && profile) {
    const size = avatarSizes[avatarSize];
    return (
      <Popover.Root positioning={{ placement }} closeOnInteractOutside>
        <Popover.Trigger asChild>
          <Box
            cursor="pointer"
            borderRadius="full"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            _hover={{ opacity: 0.9 }}
            _focusVisible={{
              outline: "2px solid",
              outlineColor: "profile.500",
            }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {trigger}
          </Box>
        </Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content {...profileContentStyles}>
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
            </VStack>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    );
  }

  const isControlled = onOpenChange != null;
  const popoverProps = isControlled
    ? {
        open: open ?? false,
        onOpenChange: (details: { open: boolean }) => onOpenChange(details.open),
      }
    : {};

  return (
    <Popover.Root positioning={{ placement }} {...popoverProps}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content
          {...defaultContentStyles}
          minW={minW}
          {...contentProps}
          maxW={maxW}
        >
          <VStack align="stretch" gap={1}>
            {title && (
              <Text fontWeight="semibold" fontSize="sm" pb={title ? 1 : 0}>
                {title}
              </Text>
            )}
            {children}
          </VStack>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}
