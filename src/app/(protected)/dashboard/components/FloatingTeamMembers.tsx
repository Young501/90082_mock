"use client";

import React, { useState } from "react";
import { Box, HStack, IconButton, Text } from "@chakra-ui/react";
import { ChevronLeft, Users, X } from "lucide-react";
import type { HomepageTeamMember } from "@/types/homepage";
import { TeamMembers } from "./TeamMembers";

interface FloatingTeamMembersProps {
  members?: HomepageTeamMember[];
}

export function FloatingTeamMembers({
  members = [],
}: FloatingTeamMembersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const count = members.length;

  return (
    <>
      <Box
        as="button"
        aria-label={isOpen ? "Hide team members" : "Show team members"}
        position="fixed"
        right={isOpen ? { base: "304px", md: "360px" } : 0}
        top="50%"
        transform="translateY(-50%)"
        zIndex={4998}
        w="42px"
        minH="128px"
        borderLeftRadius="14px"
        borderRightRadius={0}
        bg="white"
        border="1px solid #D3EFEA"
        borderRight="none"
        boxShadow="0 10px 28px rgba(15, 23, 42, 0.12)"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={2}
        color="#1F7F7B"
        transition="right 0.22s ease, background 0.16s ease"
        _hover={{ bg: "#E9F7F6" }}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Users size={18} strokeWidth={1.9} />
        <Text
          fontSize="12px"
          fontWeight="700"
          lineHeight="1"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          Team
        </Text>
        <Box
          w="22px"
          h="22px"
          borderRadius="full"
          bg="#E9F7F6"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="#1F7F7B"
        >
          <ChevronLeft
            size={14}
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.18s ease",
            }}
          />
        </Box>
      </Box>

      <Box
        position="fixed"
        top={{ base: "58px", lg: "76px" }}
        right={0}
        bottom={0}
        w={{ base: "304px", md: "360px" }}
        bg="white"
        borderLeft="1px solid #E4E4E7"
        boxShadow="0 18px 50px rgba(15, 23, 42, 0.16)"
        zIndex={4997}
        transform={isOpen ? "translateX(0)" : "translateX(100%)"}
        transition="transform 0.22s ease"
        display="flex"
        flexDirection="column"
      >
        <HStack
          justify="space-between"
          align="center"
          px={5}
          py={4}
          borderBottom="1px solid #E4E4E7"
          flexShrink={0}
        >
          <Box>
            <Text fontSize="md" fontWeight="800" color="#18181B">
              Team Members
            </Text>
            <Text mt={0.5} fontSize="sm" color="#71717A">
              {count} {count === 1 ? "member" : "members"} with access
            </Text>
          </Box>
          <IconButton
            aria-label="Close team members panel"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <X size={18} />
          </IconButton>
        </HStack>

        <Box p={5} overflowY="auto">
          <TeamMembers members={members} surface="plain" />
        </Box>
      </Box>
    </>
  );
}
