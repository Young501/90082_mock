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
  /** Element that opens the menu (e.g. IconButton or Box as="button") */
  trigger: React.ReactNode;
  /** Optional title shown at the top of the content */
  title?: string;
  /** Menu content (action items, etc.) */
  children: React.ReactNode;
  /** Popover placement relative to trigger. Default: "bottom-start" */
  placement?: MenuPopoverPlacement;
  /**
   * "popover" = Chakra Popover (floating panel).
   * "drawer" = bottom sheet + overlay (for mobile/single-pane). Use open + onOpenChange; trigger should call onOpenChange(true) when clicked.
   */
  variant?: "popover" | "drawer";
  /** Required when variant="drawer". Whether the drawer is open. */
  open?: boolean;
  /** Required when variant="drawer". Call onOpenChange(true) from your trigger's onClick to open. */
  onOpenChange?: (open: boolean) => void;
  /** Optional min width for the content (popover only) */
  minW?: string | number;
  /** Optional extra props for the content container */
  contentProps?: Record<string, unknown>;
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

/**
 * Reusable menu popover: trigger + floating panel (or drawer on mobile).
 * Use for message actions, attach, archive chat, filters, etc.
 */
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
