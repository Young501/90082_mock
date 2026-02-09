"use client";

import React from "react";
import { Box, VStack, Text } from "@chakra-ui/react";
import { MessageCircleX } from "lucide-react";

export const EmptyInbox = () => {
  return (
    <VStack
      h="100%"
      align="center"
      justify="center"
      gap={6}
      py={16}
      px={4}
      w="100%"
      maxW="374px"
    >
      <Box display="flex" alignItems="center" justifyContent="center">
        <MessageCircleX size={32} color="#52525B" />
      </Box>
      <Text fontWeight="semibold" fontSize="lg">
        No conversations yet
      </Text>
      <Text fontSize="sm" color="#52525B" textAlign="center" maxW="310px">
        When you start messaging organisations, your conversations will appear
        here.
      </Text>
    </VStack>
  );
};
