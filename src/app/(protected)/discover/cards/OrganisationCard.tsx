import React, { useState } from "react";
import { Box, VStack, HStack, Text, Avatar } from "@chakra-ui/react";
import { OrganisationProfile } from "@/types/discovery";
import { FullProfileCard } from "./FullProfileCard";
import { AddToFolderModal } from "@/app/(protected)/folders/modals/AddToFolderModal";
import { DeleteModal } from "../../folders/modals/DeleteModal";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { MapPin, MessageCircle, FolderHeart, Dot } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/authStore";
import { ContactPage } from "@/components/ContactPage";

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
  maxW,
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
  const { userProfile } = useAuthStore();
  const userType = useAuthStore((state) => state.getUserType());

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

  const industryText = organisation.industry || organisation.sector;
  const studentIndustryNicheText =
    userType === "student"
      ? userProfile?.course_stream?.label || ""
      : industryText;
  const matchPercentage = organisation.matchPercentage;
  const locationText = organisation.location || "";
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
        h="251px"
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
          // maxW="90%"
        >
          <VStack align="flex-start" gap={3} w="full">
            <Avatar.Root
              w="24px"
              h="24px"
              borderRadius="6px"
              flexShrink={0}
              bg="#F4F4F5"
            >
              <Avatar.Fallback
                name={organisation.name || organisation.first_name}
                color="#71717A"
                fontWeight="600"
                fontSize="sm"
                // borderRadius="full"
              />
              {getCompanyLogo() && (
                <Avatar.Image
                  src={getCompanyLogo() || ""}
                  w="24px"
                  h="24px"
                  borderRadius="6px"
                  // borderRadius="13px"
                />
              )}
            </Avatar.Root>

            <VStack align="stretch" gap={1} flex={1} minW={0} w="full">
              <HStack alignItems="center" gap={1} w="full">
                <Tooltip content={organisation.name}>
                  <Text
                    fontSize="md"
                    fontWeight="500"
                    color="#000000"
                    lineHeight="tight"
                    maxW="150px"
                    truncate
                  >
                    {organisation.name}
                  </Text>
                </Tooltip>
                {organisation.actively_hiring && (
                  <Box
                    flexShrink={0}
                    px={1.5}
                    py={0.5}
                    bg="#F4F4F5"
                    borderRadius="md"
                    fontSize="xs"
                    fontWeight="500"
                    color="#173DA6"
                    boxShadow="0px 0px 1px 0px #D4D4D8 inset"
                  >
                    Actively Hiring
                  </Box>
                )}
              </HStack>

              {(locationText || distanceText) && (
                <HStack gap={1.5} color="#71717A" fontSize="sm">
                  <Box flexShrink={0}>
                    <MapPin size={14} strokeWidth={2} color="#52525B" />
                  </Box>
                  <HStack alignItems="center" gap={1}>
                    <Tooltip content={locationText}>
                      <Text whiteSpace="nowrap" w="full" maxW="150px" truncate>
                        {locationText}
                      </Text>
                    </Tooltip>
                    {locationText && distanceText && (
                      <Dot size={20} color="#A1A1AA" />
                    )}
                    {distanceText && (
                      <Text whiteSpace="nowrap" wordBreak="break-word">
                        {distanceText}
                      </Text>
                    )}
                  </HStack>
                </HStack>
              )}

              {/* {industryLabel && (
                <Text fontSize="sm" color="#52525B" lineClamp={1}>
                  {industryLabel}
                </Text>
              )} */}
            </VStack>
            {/* <VStack align="stretch" gap={2}>
              {industryText && (
                <Box>
                  <Tooltip content={industryText}>
                    <Text
                      color="#52525B"
                      fontSize="sm"
                      w="full"
                      maxW="150px"
                      truncate
                    >
                      {industryText}
                    </Text>
                  </Tooltip>
                </Box>
              )} */}
            <VStack align="stretch" gap={2}>
              {studentIndustryNicheText && (
                <Box>
                  <Tooltip content={studentIndustryNicheText}>
                    <Text
                      color="#52525B"
                      fontSize="sm"
                      w="full"
                      maxW="150px"
                      truncate
                    >
                      {studentIndustryNicheText}
                    </Text>
                  </Tooltip>
                </Box>
              )}
              {matchPercentage && (
                <Box
                  flexShrink={0}
                  px={1.5}
                  py={0.5}
                  bg="#DCFCE7"
                  borderRadius="md"
                  fontSize="xs"
                  fontWeight="500"
                  color="#116932"
                  boxShadow="0px 0px 1px 0px #D4D4D8 inset"
                >
                  {matchPercentage}% Match
                </Box>
              )}
            </VStack>
          </VStack>
          {!disableAddToFolder && (
            <Box
              p={1.5}
              borderRadius="md"
              position="absolute"
              top={4}
              right={4}
              cursor="pointer"
              color={addedToFolder ? "#2AA8E0" : "#71717A"}
              _hover={{ color: "#2AA8E0" }}
              onClick={handleAddToFolder}
              aria-label={isInFolder ? "Remove from folder" : "Add to folder"}
            >
              {isInFolder ? (
                <Box color="#DC2626" fontSize="18px">
                  <i
                    className="fa-solid fa-trash"
                    style={{ fontSize: "16px" }}
                  />
                </Box>
              ) : (
                <FolderHeart
                  size={18}
                  strokeWidth={addedToFolder ? 2.5 : 1.5}
                />
              )}
            </Box>
          )}
        </HStack>

        <HStack gap={2} w="100%" mt="auto">
          <ButtonV2
            variant="primary"
            flex={1}
            size="sm"
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

      {/* we need to find a way to access right organisation ID from here to navigate to the contact modal directly */}

      {/* {showContactModal && organisation.id && (
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
      )} */}

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
