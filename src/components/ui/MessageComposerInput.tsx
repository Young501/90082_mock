"use client";

import {
  Box,
  Textarea,
  type TextareaProps as ChakraTextareaProps,
  VStack,
  HStack,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { Paperclip, FileText, Images } from "lucide-react";
import { useEffect, useRef } from "react";
import { MenuPopover } from "./MenuPopover";

export interface MessageComposerInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  attachmentDrawer?: boolean;
  attachmentOpen?: boolean;
  onAttachmentOpenChange?: (open: boolean) => void;
  onFilesSelected?: (files: File[]) => void;
  inputProps?: Omit<
    ChakraTextareaProps,
    "value" | "onChange" | "placeholder" | "onKeyDown"
  >;
  paddingX?: number;
  paddingY?: number;
}

const defaultAttachmentOptions = (
  onOptionSelect?: () => void,
  onFileSelect?: (files: File[]) => void,
  fileInputRef?: React.RefObject<HTMLInputElement | null>
) => (
  <VStack align="stretch" gap={2}>
    <input
      ref={fileInputRef}
      type="file"
      multiple
      accept=".csv,.docx,.gif,.jpeg,.jpg,.odp,.ods,.odt,.pdf,.png,.pptx,.txt,.webp,.xlsx"
      style={{ display: "none" }}
      onChange={(e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0 && onFileSelect) {
          onFileSelect(files);
        }
        if (fileInputRef?.current) {
          fileInputRef.current.value = "";
        }
        onOptionSelect?.();
      }}
    />
    <HStack
      gap={1.5}
      cursor="pointer"
      px={2}
      py={1.5}
      onClick={() => {
        fileInputRef?.current?.click();
      }}
    >
      <Box
        borderRadius="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="fit-content"
        w="fit-content"
      >
        <FileText size={16} color="black" />
      </Box>
      <Text fontSize="sm" color="#111827">
        Documents
      </Text>
    </HStack>
    <HStack
      gap={1.5}
      cursor="pointer"
      px={2}
      py={1.5}
      onClick={() => {
        fileInputRef?.current?.click();
      }}
    >
      <Box
        borderRadius="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="fit-content"
        w="fit-content"
      >
        <Images size={16} color="black" />
      </Box>
      <Text fontSize="sm" color="#111827">
        Photos
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
  onFilesSelected,
  inputProps,
  paddingX = 4,
  paddingY = 2,
}: MessageComposerInputProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const closeAttachment = () =>
    attachmentDrawer && onAttachmentOpenChange?.(false);

  const MIN_ROWS = 1;
  const MAX_HEIGHT = 160;

  useEffect(() => {
    const expandedTextarea = textareaRef.current;
    if (expandedTextarea) {
      expandedTextarea.style.height = "auto";
      expandedTextarea.style.height = `${Math.min(expandedTextarea.scrollHeight, MAX_HEIGHT)}px`;
    }
  }, [value]);

  return (
    <Box
      flex={1}
      minW={0}
      borderRadius="xl"
      borderWidth="1px"
      borderColor="#D4D4D8"
      bg="white"
      px={paddingX}
      minH="40px"
      py={paddingY}
      display="flex"
      alignItems="center"
      gap={2}
    >
      <Textarea
        ref={textareaRef}
        {...inputProps}
        flex={1}
        minW={0}
        border="none"
        outline="none"
        background="transparent"
        fontSize="sm"
        px={0}
        py={0}
        pr={2}
        resize="none"
        rows={MIN_ROWS}
        minH="24px"
        overflow="auto"
        overflowAnchor="none"
        color="#111827"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        _placeholder={{ color: "#A1A1AA" }}
        _focusVisible={{ boxShadow: "none" }}
        css={{
          scrollbarWidth: "thin",
          scrollbarColor: "#A1A1AA transparent",
          "&::-webkit-scrollbar": { width: "2px" },
          "&::-webkit-scrollbar-thumb": {
            background: "#A1A1AA",
            borderRadius: "2px",
          },
          "&::-webkit-scrollbar-track": { background: "transparent" },
        }}
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
            alignSelf="flex-end"
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
        {defaultAttachmentOptions(
          closeAttachment,
          onFilesSelected,
          fileInputRef
        )}
      </MenuPopover>
    </Box>
  );
}
