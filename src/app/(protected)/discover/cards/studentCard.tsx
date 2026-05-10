import React, { useState } from "react";
import { Box, VStack, HStack, Text } from "@chakra-ui/react";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { StudentProfile } from "@/types/discovery";
import { FullProfileCard } from "./FullProfileCard";
import { AddToFolderModal } from "@/app/(protected)/folders/modals/AddToFolderModal";
import { DeleteModal } from "../../folders/modals/DeleteModal";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { Tooltip } from "@/components/ui/tooltip";
import {
  MapPin,
  MessageCircle,
  FolderHeart,
  GraduationCap,
  BookOpen,
  Calendar,
  Home,
  Dot,
} from "lucide-react";
import { ContactPage } from "@/components/ContactPage";
import { useAuthStore } from "@/store/authStore";
import { isInTrialPeriod } from "@/utils/subscriptionPermissions";

interface StudentCardProps {
  student: StudentProfile;
  userType: string;
  maxW?: string;
  profilePictureUrl: string | null;
  isInFolder?: boolean;
  onRemoveFromFolder?: () => void;
  disableViewFullProfile?: boolean;
  disableAddToFolder?: boolean;
  opportunityId?: string;
  opportunitySlug?: string;
}

function getUniversityName(student: StudentProfile): string {
  const u = student.university;
  if (typeof u === "string") return u;
  return u?.name ?? "";
}

function getCourseStreamLabel(student: StudentProfile): string {
  const cs = student.course_stream;
  if (typeof cs === "string") return cs;
  return cs?.label ?? "";
}

function getPreferredLocations(student: StudentProfile): string[] {
  const pl = student.preferred_location;
  if (Array.isArray(pl)) return pl;
  const pls = (student as StudentProfile & { preferred_locations?: string[] })
    .preferred_locations;
  return Array.isArray(pls) ? pls : [];
}

