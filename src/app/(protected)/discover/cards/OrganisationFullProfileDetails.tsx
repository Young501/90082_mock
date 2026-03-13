import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Link,
  Grid,
} from "@chakra-ui/react";
import { OrganisationProfile } from "@/types/discovery";

import Image from "next/image";
import { ContactPage } from "@/components/ContactPage";
import { AddToFolderModal } from "@/app/(protected)/folders/modals/AddToFolderModal";
import {
  MessageCircle,
  FolderPlus,
  MapPin,
  Link2,
  Users,
  Info,
  Mail,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Linkedin,
  Instagram,
} from "lucide-react";
import { ButtonV2 } from "@/components/ui/ButtonV2";

const DESCRIPTION_PREVIEW_LENGTH = 200;

export const RenderOrganisationDetails = ({
  organisation,
  disableBtns,
  opportunityId,
  opportunitySlug,
  userType,
}: {
  organisation: OrganisationProfile;
  disableBtns: boolean;
  opportunityId?: string;
  opportunitySlug?: string;
  userType?: string;
}) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAddToFolderModal, setShowAddToFolderModal] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const activelyHiring =
    organisation.questionnaire_answers?.actively_hiring?.value === true ||
    organisation.questionnaire_answers?.actively_hiring?.value === "true";

  const getCompanyLogo = () => {
    if (organisation.logo_url) return organisation.logo_url;
    return organisation.profile_picture_url || "";
  };

  const description = organisation.description || "";
  const showReadMore = description.length > DESCRIPTION_PREVIEW_LENGTH;
  const descriptionText = descriptionExpanded
    ? description
    : description.slice(0, DESCRIPTION_PREVIEW_LENGTH) +
      (showReadMore ? "..." : "");

  return (
    <Box
      w="full"
      maxW="1006px"
      mx="auto"
      bg="white"
      px={{ base: 4, md: 6, lg: 10 }}
      py={{ base: 5, md: 8, lg: 10 }}
    >
      <VStack gap={6} w="full">
        <VStack
          gap={7}
          w="full"
          border="1px solid #E4E4E7"
          px={{ base: 4, md: 5 }}
          py={{ base: 6, md: 6 }}
          borderRadius="lg"
        >
          <VStack gap={4} w="full">
            <Box
              w="full"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={4}
            >
              <HStack align="center" gap={3} w="full" flex={1}>
                <Avatar.Root
                  flexShrink={0}
                  w={{ base: "36px", md: "60px" }}
                  h={{ base: "36px", md: "60px" }}
                  bg="#EAF6FD"
                  borderRadius={{ base: "12px", md: "20px" }}
                  p={3}
                >
                  <Avatar.Image src={getCompanyLogo() || ""} />
                  <Avatar.Fallback
                    name={organisation.name || organisation.first_name}
                    bg="blue.50"
                    color="blue.600"
                    fontSize="lg"
                    fontWeight="bold"
                  />
                </Avatar.Root>

                <VStack align="start" gap={1} flex={1} minW={0}>
                  <Text
                    fontSize={{ base: "lg", md: "xl" }}
                    fontWeight="medium"
                    color="black"
                  >
                    {organisation.name || "-"}
                  </Text>
                  <HStack gap={2} flexWrap="wrap" color="#52525B" fontSize="sm">
                    {organisation.location && (
                      <HStack gap={1.5} align="center">
                        <MapPin size={14} />
                        <Text>
                          {organisation.location}
                          {organisation.distance_km != null &&
                            organisation.distance_km != undefined &&
                            ` (${organisation.distance_km} km)`}
                        </Text>
                      </HStack>
                    )}
                    {organisation.location && organisation.website && (
                      <Box w="1px" h="3" bg="gray.300" alignSelf="center" />
                    )}
                    {organisation.website && (
                      <HStack gap={1.5} align="center" asChild>
                        <Link
                          href={organisation.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          color="#52525B"
                          textDecoration="underline"
                        >
                          <ExternalLink size={14} />
                          <Text maxW="180px" truncate>
                            {organisation.website}
                          </Text>
                        </Link>
                      </HStack>
                    )}
                    {(organisation.location || organisation.website) &&
                      organisation.company_size && (
                        <Box w="1px" h="3" bg="gray.300" alignSelf="center" />
                      )}
                    {organisation.company_size && (
                      <HStack gap={1.5} align="center">
                        <Users size={14} />
                        <Text>
                          {organisation.company_size
                            .toLowerCase()
                            .includes("employee")
                            ? organisation.company_size
                            : `${organisation.company_size} employees`}
                        </Text>
                      </HStack>
                    )}
                  </HStack>
                </VStack>
              </HStack>
              <HStack
                gap={2}
                w="full"
                justifyContent={{ base: "space-between", md: "flex-start" }}
                maxW={{ base: "full", md: "fit-content" }}
              >
                {organisation.allow_contact && (
                  <ButtonV2
                    variant="primary"
                    icon={<MessageCircle size={16} />}
                    iconPosition="start"
                    h="40px"
                    w={{ base: "50%", md: "fit-content" }}
                    disabled={disableBtns || userType === "coordinator"}
                    onClick={() => setShowContactModal(true)}
                  >
                    Contact
                  </ButtonV2>
                )}
                {opportunitySlug && (
                  <ButtonV2
                    variant="secondary"
                    icon={<FolderPlus size={16} />}
                    iconPosition="start"
                    h="40px"
                    w={{ base: "50%", md: "fit-content" }}
                    disabled={disableBtns || userType === "coordinator"}
                    onClick={() => setShowAddToFolderModal(true)}
                  >
                    Add to Folder
                  </ButtonV2>
                )}
              </HStack>
            </Box>

            {/* Organisation description + Read more */}
            {description && (
              <Box w="full">
                <Text
                  fontSize="sm"
                  color="black"
                  lineHeight="tall"
                  whiteSpace="pre-wrap"
                  textAlign="left"
                >
                  {descriptionText}
                </Text>
                {showReadMore && (
                  <Link
                    fontSize="sm"
                    color="#27272A"
                    fontWeight="500"
                    cursor="pointer"
                    onClick={() => setDescriptionExpanded((e) => !e)}
                    display="inline-flex"
                    alignItems="center"
                    gap={1}
                    mt={1}
                    _hover={{ textDecoration: "underline" }}
                  >
                    {descriptionExpanded ? "Read less" : "Read more"}
                    {descriptionExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </Link>
                )}
              </Box>
            )}
          </VStack>

          {/* Actively Hiring banner */}
          {activelyHiring && (
            <Box
              w="full"
              borderRadius="lg"
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
                  <Text fontSize="md" fontWeight="medium" color="black">
                    Actively Hiring
                  </Text>
                  <Text fontSize="sm" color="black">
                    Currently accepting students for placements and employment
                    discussions.
                  </Text>
                </VStack>
              </HStack>
            </Box>
          )}
        </VStack>

        {/* Contact & Social */}
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} w="full">
          <Box
            borderRadius="lg"
            borderWidth="1px"
            borderColor="#E4E4E7"
            p={{ base: 4, md: 5 }}
          >
            <Text fontSize="md" fontWeight="semibold" color="black" mb={6}>
              {organisation.name || "Details"}
            </Text>
            <Grid templateColumns="1fr 1fr" gap={5}>
              {organisation.sector && (
                <Box w="full">
                  <Text fontSize="sm" color="#71717A" mb={1}>
                    Organisation Type
                  </Text>
                  <Text fontSize="md" fontWeight="500" color="black">
                    {organisation.sector}
                  </Text>
                </Box>
              )}
              {organisation.industry && (
                <Box w="full">
                  <Text fontSize="sm" color="#71717A" mb={1}>
                    Sector Type
                  </Text>
                  <Text fontSize="md" fontWeight="500" color="black">
                    {organisation.industry}
                  </Text>
                </Box>
              )}
              {organisation.company_size && (
                <Box w="full">
                  <Text fontSize="sm" color="#71717A" mb={1}>
                    Company Size
                  </Text>
                  <Text fontSize="md" fontWeight="500" color="black">
                    {organisation.company_size}
                  </Text>
                </Box>
              )}
            </Grid>
          </Box>

          <Box
            borderRadius="lg"
            borderWidth="1px"
            borderColor="#E4E4E7"
            p={{ base: 4, md: 5 }}
          >
            <Text fontSize="md" fontWeight="semibold" color="black" mb={6}>
              Contact & Social
            </Text>
            <VStack align="stretch" gap={5}>
              {(organisation.contact_email || organisation.allow_contact) && (
                <HStack gap={2} align="center">
                  <Mail size={18} color="#52525B" />
                  <Link
                    href={
                      organisation.contact_email
                        ? `mailto:${organisation.contact_email}`
                        : "#"
                    }
                    fontSize="sm"
                    color="#52525B"
                    textDecoration="underline"
                    onClick={(e) => {
                      if (
                        !organisation.contact_email &&
                        organisation.allow_contact
                      )
                        setShowContactModal(true);
                      else if (!organisation.contact_email) e.preventDefault();
                    }}
                  >
                    {organisation.contact_email || "Contact via message"}
                  </Link>
                </HStack>
              )}
              {organisation.linkedin && (
                <HStack gap={2} align="center">
                  <Linkedin size={18} color="#52525B" />
                  <Link
                    href={organisation.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    fontSize="sm"
                    color="#52525B"
                    textDecoration="underline"
                  >
                    LinkedIn Organisation Page
                  </Link>
                </HStack>
              )}
              {organisation.instagram && (
                <HStack gap={2} align="center">
                  <Instagram size={18} color="#52525B" />
                  <Link
                    href={organisation.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    fontSize="sm"
                    color="#52525B"
                    textDecoration="underline"
                  >
                    Instagram
                  </Link>
                </HStack>
              )}
              {organisation.bluesky && (
                <HStack gap={2} align="center">
                  <Image
                    src="/assets/bluesky.svg"
                    alt="Bluesky"
                    width={18}
                    height={18}
                  />
                  <Link
                    href={organisation.bluesky}
                    target="_blank"
                    rel="noopener noreferrer"
                    fontSize="sm"
                    color="#52525B"
                    textDecoration="underline"
                  >
                    Bluesky
                  </Link>
                </HStack>
              )}
            </VStack>
          </Box>
        </Grid>

        {/* Key Contacts at this Organisation */}
        {organisation.members && organisation.members.length > 0 && (
          <Box
            w="full"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="#E4E4E7"
            p={{ base: 4, md: 5 }}
          >
            <Text fontSize="md" fontWeight="semibold" color="black" mb={6}>
              Key Contacts at this Organisation
            </Text>
            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={5}>
              {organisation.members.map((person, index) => (
                <HStack
                  key={person.id ?? index}
                  gap={3}
                  px={3}
                  pt={3}
                  pb={4}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="gray.200"
                  bg="white"
                  align="center"
                >
                  <Avatar.Root
                    w="48px"
                    h="48px"
                    borderRadius="xl"
                    flexShrink={0}
                    bg="transparent"
                  >
                    <Avatar.Image
                      w="full"
                      h="full"
                      src={person.profile_picture_url || undefined}
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
                      fontWeight="medium"
                      color="black"
                      truncate
                    >
                      {[person.first_name, person.last_name]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </Text>
                    <Text fontSize="sm" color="#52525B" truncate>
                      {person.job_title || "—"}
                    </Text>
                  </VStack>
                </HStack>
              ))}
            </Grid>
          </Box>
        )}
      </VStack>

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
