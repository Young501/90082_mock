"use client";

import { Box, Text, VStack, Avatar, HStack, Flex } from "@chakra-ui/react";
import { Organisation } from "@/types/shared";
import { getInitials } from "@/utils/getInitials";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import Link from "next/link";

interface Props {
  organisation: Organisation;
  onConfirm: () => void;
}

const MAX_VISIBLE_AVATARS = 4;

export const OrganisationMatchPage = ({ organisation, onConfirm }: Props) => {
  const members = organisation.members ?? [];
  const memberCount = organisation.member_count ?? members.length;
  const visibleMembers = members.slice(0, MAX_VISIBLE_AVATARS);

  return (
    <>
      <PageTitle title={PAGE_TITLES.ORGANISATION_MATCH} />
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
            Join your organisation
          </Text>

          <Text fontSize={{ base: "15px", md: "16px" }} color="#18181B">
            Your email address is already associated with an existing
            organisation on UniConnected.
          </Text>
        </VStack>

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
              <Avatar.Image
                src={organisation.logo_url || undefined}
                alt={organisation.name}
              />
              <Avatar.Fallback
                bg="#E8F4FD"
                color="#1679AB"
                fontWeight="bold"
                fontSize="20px"
              >
                {getInitials(organisation.name ?? "", "")}
              </Avatar.Fallback>
            </Avatar.Root>

            <VStack align="flex-start" gap={1.5} flex={1} minW={0}>
              <Text
                fontSize={{ base: "17px", md: "18px" }}
                fontWeight="700"
                color="black"
                lineHeight="1.2"
              >
                {organisation.name}
              </Text>

              {(visibleMembers.length > 0 || memberCount > 0) && (
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
                  {memberCount > 0 && (
                    <Text fontSize="14px" color="#52525B" fontWeight="500">
                      {memberCount} member{memberCount !== 1 ? "s" : ""}
                    </Text>
                  )}
                </HStack>
              )}
            </VStack>
          </HStack>

          <Box
            as="button"
            onClick={onConfirm}
            w="100%"
            bg="#3AADA8"
            color="white"
            borderRadius="12px"
            py={{ base: 3, md: 4 }}
            px={{ base: 4, md: 5 }}
            fontSize={{ base: "md", md: "lg" }}
            fontWeight="600"
            cursor="pointer"
            textAlign="center"
            transition="background 0.15s"
          >
            Join and Complete Your Profile
          </Box>
        </Box>

        <HStack gap={3} align="center" flexWrap="wrap" justify="center">
          <Text fontSize="sm" color="#27272A" textAlign="center">
            Want to use UniConnected with a different organisation?
          </Text>
          <Link href="/signup/">
            <Box
              as="span"
              display="inline-block"
              borderWidth="1px"
              borderColor="#D3EFEA"
              borderRadius="10px"
              px={4}
              py={2}
              fontSize="14px"
              fontWeight="600"
              color="#1F7F7B"
              cursor="pointer"
              _hover={{ bg: "whiteAlpha.200" }}
              transition="background 0.15s"
            >
              Sign up
            </Box>
          </Link>
        </HStack>
      </Box>
    </>
  );
};