export function StudentCard({
  student,
  userType,
  maxW,
  profilePictureUrl,
  isInFolder = false,
  onRemoveFromFolder,
  disableViewFullProfile = false,
  disableAddToFolder = false,
  opportunityId,
  opportunitySlug,
}: StudentCardProps) {
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [showAddToFolderModal, setShowAddToFolderModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [addedToFolder, setAddedToFolder] = useState(false);
  const { userProfile } = useAuthStore();

  const getDisplayName = () => {
    const firstName = student.first_name || "";
    const lastName = student.last_name || "";
    return `${firstName} ${lastName}`.trim() || "";
  };

  const getProfileImage = () => {
    if (profilePictureUrl) return profilePictureUrl;
    return student.profile_picture_url || "";
  };

  const skills =
    Array.isArray(student?.skills) && student.skills.length > 0
      ? student.skills
      : [];

  const handleViewFullProfile = () => {
    if (student.id && !disableViewFullProfile && !isMatched) {
      setShowFullProfile(true);
    }
  };

  const handleContact = () => {
    if (student.id && !isMatched) {
      setShowContactModal(true);
    }
  };

  const handleAddToFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (student.id) {
      if (isInFolder) {
        setDeleteModal(true);
      } else {
        setShowAddToFolderModal(true);
      }
    }
  };

  const isMatched = student?.matched ?? false;
  const universityName = getUniversityName(student);
  const courseStreamLabel = getCourseStreamLabel(student);
  const preferredLocations = getPreferredLocations(student);
  const locationText = student.location || "";
  const distanceText =
    student.distance_km != null
      ? `${student.distance_km % 1 === 0 ? student.distance_km : student.distance_km.toFixed(1)} km`
      : "";
  const matchPercentage = student.match_score;

  const availabilityText = student.availability || ""; // TODO: not available in response yet
  const educationText = courseStreamLabel;
  const progressionText = student.progression || "";

  return (
    <>
      <Tooltip
        disabled={!isMatched}
        showArrow
        positioning={{ placement: "top", offset: { mainAxis: 8 } }}
        content="This student is already matched to an organisation."
      >
        <Box
          bg="white"
          borderRadius="xl"
          border="1px solid"
          borderColor="#E4E4E7"
          position="relative"
          w="100%"
          minH="320px"
          p={4}
          maxW={maxW}
          display="flex"
          flexDirection="column"
          transition="box-shadow 0.2s, border-color 0.2s"
          opacity={isMatched ? 0.6 : 1}
          cursor={isMatched ? "not-allowed" : "auto"}
          _hover={
            !isMatched
              ? {
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                  borderColor: "#D4D4D8",
                }
              : undefined
          }
        >
          <HStack
            align="flex-start"
            gap={3}
            mb={2}
            justifyContent="space-between"
            w="full"
          >
            <HStack align="flex-start" gap={3} flex={1} minW={0}>
              <ProfileAvatar
                src={getProfileImage() || null}
                alt={getDisplayName()}
                fallback={getDisplayName()}
                size="65px"
                borderRadius="12px"
              />

              <VStack align="stretch" gap={0.5} flex={1} minW={0}>
                <Tooltip content={getDisplayName()}>
                  <Text
                    fontSize="md"
                    fontWeight="500"
                    color="#000000"
                    lineHeight="tight"
                    maxW="full"
                    truncate
                  >
                    {getDisplayName()}
                  </Text>
                </Tooltip>
                {universityName && (
                  <Tooltip content={universityName}>
                    <Text
                      fontSize="sm"
                      color="#52525B"
                      lineHeight="tight"
                      maxW="full"
                      truncate
                    >
                      {universityName}
                    </Text>
                  </Tooltip>
                )}
              </VStack>
            </HStack>

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
                  cursor={isMatched ? "default" : "pointer"}
                  color={
                    isInFolder || addedToFolder
                      ? "var(--profile-500)"
                      : "#71717A"
                  }
                  _hover={
                    !isMatched ? { color: "var(--profile-500)" } : undefined
                  }
                  onClick={handleAddToFolder}
                  aria-label={
                    isInFolder ? "Remove from folder" : "Add to folder"
                  }
                  pointerEvents={isMatched ? "none" : "auto"}
                >
                  <FolderHeart
                    size={18}
                    strokeWidth={isInFolder ? 2.5 : addedToFolder ? 2.5 : 1.5}
                  />
                </Box>
              </Tooltip>
            )}
          </HStack>

          <VStack align="stretch" gap={2} flex={1} justifyContent="center">
            {educationText && (
              <HStack gap={1.5} color="#52525B" fontSize="sm">
                <Box flexShrink={0}>
                  <GraduationCap size={14} strokeWidth={2} color="#A1A1AA" />
                </Box>
                <Tooltip content={educationText}>
                  <Text
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    maxW="full"
                  >
                    {educationText}
                  </Text>
                </Tooltip>
              </HStack>
            )}

            {progressionText && (
              <HStack gap={1.5} color="#52525B" fontSize="sm">
                <Box flexShrink={0}>
                  <BookOpen size={14} strokeWidth={2} color="#A1A1AA" />
                </Box>
                <Tooltip content={progressionText}>
                  <Text
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    maxW="full"
                  >
                    {progressionText}
                  </Text>
                </Tooltip>
              </HStack>
            )}

            {(locationText || distanceText) && (
              <HStack gap={1.5} color="#52525B" fontSize="sm">
                <Box flexShrink={0}>
                  <MapPin size={14} strokeWidth={2} color="#A1A1AA" />
                </Box>
                <HStack alignItems="center" gap={1} flexWrap="wrap">
                  {locationText && (
                    <Tooltip content={locationText}>
                      <Text whiteSpace="nowrap" maxW="150px" truncate>
                        {locationText}
                      </Text>
                    </Tooltip>
                  )}
                  {locationText && distanceText && (
                    <Dot size={20} color="#A1A1AA" />
                  )}
                  {distanceText && (
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
                      {distanceText}
                    </Box>
                  )}
                </HStack>
              </HStack>
            )}

            {matchPercentage != null && (
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
                {matchPercentage}% Match
              </Box>
            )}

            {availabilityText && (
              <HStack gap={1.5} color="#52525B" fontSize="sm">
                <Box flexShrink={0}>
                  <Calendar size={14} strokeWidth={2} color="#A1A1AA" />
                </Box>
                <Tooltip content={availabilityText}>
                  <Text
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    maxW="full"
                  >
                    {availabilityText}
                  </Text>
                </Tooltip>
              </HStack>
            )}

            {preferredLocations.length > 0 && (
              <HStack gap={1.5} color="#52525B" fontSize="sm">
                <Box flexShrink={0}>
                  <Home size={14} strokeWidth={2} color="#A1A1AA" />
                </Box>
                <Tooltip content={preferredLocations.join(", ")}>
                  <Text
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    maxW="full"
                  >
                    {preferredLocations.join(", ")}
                  </Text>
                </Tooltip>
              </HStack>
            )}

            {skills.length > 0 && (
              <HStack gap={2} flexWrap="wrap">
                {skills.slice(0, 2).map((skill, index) => (
                  <Box
                    key={index}
                    bg="#F3E8FF"
                    color="#641BA3"
                    borderRadius="4px"
                    py={1.5}
                    px={2}
                    fontSize="2xs"
                    fontWeight="400"
                    boxShadow="0px 0px 1px 0px #641BA3 inset"
                  >
                    {skill}
                  </Box>
                ))}
                {skills.length > 2 && (
                  <Tooltip
                    content={skills.join(", ")}
                    positioning={{ placement: "top", offset: { mainAxis: 8 } }}
                  >
                    <Box
                      as="span"
                      bg="#F3E8FF"
                      color="#641BA3"
                      borderRadius="4px"
                      py={1.5}
                      px={2}
                      fontSize="2xs"
                      fontWeight="400"
                      boxShadow="0px 0px 1px 0px #641BA3 inset"
                      cursor="pointer"
                    >
                      +{skills.length - 2} more
                    </Box>
                  </Tooltip>
                )}
              </HStack>
            )}
          </VStack>

          <HStack gap={2} w="100%" pt={4}>
            <Tooltip
              disabled={!isInTrialPeriod(opportunitySlug || "")}
              positioning={{ placement: "top", offset: { mainAxis: 8 } }}
              content="Subscribe to view full profiles during your trial period."
            >
              <Box flex={1}>
                <ButtonV2
                  variant="primary"
                  size="sm"
                  w="full"
                  py={3}
                  h="36px"
                  onClick={handleViewFullProfile}
                  disabled={
                    !student.id ||
                    disableViewFullProfile ||
                    isMatched ||
                    isInTrialPeriod(opportunitySlug || "")
                  }
                >
                  View Profile
                </ButtonV2>
              </Box>
            </Tooltip>
            <ButtonV2
              variant="secondary"
              size="sm"
              h="36px"
              flex={1}
              py={3}
              px={4}
              onClick={handleContact}
              disabled={!student.id || isMatched}
              icon={<MessageCircle size={16} />}
            >
              Contact
            </ButtonV2>
          </HStack>
        </Box>
      </Tooltip>

      {showFullProfile && student.id && (
        <FullProfileCard
          profileId={student.id.toString()}
          profileType="student"
          opportunityId={opportunityId || ""}
          opportunitySlug={opportunitySlug}
          onClose={() => setShowFullProfile(false)}
        />
      )}

      {showContactModal && student.id && (
        <ContactPage
          recipientId={student.id}
          recipientName={getDisplayName()}
          profileType="student"
          organisationName={userProfile?.organisation?.name || ""}
          organisationContact={userProfile?.organisation?.contact_email || ""}
          onBack={() => setShowContactModal(false)}
          acceptedOpportunityId={opportunityId}
        />
      )}

      {showAddToFolderModal && student.id && !isInFolder && opportunitySlug && (
        <AddToFolderModal
          isOpen={showAddToFolderModal}
          onClose={() => setShowAddToFolderModal(false)}
          userId={student.id}
          userName={getDisplayName()}
          opportunitySlug={opportunitySlug}
          onAddToFolder={() => setAddedToFolder(true)}
          onResetBackground={() => setAddedToFolder(false)}
          memberType="student"
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
