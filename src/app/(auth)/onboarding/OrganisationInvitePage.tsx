"use client";

import {
  Box,
  Text,
  VStack,
  Avatar,
  HStack,
  Alert,
  Flex,
  Separator,
} from "@chakra-ui/react";
import { OrganisationInvite as OrganisationInviteType } from "@/types/shared";
import { getInitials } from "@/utils/getInitials";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { TriangleAlert } from "lucide-react";
import { formatDate } from "@/utils/formatDate";

interface OrganisationInvitePageProps {
  invite: OrganisationInviteType;
  onAccept: () => void;
  onDecline: () => void;
  isAccepting: boolean;
  isDeclining: boolean;
}

export const OrganisationInvitePage = ({
  invite,
  onAccept,
  onDecline,
  isAccepting,
  isDeclining,
}: OrganisationInvitePageProps) => {
  const org = invite.organisation;
  const willReplace = invite.will_replace_current_membership === true;
  const currentOrg = invite.current_organisation;
  const visibleMembers = invite?.organisation?.members?.slice(0, 3) ?? [];

  return (
    <>
      <PageTitle title={PAGE_TITLES.ORGANISATION_INVITE} />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        w="100%"
        gap={5}
        maxW="640px"
        mx="auto"
        bg="white"
        borderRadius="4xl"
        px={{ base: 6, md: 12 }}
        py={{ base: 6, md: 8 }}
      >
        <VStack align="flex-start" gap={2} flex={1} minW={0}>
          <Text
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="600"
            color="#18181B"
            textAlign="left"
          >
            You&apos;re invited to join {org.name}
          </Text>

          <Text fontSize={{ base: "15px", md: "16px" }} color="#18181B">
            {invite.invited_by_email} has invited you to join their organisation
            on UniConnected as a {invite.platform_role}.
          </Text>
        </VStack>

        {willReplace && currentOrg?.organisation?.name && (
          <Alert.Root
            status="warning"
            variant="subtle"
            borderRadius="12px"
            border="1px solid"
            borderColor="orange.300"
            bg="orange.50"
            color="orange.800"
            w="100%"
          >
            <Flex gap={3} align="flex-start">
              <TriangleAlert size={20} style={{ flexShrink: 0 }} />
              <VStack align="flex-start" gap={1}>
                <Text fontWeight="600" fontSize="sm">
                  This will replace your current organisation
                </Text>
                <Text fontSize="sm">
                  Accepting will move you out of {currentOrg.organisation.name}. This action
                  cannot be undone.
                </Text>
              </VStack>
            </Flex>
          </Alert.Root>
        )}

        <Box
          bg="white"
          borderRadius="3xl"
          border="1px solid #E4E4E7"
          p={{ base: 4, md: 8 }}
          w="100%"
          display="flex"
          flexDirection="column"
          gap={5}
        >
          <HStack gap={4} align="center">
            <Avatar.Root
              w="64px"
              h="64px"
              minW="64px"
              borderRadius="full"
              overflow="hidden"
              flexShrink={0}
            >
              <Avatar.Image src={org.logo_url || undefined} alt={org.name} />
              <Avatar.Fallback
                bg="#E8F4FD"
                color="#1679AB"
                fontWeight="bold"
                fontSize="20px"
              >
                {getInitials(org.name ?? "", "")}
              </Avatar.Fallback>
            </Avatar.Root>

            <VStack align="flex-start" gap={1.5} flex={1} minW={0}>
              <Text
                fontSize={{ base: "17px", md: "18px" }}
                fontWeight="700"
                color="black"
                lineHeight="1.2"
              >
                {org.name}
              </Text>
              <HStack gap={2} align="center">
                {org.sector && (
                  <Text fontSize="14px" color="#52525B" fontWeight="500">
                    {org.sector}
                  </Text>
                )}

                <Separator orientation="vertical" height="4" />

                {visibleMembers.length > 0 && (
                  <HStack gap={2} align="center">
                    {visibleMembers.length > 0 && (
                      <Flex>
                        {visibleMembers.map((member, i) => (
                          <Avatar.Root
                            key={member.id}
                            w="26px"
                            h="26px"
                            minW="26px"
                            borderRadius="full"
                            overflow="hidden"
                            border="2px solid white"
                            ml={i > 0 ? "-8px" : "0"}
                            zIndex={visibleMembers.length - i}
                          >
                            <Avatar.Image
                              src={member.profile_picture_url ?? undefined}
                              alt={member.full_name}
                            />
                            <Avatar.Fallback
                              bg="#1679AB"
                              color="white"
                              fontSize="9px"
                              fontWeight="600"
                            >
                              {getInitials(member.full_name ?? "", "")}
                            </Avatar.Fallback>
                          </Avatar.Root>
                        ))}
                      </Flex>
                    )}
                    {invite.organisation.members?.length &&
                      invite.organisation.members?.length > 0 && (
                        <Text fontSize="14px" color="#52525B" fontWeight="500">
                          {invite.organisation.members?.length} member
                          {invite.organisation.members?.length !== 1 ? "s" : ""}
                        </Text>
                      )}
                  </HStack>
                )}
              </HStack>

              <Text fontSize="13px" color="#71717A">
                Invitation expires {formatDate(invite.expires_at)}
              </Text>
            </VStack>
          </HStack>

          <VStack gap={3} w="100%">
            <Box
              as="button"
              onClick={onAccept}
              _disabled={{ opacity: 0.7, cursor: "not-allowed" }}
              w="100%"
              bg="#3AADA8"
              color="white"
              borderRadius="12px"
              py={{ base: 3, md: 4 }}
              px={{ base: 4, md: 5 }}
              fontSize={{ base: "md", md: "lg" }}
              fontWeight="600"
              cursor={isAccepting || isDeclining ? "not-allowed" : "pointer"}
              textAlign="center"
              transition="background 0.15s"
              opacity={isAccepting || isDeclining ? 0.7 : 1}
            >
              {isAccepting ? "Accepting..." : "Accept invitation"}
            </Box>
            <Box
              as="button"
              onClick={onDecline}
              _disabled={{ opacity: 0.7, cursor: "not-allowed" }}
              w="100%"
              bg="transparent"
              color="#52525B"
              borderRadius="12px"
              py={{ base: 3, md: 4 }}
              px={{ base: 4, md: 5 }}
              fontSize={{ base: "md", md: "lg" }}
              fontWeight="600"
              cursor={isAccepting || isDeclining ? "not-allowed" : "pointer"}
              textAlign="center"
              border="1px solid #E4E4E7"
              transition="background 0.15s"
              _hover={
                isAccepting || isDeclining
                  ? {}
                  : { bg: "gray.50", borderColor: "#D4D4D8" }
              }
            >
              {isDeclining ? "Declining..." : "Decline"}
            </Box>
          </VStack>
        </Box>

        <Text fontSize="sm" color="#71717A" textAlign="center">
          Declining will allow you to create your own organisation instead.
        </Text>
      </Box>
    </>
  );
};
