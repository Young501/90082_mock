"use client";

import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Avatar,
  Link,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import { OrganisationProfile } from "@/types/discovery";

import Image from "next/image";
import { ContactPage } from "@/components/ContactPage";
import { AddToFolderModal } from "@/app/(protected)/folders/modals/AddToFolderModal";
import {
  MessageCircle,
  FolderPlus,
  MapPin,
  Users,
  Info,
  Mail,
  ExternalLink,
  Linkedin,
  Instagram,
  Globe,
} from "lucide-react";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { getLinkDisplayText } from "@/utils/formatLink";

export const RenderOrganisationDetails = ({
  organisation,
  disableBtns,
  opportunityId,
  opportunitySlug,
  userType,
  hideActions,
}: {
  organisation: OrganisationProfile;
  disableBtns: boolean;
  opportunityId?: string;
  opportunitySlug?: string;
  userType?: string;
  hideActions?: boolean;
}) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAddToFolderModal, setShowAddToFolderModal] = useState(false);

  const activelyHiring =
    organisation.questionnaire_answers?.actively_hiring?.value === true ||
    organisation.questionnaire_answers?.actively_hiring?.value === "true";

  const getCompanyLogo = () => {
    if (organisation.logo_url) return organisation.logo_url;
    return organisation.profile_picture_url || "";
  };

  const companySizeLabel = organisation.company_size
    ? organisation.company_size.toLowerCase().includes("employee")
      ? organisation.company_size
      : `${organisation.company_size} employees`
    : null;

  return (
    <Box
      w="full"
      h="full"
      px={{ base: 4, md: 6, lg: 10 }}
      py={{ base: 5, md: 8, lg: 10 }}
    >
      <Box
        position="relative"
        bg="#0F4F4D"
        backgroundImage="url('/assets/profileBackgroundWaves.svg')"
        backgroundSize="auto"
        backgroundRepeat="repeat"
        borderRadius="12px"
        overflow="hidden"
        px={{ base: 4, md: 6, lg: "60px" }}
        py={{ base: 4, md: 6, lg: 10 }}
      >
        <Flex
          direction={{ base: "column", lg: "row" }}
          align="center"
          gap={{ base: 4, md: 6 }}
          position="relative"
        >
          <HStack w="full" align="stretch" justify="space-between" gap={6}>
            <Avatar.Root
              w={{ base: "72px", md: "100px", lg: "114px" }}
              h={{ base: "72px", md: "100px", lg: "114px" }}
              flexShrink={0}
              border="1.2px solid #FFFFFF"
              borderRadius={{ base: "19.2px", md: "30.4px" }}
            >
              <Avatar.Image
                src={getCompanyLogo() || ""}
                borderRadius={{ base: "19.2px", md: "30.4px" }}
              />
              <Avatar.Fallback
                name={organisation.name || organisation.first_name}
                bg="whiteAlpha.400"
                color="white"
                fontSize={{ base: "12px", md: "16px", lg: "24px" }}
                fontWeight="bold"
                borderRadius={{ base: "19.2px", md: "30.4px" }}
              />
            </Avatar.Root>
            <Flex
              flex={1}
              direction="column"
              gap={{ base: 1, md: 2 }}
              align="flex-start"
              textAlign="left"
            >
              <Heading
                fontSize={{ base: "xl", md: "3xl" }}
                fontWeight="bold"
                color="white"
                lineHeight="38px"
              >
                {organisation.name || "-"}
              </Heading>
              {companySizeLabel && (
                <HStack gap={1} align="center" color="#FAFAFA" fontSize="sm">
                  <IconButton
                    variant="ghost"
                    size="sm"
                    h="fit-content"
                    minW="fit-content"
                  >
                    <Users size={14} color="#FAFAFA" />
                  </IconButton>
                  <Text>{companySizeLabel}</Text>
                </HStack>
              )}
              {organisation.location && (
                <HStack gap={1} align="center" color="#FAFAFA" fontSize="sm">
                  <IconButton
                    variant="ghost"
                    size="sm"
                    h="fit-content"
                    color="#FAFAFA"
                    minW="fit-content"
                  >
                    <MapPin size={14} />
                  </IconButton>
                  <Text>
                    {organisation.location}
                    {organisation.distance_km != null &&
                      organisation.distance_km !== 0 &&
                      ` (${organisation.distance_km} km)`}
                  </Text>
                </HStack>
              )}
            </Flex>
          </HStack>

          {!hideActions && (
          <HStack
            gap={3}
            justifyContent="end"
            flexShrink={0}
            flex={1}
            w={{ base: "full", lg: "auto" }}
          >
            {organisation.allow_contact && (
              <ButtonV2
                variant="ghost"
                icon={<MessageCircle size={16} />}
                iconPosition="start"
                bg="#3AADA8"
                borderRadius="xl"
                color="#FFFFFF"
                h="40px"
                flex={{ base: 1, lg: "none" }}
                minW={0}
                size="sm"
                onClick={() => setShowContactModal(true)}
                disabled={disableBtns || userType === "coordinator"}
              >
                Contact organization
              </ButtonV2>
            )}
            {opportunitySlug && (
              <ButtonV2
                variant="ghost"
                bg="#E9F7F6"
                icon={<FolderPlus size={16} />}
                iconPosition="start"
                h="40px"
                borderRadius="xl"
                color="#1F7F7B"
                border="1px solid #D3EFEA"
                flex={{ base: 1, lg: "none" }}
                minW={0}
                disabled={disableBtns || userType === "coordinator"}
                onClick={() => setShowAddToFolderModal(true)}
              >
                Add to Folder
              </ButtonV2>
            )}
          </HStack>
          )}
        </Flex>
      </Box>

      <Box
        py={6}
        display="flex"
        flexDirection={{ base: "column", lg: "row" }}
        gap={6}
      >
        <VStack
          align="stretch"
          gap={6}
          w={{ base: "full", lg: "50%" }}
          flex={1}
        >
          {(organisation.sector ||
            organisation.industry ||
            organisation.company_size) && (
            <VStack
              gap={6}
              align="stretch"
              borderRadius="12px"
              border="1px solid #E4E4E7"
              p={5}
            >
              <Text fontSize="md" fontWeight="600" color="#18181B">
                About Organisation
              </Text>
              {organisation.description && (
                <Box borderRadius="12px">
                  <Text fontSize="sm" color="#000000">
                    {organisation.description}
                  </Text>
                </Box>
              )}
              <VStack gap={4} align="stretch">
                <Flex gap={4} flexWrap="wrap">
                  {organisation.sector && (
                    <Box>
                      <Text
                        fontSize="sm"
                        color="#71717A"
                        mb={1}
                        fontWeight="500"
                      >
                        Organisation Type
                      </Text>
                      <Box color="#000000" fontSize="md" fontWeight="500">
                        {organisation.sector}
                      </Box>
                    </Box>
                  )}
                  {organisation.industry && (
                    <Box>
                      <Text
                        fontSize="sm"
                        color="#71717A"
                        mb={1}
                        fontWeight="500"
                      >
                        Sector Type
                      </Text>
                      <Box color="#000000" fontSize="md" fontWeight="500">
                        {organisation.industry}
                      </Box>
                    </Box>
                  )}
                  {organisation.company_size && (
                    <Box>
                      <Text
                        fontSize="sm"
                        color="#71717A"
                        mb={1}
                        fontWeight="500"
                      >
                        Company Size
                      </Text>
                      <Box color="#000000" fontSize="md" fontWeight="500">
                        {organisation.company_size}
                      </Box>
                    </Box>
                  )}
                </Flex>
              </VStack>
              {activelyHiring && (
                <Box
                  borderRadius="12px"
                  bg="#EFF6FF"
                  borderWidth="1px"
                  borderColor="#BFDBFE"
                  p={5}
                >
                  <HStack gap="18px" align="flex-start">
                    <Box
                      w="6"
                      h="6"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Info size={20} color="#1679AB" />
                    </Box>
                    <VStack align="start" gap="2px">
                      <Text fontSize="md" fontWeight="600" color="#173DA6">
                        Actively Hiring
                      </Text>
                      <Text fontSize="sm" color="#3F3F46">
                        Currently accepting students for placements and
                        employment discussions.
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              )}
            </VStack>
          )}

          {(organisation.contact_email ||
            organisation.website ||
            organisation.linkedin ||
            organisation.instagram ||
            organisation.bluesky ||
            (organisation.allow_contact && !organisation.contact_email)) && (
            <VStack
              gap={4}
              align="stretch"
              borderRadius="12px"
              border="1px solid #E4E4E7"
              p={5}
            >
              {organisation.contact_email && (
                <Box>
                  <Text fontSize="sm" color="#000000" mb={2} fontWeight="500">
                    Email address
                  </Text>
                  <Link
                    href={`mailto:${organisation.contact_email}`}
                    _hover={{ textDecoration: "none" }}
                    w="full"
                  >
                    <Flex
                      align="center"
                      justify="space-between"
                      gap={3}
                      px={4}
                      py={3}
                      bg="#F4F4F5"
                      borderRadius="12px"
                      w="full"
                      h="54px"
                    >
                      <Flex align="center" gap={3} minW={0}>
                        <Mail size={20} color="#52525B" />
                        <Text fontSize="sm" color="#52525B" truncate>
                          {organisation.contact_email}
                        </Text>
                      </Flex>
                      <Box flexShrink={0}>
                        <ExternalLink size={18} color="#27272A" />
                      </Box>
                    </Flex>
                  </Link>
                </Box>
              )}

              {organisation.website && (
                <Box>
                  <Text fontSize="sm" color="#000000" mb={2} fontWeight="500">
                    Website
                  </Text>
                  <Link
                    href={
                      organisation.website.startsWith("http")
                        ? organisation.website
                        : `https://${organisation.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    _hover={{ textDecoration: "none" }}
                    w="full"
                  >
                    <Flex
                      align="center"
                      justify="space-between"
                      gap={3}
                      px={4}
                      py={3}
                      bg="#F4F4F5"
                      borderRadius="12px"
                      w="full"
                      h="54px"
                    >
                      <Flex align="center" gap={3} minW={0}>
                        <Globe size={20} color="#52525B" />
                        <Text fontSize="sm" color="#52525B" truncate>
                          {getLinkDisplayText(organisation.website)}
                        </Text>
                      </Flex>
                      <Box flexShrink={0}>
                        <ExternalLink size={18} color="#27272A" />
                      </Box>
                    </Flex>
                  </Link>
                </Box>
              )}

              {organisation.linkedin && (
                <Box>
                  <Text fontSize="sm" color="#000000" mb={2} fontWeight="500">
                    LinkedIn
                  </Text>
                  <Link
                    href={
                      organisation.linkedin.startsWith("http")
                        ? organisation.linkedin
                        : `https://${organisation.linkedin}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    _hover={{ textDecoration: "none" }}
                    w="full"
                  >
                    <Flex
                      align="center"
                      justify="space-between"
                      gap={3}
                      px={4}
                      py={3}
                      bg="#F4F4F5"
                      borderRadius="12px"
                      w="full"
                      h="54px"
                    >
                      <Flex align="center" gap={3} minW={0}>
                        <Linkedin size={20} color="#52525B" />
                        <Text fontSize="sm" color="#52525B" truncate>
                          {getLinkDisplayText(organisation.linkedin)}
                        </Text>
                      </Flex>
                      <Box flexShrink={0}>
                        <ExternalLink size={18} color="#27272A" />
                      </Box>
                    </Flex>
                  </Link>
                </Box>
              )}

              {organisation.instagram && (
                <Box>
                  <Text fontSize="sm" color="#000000" mb={2} fontWeight="500">
                    Instagram
                  </Text>
                  <Link
                    href={
                      organisation.instagram.startsWith("http")
                        ? organisation.instagram
                        : `https://${organisation.instagram}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    _hover={{ textDecoration: "none" }}
                    w="full"
                  >
                    <Flex
                      align="center"
                      justify="space-between"
                      gap={3}
                      px={4}
                      py={3}
                      bg="#F4F4F5"
                      borderRadius="12px"
                      w="full"
                      h="54px"
                    >
                      <Flex align="center" gap={3} minW={0}>
                        <Instagram size={20} color="#52525B" />
                        <Text fontSize="sm" color="#52525B" truncate>
                          {getLinkDisplayText(organisation.instagram)}
                        </Text>
                      </Flex>
                      <Box flexShrink={0}>
                        <ExternalLink size={18} color="#27272A" />
                      </Box>
                    </Flex>
                  </Link>
                </Box>
              )}

              {organisation.bluesky && (
                <Box>
                  <Text fontSize="sm" color="#000000" mb={2} fontWeight="500">
                    Bluesky
                  </Text>
                  <Link
                    href={
                      organisation.bluesky.startsWith("http")
                        ? organisation.bluesky
                        : `https://${organisation.bluesky}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    _hover={{ textDecoration: "none" }}
                    w="full"
                  >
                    <Flex
                      align="center"
                      justify="space-between"
                      gap={3}
                      px={4}
                      py={3}
                      bg="#F4F4F5"
                      borderRadius="12px"
                      w="full"
                      h="54px"
                    >
                      <Flex align="center" gap={3} minW={0}>
                        <Image
                          src="/assets/bluesky.svg"
                          alt="Bluesky"
                          width={20}
                          height={20}
                        />
                        <Text fontSize="sm" color="#52525B" truncate>
                          {getLinkDisplayText(organisation.bluesky)}
                        </Text>
                      </Flex>
                      <Box flexShrink={0}>
                        <ExternalLink size={18} color="#27272A" />
                      </Box>
                    </Flex>
                  </Link>
                </Box>
              )}
            </VStack>
          )}
        </VStack>

        <VStack
          align="stretch"
          gap={4}
          w={{ base: "full", lg: "50%" }}
          flex={1}
        >
          {organisation.members && organisation.members.length > 0 && (
            <VStack
              gap={6}
              align="stretch"
              borderRadius="12px"
              border="1px solid #E4E4E7"
              p={5}
            >
              <Text fontSize="md" fontWeight="600" color="#000000">
                Key Contacts at this Organisation
              </Text>
              <VStack align="stretch" gap={3}>
                {organisation.members.map((person, index) => (
                  <HStack
                    key={person.id ?? index}
                    gap={3}
                    align="center"
                    p={3}
                    borderRadius="12px"
                    border="1px solid #F4F4F5"
                    bg="white"
                  >
                    <Avatar.Root
                      w="48px"
                      h="48px"
                      borderRadius="12px"
                      flexShrink={0}
                      bg="transparent"
                    >
                      <Avatar.Image
                        w="full"
                        h="full"
                        src={person.profile_picture_url || undefined}
                        borderRadius="12px"
                      />
                      <Avatar.Fallback
                        name={`${person.first_name ?? ""} ${person.last_name ?? ""}`}
                        bg="#EAF6FD"
                        color="#1679AB"
                        fontSize="md"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        w="full"
                        h="full"
                        fontWeight="bold"
                      />
                    </Avatar.Root>
                    <VStack align="start" gap={0} flex={1} minW={0}>
                      <Text
                        fontSize="md"
                        fontWeight="600"
                        color="#18181B"
                        truncate
                      >
                        {[person.first_name, person.last_name]
                          .filter(Boolean)
                          .join(" ") || "—"}
                      </Text>
                      <Text fontSize="sm" color="#71717A" truncate>
                        {person.job_title || person.role || "—"}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          )}
        </VStack>
      </Box>

      {showContactModal && organisation.id && (
        <ContactPage
          recipientId={organisation.id}
          organisationId={organisation.id.toString()}
          acceptedOpportunityId={opportunityId}
          members={organisation.members}
          recipientName={
            organisation.name ||
            `${organisation.first_name ?? ""} ${organisation.last_name ?? ""}`.trim() ||
            "Organisation"
          }
          profileType="organisation"
          onBack={() => setShowContactModal(false)}
        />
      )}

      {showAddToFolderModal && organisation.id && opportunitySlug && (
        <AddToFolderModal
          isOpen={showAddToFolderModal}
          onClose={() => setShowAddToFolderModal(false)}
          organisationId={organisation.id}
          userName={organisation.name || "Organisation"}
          opportunitySlug={opportunitySlug}
          memberType="organisation"
        />
      )}
    </Box>
  );
};
