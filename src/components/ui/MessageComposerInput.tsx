"use client";

import {
  Box,
  Input as ChakraInput,
  type InputProps as ChakraInputProps,
  VStack,
  HStack,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { Paperclip } from "lucide-react";
import { MenuPopover } from "./MenuPopover";

export interface MessageComposerInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  attachmentDrawer?: boolean;
  attachmentOpen?: boolean;
  onAttachmentOpenChange?: (open: boolean) => void;
  inputProps?: Omit<
    ChakraInputProps,
    "value" | "onChange" | "placeholder" | "onKeyDown"
  >;
  paddingX?: number;
  paddingY?: number;
}

const defaultAttachmentOptions = (onOptionSelect?: () => void) => (
  <VStack align="stretch" gap={2}>
    <HStack gap={3} cursor="pointer" onClick={onOptionSelect}>
      <Box
        w={8}
        h={8}
        borderRadius="full"
        bg="#EFF6FF"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Paperclip size={16} color="#1679AB" />
      </Box>
      <Text fontSize="sm" color="#111827">
        Share documents
      </Text>
    </HStack>
    <HStack gap={3} cursor="pointer" onClick={onOptionSelect}>
      <Box
        w={8}
        h={8}
        borderRadius="full"
        bg="#EFF6FF"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Paperclip size={16} color="#1F97D1" />
      </Box>
      <Text fontSize="sm" color="#111827">
        Share videos
      </Text>
    </HStack>
    <HStack gap={3} cursor="pointer" onClick={onOptionSelect}>
      <Box
        w={8}
        h={8}
        borderRadius="full"
        bg="#EFF6FF"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Paperclip size={16} color="#1F97D1" />
      </Box>
      <Text fontSize="sm" color="#111827">
        Share photos
      </Text>
    </HStack>
  </VStack>
);

export function MessageComposerInput({
  value,
  onChange,
  placeholder = "Type your message...",
  onKeyDown,
  attachmentDrawer = false,
  attachmentOpen = false,
  onAttachmentOpenChange,
  inputProps,
  paddingX = 4,
  paddingY = 2.5,
}: MessageComposerInputProps) {
  const closeAttachment = () =>
    attachmentDrawer && onAttachmentOpenChange?.(false);

  return (
    <Box
      flex={1}
      minW={0}
      borderRadius="xl"
      borderWidth="1px"
      borderColor="#D4D4D8"
      bg="white"
      px={paddingX}
      h="40px"
      py={paddingY}
      display="flex"
      alignItems="center"
      gap={2}
    >
      <ChakraInput
        {...inputProps}
        flex={1}
        minW={0}
        border="none"
        outline="none"
        background="transparent"
        fontSize="sm"
        px={0}
        py={0}
        color="#111827"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        _placeholder={{ color: "#A1A1AA" }}
      />
      <MenuPopover
        variant={attachmentDrawer ? "drawer" : "popover"}
        placement="top-start"
        title="Attach"
        open={attachmentDrawer ? attachmentOpen : undefined}
        onOpenChange={attachmentDrawer ? onAttachmentOpenChange : undefined}
        trigger={
          <IconButton
            aria-label="Attach file"
            variant="ghost"
            size="sm"
            flexShrink={0}
            onClick={() =>
              attachmentDrawer ? onAttachmentOpenChange?.(true) : undefined
            }
          >
            <Paperclip size={18} color="#52525B" />
          </IconButton>
        }
        contentProps={attachmentDrawer ? { p: 4 } : { p: 3 }}
      >
        {defaultAttachmentOptions(closeAttachment)}
      </MenuPopover>
    </Box>
  );
}
