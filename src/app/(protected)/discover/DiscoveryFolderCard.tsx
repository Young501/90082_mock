"use client";

import React from "react";
import { Box, VStack, HStack, Text, Button } from "@chakra-ui/react";
import {
  IconFolder,
  IconPlus,
  IconFolderSingleTrace,
} from "@/components/Icons";

export interface DiscoveryFolderItem {
  id: string;
  name: string;
  count: number;
}

export interface DiscoveryFolderCardProps {
  folders?: DiscoveryFolderItem[];
  isLoading?: boolean;
  onCreateNewFolder?: () => void;
  onFolderClick?: (folder: DiscoveryFolderItem) => void;
}

export default function DiscoveryFolderCard({
  folders = [],
  isLoading = false,
  onCreateNewFolder,
  onFolderClick,
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
      maxW="261px"
    >
      <VStack align="stretch" gap={4}>
        {/* Header: icon + "My Folder" */}
        <HStack gap={2} align="center">
          <Box flexShrink={0} color="#3F3F46">
            <IconFolder color="#3F3F46" />
          </Box>
          <Text fontSize="md" fontWeight="bold" color="#27272A">
            My Folder
          </Text>
        </HStack>

        {/* Create New Folder button */}
        <Button
          variant="outline"
          w="full"
          justifyContent="center"
          gap={2}
          py={3}
          borderRadius="xl"
          borderColor="#D6EDFB"
          borderWidth="1px"
          bg="white"
          color="#1679AB"
          fontWeight="normal"
          fontSize="sm"
          onClick={onCreateNewFolder}
        >
          <IconPlus />
          Create New Folder
        </Button>

        <VStack align="stretch" gap={2}>
          {isLoading ? (
            <Text fontSize="sm" textAlign="center" color="#71717A" py={2}>
              Loading folders...
            </Text>
          ) : folders.length === 0 ? (
            <Text fontSize="sm" textAlign="center" color="#71717A" py={2}>
              No folders yet
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
                bg="#F8F8F8"
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
