"use client";

import React from "react";
import { Box, VStack, Text, Portal, Popover } from "@chakra-ui/react";

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

export interface MenuPopoverProps {
  trigger: React.ReactNode;
  title?: string;
  children: React.ReactNode;
  placement?: MenuPopoverPlacement;
  variant?: "popover" | "drawer";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  minW?: string | number;
  contentProps?: Record<string, unknown>;
  maxW?: string | number;
}

const defaultContentStyles = {
  bg: "white",
  borderRadius: "lg",
  boxShadow: "lg",
  borderWidth: "1px",
  borderColor: "gray.100",
  p: 2,
};

const drawerContentStyles = {
  borderRadius: "xl",
  p: 3,
  maxH: "60vh",
  overflowY: "auto" as const,
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

  return (
    <Popover.Root positioning={{ placement }}>
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
