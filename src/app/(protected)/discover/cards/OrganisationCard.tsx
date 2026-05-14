import React, { useState } from "react";
import { Box, VStack, HStack, Text } from "@chakra-ui/react";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { OrganisationProfile } from "@/types/discovery";
import { FullProfileCard } from "./FullProfileCard";
import { AddToFolderModal } from "@/app/(protected)/folders/modals/AddToFolderModal";
import { DeleteModal } from "../../folders/modals/DeleteModal";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { MapPin, MessageCircle, FolderHeart, Building2 } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { ContactPage } from "@/components/ContactPage";
import { usePartnerProfile } from "@/services/shared";
import { formatLocationDisplay } from "@/utils/geocode";

interface OrganisationCardProps {
  organisation: OrganisationProfile;
  maxW?: string;
  profilePictureUrl?: string | null;
  isInFolder?: boolean;
  onRemoveFromFolder?: () => void;
  disableViewFullProfile?: boolean;
  disableAddToFolder?: boolean;
  opportunityId?: string;
  opportunitySlug?: string;
}

export function OrganisationCard({
  organisation,
  maxW = "100%",
  isInFolder = false,
  onRemoveFromFolder,
  disableViewFullProfile = false,
  disableAddToFolder = false,
  opportunityId,
  opportunitySlug,
}: OrganisationCardProps) {
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [showAddToFolderModal, setShowAddToFolderModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [addedToFolder, setAddedToFolder] = useState(false);

  const { data: fullProfile, isLoading: isLoadingFullProfile } =
    usePartnerProfile(
      showContactModal && organisation.id ? organisation.id.toString() : "",
      opportunityId || ""
    );

  const getCompanyLogo = () => {
    return organisation.logo_url || organisation.profile_picture_url;
  };

  const handleViewFullProfile = () => {
    if (organisation.id && !disableViewFullProfile) {
      setShowFullProfile(true);
    }
  };

  const handleContact = () => {
    if (organisation.allow_contact && organisation.id) {
      setShowContactModal(true);
    }
  };

  const handleAddToFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (organisation.id) {
      if (isInFolder && onRemoveFromFolder) {
        setDeleteModal(true);
      } else {
        setShowAddToFolderModal(true);
      }
    }
  };

  const sectorText = organisation.sector;
  const industryText = organisation.industry;
  const industryDisplayText =
    sectorText && industryText
      ? `${sectorText} (${industryText})`
      : sectorText || industryText || "";
  const matchScore = organisation.match_score;
  const locationText = formatLocationDisplay(organisation.location);
  const distanceText =
    organisation.distance_km != null
      ? `${organisation.distance_km % 1 === 0 ? organisation.distance_km : organisation.distance_km.toFixed(1)} km`
      : "";

  return (
    <>
      <Box
        bg="white"
        borderRadius="xl"
        border="1px solid"
        borderColor="#E4E4E7"
        overflow="hidden"
        position="relative"
        w="100%"
        minH="251px"
        p={4}
        maxW={maxW}
        display="flex"
        flexDirection="column"
        transition="box-shadow 0.2s, border-color 0.2s"
        _hover={{
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          borderColor: "#D4D4D8",
        }}
      >
        <HStack
          align="flex-start"
          gap={3}
          mb={4}
          justifyContent="space-between"
          w="full"
        >
          <VStack align="flex-start" gap={3} w="full">
            <ProfileAvatar
              src={getCompanyLogo() || null}
              alt={organisation.name || organisation.first_name}
              fallback={organisation.name || organisation.first_name}
              size="40px"
              borderRadius="6px"
            />

            <VStack align="stretch" gap={1} flex={1} minW={0} w="full">
              <HStack
                // justifyContent="space-between"
                alignItems="flex-start"
                gap={2}
                w="full"
              >
                <Tooltip content={organisation.name}>
                  <Text
                    fontSize="md"
                    fontWeight="500"
                    color="#000000"
                    lineHeight="tight"
                    wordBreak="break-word"
                  >
                    {organisation.name}
                  </Text>
                </Tooltip>
                {organisation.questionnaire_answers?.actively_hiring?.value && (
                  <Tooltip
                    content={
                      organisation.questionnaire_answers
                        ?.actively_hiring_details?.value
                    }
                    disabled={
                      !organisation.questionnaire_answers
                        ?.actively_hiring_details?.value
                    }
                  >
                    <Box
                      flexShrink={0}
                      px={1.5}
                      py={0.5}
                      bg="#EEF2FF"
                      borderRadius="md"
                      fontSize="xs"
                      fontWeight="500"
                      color="#173DA6"
                      boxShadow="0px 0px 1px 0px #C7D2FE inset"
                    >
                      Actively Hiring
                    </Box>
                  </Tooltip>
                )}
              </HStack>

              {(locationText || distanceText) && (
                <HStack
                  gap={1.5}
                  color="#71717A"
                  fontSize="sm"
                  align="flex-start"
                >
                  <Box flexShrink={0} pt="1px">
                    <MapPin size={14} strokeWidth={2} color="#A1A1AA" />
                  </Box>
                  <HStack alignItems="center" gap={1} flexWrap="wrap">
                    {locationText && (
                      <Tooltip content={locationText}>
                        <Text lineClamp={2}>{locationText}</Text>
                      </Tooltip>
                    )}
                    {locationText && distanceText && (
                      <Text color="#A1A1AA" fontWeight="600">·</Text>
                    )}
                    {distanceText && (
                      <Text flexShrink={0} fontWeight="600" color="#52525B">
                        {distanceText}
                      </Text>
                    )}
                  </HStack>
                </HStack>
              )}
            </VStack>

            <VStack align="stretch" gap={2} w="full">
              {industryDisplayText && (
                <HStack gap={1.5} color="#52525B" fontSize="sm">
                  <Box flexShrink={0}>
                    <Building2 size={14} strokeWidth={2} color="#A1A1AA" />
                  </Box>
                  <Tooltip content={industryDisplayText}>
                    <Text truncate maxW="full">
                      {industryDisplayText}
                    </Text>
                  </Tooltip>
                </HStack>
              )}
              {matchScore != null && matchScore > 0 && (
                <Box
                  alignSelf="flex-start"
                  px={1.5}
                  py={0.5}
                  bg="#DCFCE7"
                  borderRadius="md"
                  fontSize="xs"
                  fontWeight="500"
                  color="#116932"
                  boxShadow="0px 0px 1px 0px #D4D4D8 inset"
                >
                  {matchScore}% Match
                </Box>
              )}
            </VStack>
          </VStack>
          {!disableAddToFolder && (
            <Tooltip
              content={isInFolder ? "Remove from folder" : "Add to folder"}
              positioning={{ placement: "top", offset: { mainAxis: 6 } }}
              showArrow
            >
              <Box
                p={1.5}
                borderRadius="md"
                position="absolute"
                top={4}
                right={4}
                cursor="pointer"
                color={
                  isInFolder || addedToFolder ? "var(--profile-500)" : "#71717A"
                }
                _hover={{ color: "var(--profile-500)" }}
                onClick={handleAddToFolder}
                aria-label={isInFolder ? "Remove from folder" : "Add to folder"}
              >
                <FolderHeart
                  size={18}
                  strokeWidth={isInFolder ? 2.5 : addedToFolder ? 2.5 : 1.5}
                />
              </Box>
            </Tooltip>
          )}
        </HStack>

        <HStack gap={2} w="100%" mt="auto">
          <ButtonV2
            variant="primary"
            flex={1}
            size="sm"
            h="36px"
            py={3}
            onClick={handleViewFullProfile}
            disabled={!organisation.id || disableViewFullProfile}
          >
            View Profile
          </ButtonV2>
          {organisation.allow_contact && (
            <ButtonV2
              variant="secondary"
              size="sm"
              h="36px"
              flex={1}
              py={3}
              px={4}
              onClick={handleContact}
              disabled={!organisation.id}
              icon={<MessageCircle size={16} />}
            >
              Contact
            </ButtonV2>
          )}
        </HStack>
        {/* </Box> */}
      </Box>

      {showFullProfile && organisation.id && (
        <FullProfileCard
          profileId={organisation.id.toString()}
          profileType="organisation"
          opportunityId={opportunityId || ""}
          opportunitySlug={opportunitySlug || ""}
          onClose={() => setShowFullProfile(false)}
        />
      )}

      {showContactModal && organisation.id && !isLoadingFullProfile && (
        <ContactPage
          recipientId={organisation.id}
          organisationId={organisation.id.toString()}
          acceptedOpportunityId={opportunityId}
          members={fullProfile?.members ?? organisation.members}
          recipientName={
            organisation.name ||
            `${organisation.first_name ?? ""} ${organisation.last_name ?? ""}`.trim() ||
            "Organisation"
          }
          profileType="organisation"
          onBack={() => setShowContactModal(false)}
        />
      )}

      {showAddToFolderModal &&
        organisation.id &&
        !isInFolder &&
        opportunitySlug && (
          <AddToFolderModal
            isOpen={showAddToFolderModal}
            onClose={() => setShowAddToFolderModal(false)}
            organisationId={organisation.id}
            userName={organisation.name || "Organisation"}
            opportunitySlug={opportunitySlug}
            onAddToFolder={() => setAddedToFolder(true)}
            onResetBackground={() => setAddedToFolder(false)}
            memberType="organisation"
          />
        )}

      {deleteModal && (
        <DeleteModal
          isOpen={deleteModal}
          onClose={() => setDeleteModal(false)}
          onDelete={() => onRemoveFromFolder?.()}
          InFolder={true}
          onResetBackground={() => {}}
        />
      )}
    </>
  );
}
