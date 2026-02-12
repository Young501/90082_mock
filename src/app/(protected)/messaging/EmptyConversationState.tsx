"use client";

import React from "react";
import { Box, Flex, HStack, VStack, Text, IconButton } from "@chakra-ui/react";
import IconUserPlaceholder from "@/components/Icons/IconUserPlaceholder";
import { ChevronLeft } from "lucide-react";

export interface EmptyConversationStateProps {
  isSinglePane: boolean | undefined;
  onBackToList: () => void;
}

export const EmptyConversationState = ({
  isSinglePane,
  onBackToList,
}: EmptyConversationStateProps) => {
  return (
    <Box
      w="100%"
      borderRadius="xl"
      borderWidth={{ base: "0px", lg: "1px" }}
      borderColor={{ base: "transparent", md: "#E4E4E7" }}
      bg="white"
      display="flex"
      flexDirection="column"
      h="100%"
      maxH={{ base: "calc(100vh - 90px)", lg: "calc(100vh - 188px)" }}
    >
      {isSinglePane && (
        <HStack
          px={{ base: 3, md: 4 }}
          py={3}
          borderBottomWidth="1px"
          borderColor="#E4E4E7"
          alignItems="center"
          gap={{ base: 2, md: 3 }}
        >
          <IconButton
            aria-label="back"
            variant="ghost"
            minW="fit-content"
            h="fit-content"
            onClick={onBackToList}
          >
            <ChevronLeft size={20} />
          </IconButton>
          <Text fontWeight="semibold" fontSize="sm" color="black">
            Messages
          </Text>
        </HStack>
      )}

      <Flex flex={1} align="center" justify="center" px={6} py={8}>
        <VStack maxW="360px" textAlign="center" gap={3}>
          <IconUserPlaceholder />
          <Text fontWeight="semibold" fontSize="md">
            Select a conversation to get started
          </Text>
          <Text fontSize="sm" color="gray.600">
            Choose a conversation from the list on the left to view messages
            here. If there are no conversations, start by reaching out to a
            contact.
          </Text>
        </VStack>
      </Flex>
    </Box>
  );
};
