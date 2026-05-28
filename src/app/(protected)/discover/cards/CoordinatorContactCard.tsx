"use client";

import React, { useState } from "react";
import { Box, HStack, VStack, Text, Avatar, Button } from "@chakra-ui/react";
import { MessageCircle } from "lucide-react";
import { ContactPage } from "@/components/ContactPage";
import type { OpportunityCoordinator } from "@/types/opportunities";

interface CoordinatorContactCardProps {
  coordinator: OpportunityCoordinator;
  opportunityId: number;
}

export function CoordinatorContactCard({
  coordinator,
  opportunityId,
}: CoordinatorContactCardProps) {
  const [showContact, setShowContact] = useState(false);
  const fullName = `${coordinator.first_name} ${coordinator.last_name}`;

  return (
    <>
      <Box
        w="100%"
        bg="white"
        py={{ base: 4, md: 5 }}
        px={{ base: 4, md: 5 }}
        borderRadius="12px"
        border="1px solid"
        borderColor="#E4E4E7"
      >
        <VStack align="flex-start" gap={4}>
          <Text fontSize="sm" fontWeight="semibold" color="#52525B">
            Have a question?
          </Text>
          <HStack gap={3} w="100%">
            <Avatar.Root size="sm">
              {coordinator.profile_picture_url ? (
                <Avatar.Image
                  src={coordinator.profile_picture_url}
                  alt={fullName}
                />
              ) : null}
              <Avatar.Fallback name={fullName} />
            </Avatar.Root>
            <VStack align="flex-start" gap={0} flex={1}>
              <Text fontSize="sm" fontWeight="semibold" color="#27272A">
                {fullName}
              </Text>
              <Text fontSize="xs" color="#71717A">
                Coordinator
              </Text>
            </VStack>
          </HStack>
          <Button
            w="100%"
            variant="outline"
            size="sm"
            borderColor="#3AADA8"
            color="#3AADA8"
            _hover={{ bg: "#F0FAFA" }}
            borderRadius="xl"
            onClick={() => setShowContact(true)}
          >
            <MessageCircle size={14} style={{ marginRight: "6px" }} />
            Contact Coordinator
          </Button>
        </VStack>
      </Box>

      {showContact && (
        <ContactPage
          recipientId={coordinator.id}
          recipientName={fullName}
          profileType="student"
          acceptedOpportunityId={String(opportunityId)}
          onBack={() => setShowContact(false)}
        />
      )}
    </>
  );
}
