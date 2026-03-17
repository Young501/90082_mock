"use client";

import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
} from "@chakra-ui/react";
import {
  IconFolder,
  IconPlus,
  IconFolderSingleTrace,
} from "@/components/Icons";
import { FolderX, X } from "lucide-react";

export interface DiscoveryFolderItem {
  id: string;
  name: string;
  count: number;
  description?: string;
}

export interface DiscoveryFolderCardProps {
  folders?: DiscoveryFolderItem[];
  isLoading?: boolean;
  inDrawer?: boolean;
  selectedFolderId?: string | null;
  onClearFolder?: () => void;
  onCreateNewFolder?: () => void;
  onFolderClick?: (folder: DiscoveryFolderItem) => void;
  onClose?: () => void;
}

export default function DiscoveryFolderCard({
  folders = [],
  isLoading = false,
  inDrawer = false,
  selectedFolderId = null,
  onClearFolder,
  onCreateNewFolder,
  onFolderClick,
  onClose,
}: DiscoveryFolderCardProps) {
  return (
    <Box
      bg="white"
      borderRadius="xl"
      p={5}
      borderWidth="1px"
      borderColor="#E4E4E7"
      h="fit-content"
      w="100%"
      minW={inDrawer ? "none" : "261px"}
    >
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between" align="center">
          <HStack gap={2} align="center">
            <Box flexShrink={0} color="#3F3F46">
              <IconFolder color="#3F3F46" />
            </Box>
            <Text fontSize="md" fontWeight="bold" color="#27272A">
              My Folder
            </Text>
          </HStack>

          {inDrawer && (
            <Box position="relative" minH={10} mb={1}>
              <IconButton
                position="absolute"
                top={0}
                right={0}
                aria-label="Close"
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X size={20} color="#52525B" />
              </IconButton>
            </Box>
          )}
        </HStack>

        {folders.length === 0 && (
          <VStack align="center" justify="center" gap={3} py={10}>
            <FolderX size={32} color="#A1A1AA" />
            <Text
              fontSize="md"
              textAlign="center"
              color="black"
              fontWeight="600"
            >
              No folder yet
            </Text>
            <Text fontSize="sm" textAlign="center" color="#52525B">
              Save interesting opportunities into personalised folder.
            </Text>
          </VStack>
        )}

        <Button
          variant="outline"
          w="full"
          justifyContent="center"
          gap={2}
          py={3}
          borderRadius="xl"
          borderColor="border.100"
          borderWidth="1px"
          bg="white"
          color="profile.500"
          fontWeight="normal"
          fontSize="sm"
          onClick={onCreateNewFolder}
        >
          <IconPlus color="var(--profile-500)" />
          Create New Folder
        </Button>

        <VStack align="stretch" gap={2}>
          {isLoading ? (
            <Text fontSize="sm" textAlign="center" color="#71717A" py={2}>
              Loading folders...
            </Text>
          ) : (
            folders.map((folder) => (
              <HStack
                key={folder.id}
                gap={3}
                align="center"
                py={3}
                px={3}
                borderRadius="8px"
                bg={
                  selectedFolderId === folder.id
                    ? "var(--border-100)"
                    : "transparent"
                }
                borderWidth={selectedFolderId === folder.id ? "1px" : 0}
                borderColor={
                  selectedFolderId === folder.id ? "profile.500" : "transparent"
                }
                cursor={onFolderClick ? "pointer" : "default"}
                _hover={onFolderClick ? { bg: "#F0F0F0" } : undefined}
                onClick={() => onFolderClick?.(folder)}
              >
                <Box flexShrink={0} color="#3F3F46">
                  <IconFolderSingleTrace color="#3F3F46" />
                </Box>
                <Text
                  flex={1}
                  fontSize="sm"
                  fontWeight="normal"
                  color="#27272A"
                  truncate
                >
                  {folder.name}
                </Text>
                <Text
                  fontSize="sm"
                  fontWeight="normal"
                  color="#71717A"
                  flexShrink={0}
                >
                  {folder.count}
                </Text>
              </HStack>
            ))
          )}
        </VStack>
      </VStack>
    </Box>
  );
}
