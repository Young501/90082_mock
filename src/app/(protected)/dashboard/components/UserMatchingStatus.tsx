import React, { useState } from "react";
import { Box, VStack, HStack, Text, Separator } from "@chakra-ui/react";
import { Participant } from "@/types/dashboard";
import { getInitial } from "@/utils/getInitials";
import { formatDate } from "@/utils/formatDate";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUnmatch } from "@/services/manage";
import { MatchConfirmationModal } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { FullProfileCard } from "@/app/(protected)/discover/cards/FullProfileCard";
import { ProfileAvatar } from "@/components/ProfileAvatar";

interface UserMatchingStatusProps {
  participant: Participant | null;
  userType: "student" | "organisation";
  opportunityId: string;
  onParticipantUpdate?: (updatedParticipant: Participant) => void;
}

const UserMatchingStatus: React.FC<UserMatchingStatusProps> = ({
  participant,
  userType,
  opportunityId,
  onParticipantUpdate,
}) => {
  const [showFullProfile, setShowFullProfile] = useState(false);
  const router = useRouter();
  const unmatchMutation = useUnmatch(
    opportunityId.toString(),
    participant?.match_info?.matched_with?.match_id?.toString() || " "
  );
  const [isUnmatching, setIsUnmatching] = useState(false);

  const buttonVariant = userType === "student" ? "student" : "partner";

  const getDotColor = () =>
    userType === "student" ? "#1679AB" : "#1F7F7B";

  const getMatchedWithName = () => {
    if (!participant?.match_info?.matched_with) return "";
    if (Array.isArray(participant.match_info.matched_with)) {
      const matches = participant.match_info.matched_with;
      return matches.length > 0 ? matches[0].name || "" : "";
    }
    return participant.match_info.matched_with.name || "";
  };

  const getMessageText = (message: any) => {
    if (message.sender?.user_type === "organisation") {
      return `Student is contacted by ${message.sender?.name || "-"}`;
    }
    return `Student contacted ${message.receiver?.name || "-"}`;
  };

  const getEmptyStateText = () =>
    userType === "student"
      ? "Click on a Student's profile to access matching status"
      : "Click on an Organisation's profile to access matching status";

  const handleUnmatch = () => {
    if (participant?.match_info?.matched_with) {
      unmatchMutation.mutate(undefined, {
        onSuccess: () => {
          if (participant && onParticipantUpdate) {
            onParticipantUpdate({
              ...participant,
              match_info: { ...participant.match_info, is_matched: false, matched_with: null },
            });
          }
          setIsUnmatching(false);
        },
      });
    }
  };

  if (!participant) {
    return (
      <Box height="100%">
        <Text fontSize={{ base: "16px", lg: "20px" }} fontWeight="600" color="#000000">
          Matching Status
        </Text>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minH={{ base: "100%", lg: "300px" }}
        >
          <Text
            fontSize={{ base: "14px", lg: "15px" }}
            fontWeight="400"
            color="#71717A"
            maxW="320px"
            textAlign="center"
          >
            {getEmptyStateText()}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box bg="white" height="fit-content">
      <Text fontSize={{ base: "16px", lg: "20px" }} fontWeight="600" color="#000000" mb={4}>
        Matching Status
      </Text>

      <VStack align="stretch" gap={4}>
        <HStack
          gap={4}
          justifyContent="space-between"
          alignItems="center"
          flexDirection={{ base: "column", md: "row" }}
          w="100%"
        >
          <HStack gap={3}>
            <ProfileAvatar
              src={participant.image_url}
              fallback={getInitial(participant.name || "")}
              size="lg"
              borderRadius="12px"
              alt={participant.name}
            />
            <VStack align="start" gap={0}>
              <Text fontWeight="600" fontSize={{ base: "14px", lg: "16px" }}>
                {participant.name}
              </Text>
              {participant.email && (
                <Text fontSize="12px" color="#71717A" fontWeight="400">
                  {participant.email}
                </Text>
              )}
            </VStack>
          </HStack>

          <Button
            variant={buttonVariant}
            fontSize="14px"
            fontWeight="600"
            height="36px"
            px={4}
            borderRadius="8px"
            onClick={() => setShowFullProfile(true)}
          >
            View Full Profile
          </Button>
        </HStack>

        <Separator borderColor="#E4E4E7" />

        <VStack align="stretch" gap={3} py={2}>
          {participant?.messages && participant.messages.length && userType === "student" ? (
            <VStack align="stretch" gap={3}>
              {participant.messages.map((message, index) => (
                <HStack key={message.id || index} gap={3} alignItems="flex-start" w="100%">
                  <Box
                    w="8px"
                    h="8px"
                    mt="6px"
                    bg={getDotColor()}
                    borderRadius="full"
                    flexShrink={0}
                  />
                  <Box>
                    <Text fontSize={{ base: "13px", lg: "14px" }} fontWeight="600">
                      {getMessageText(message)}
                    </Text>
                    <Text fontSize={{ base: "12px", lg: "13px" }} color="#71717A" fontWeight="400">
                      {formatDate(message.sent_at || "")}
                    </Text>
                  </Box>
                </HStack>
              ))}
            </VStack>
          ) : userType === "organisation" ? (
            <VStack align="stretch" gap={2}>
              {Array.isArray(participant.match_info?.matched_with) &&
              participant.match_info?.matched_with?.length > 0 ? (
                <>
                  <Text fontSize="13px" color="#71717A" fontWeight="400">
                    Students matched with this organisation
                  </Text>
                  {participant.match_info.matched_with.map((matchedWith: any, index: number) => (
                    <HStack
                      key={matchedWith.id || index}
                      border="1px solid #E4E4E7"
                      px={4}
                      py={2}
                      borderRadius="8px"
                      gap={3}
                    >
                      <ProfileAvatar
                        src={matchedWith.image_url}
                        fallback={getInitial(matchedWith.name || "")}
                        size="sm"
                        borderRadius="8px"
                        alt={matchedWith.name}
                      />
                      <Text fontSize="14px" fontWeight="600" flex={1}>
                        {matchedWith.name}
                      </Text>
                      <Text fontSize="12px" color="#71717A">
                        {formatDate(matchedWith.matched_at || "")}
                      </Text>
                    </HStack>
                  ))}
                </>
              ) : (
                <Text fontSize="14px" color="#71717A" fontWeight="400">
                  This organisation has not matched with any students yet
                </Text>
              )}
            </VStack>
          ) : (
            <Text fontSize="14px" color="#71717A" fontStyle="italic">
              No messages yet
            </Text>
          )}
        </VStack>

        {participant.match_info?.is_matched && userType === "student" && (
          <HStack gap={2}>
            <Image src="/assets/matched.svg" alt="matched" width={18} height={18} />
            <Box>
              <Text fontSize="14px" fontWeight="600" color="#000000">
                Matched with {getMatchedWithName()}
              </Text>
              <Text fontSize="12px" color="#71717A">
                {formatDate(
                  Array.isArray(participant.match_info?.matched_with)
                    ? participant.match_info.matched_with[0]?.matched_at || ""
                    : participant.match_info?.matched_with?.matched_at || ""
                )}
              </Text>
            </Box>
          </HStack>
        )}

        <Separator borderColor="#E4E4E7" />

        {userType === "student" && (
          <HStack justify="space-between" align="center" gap={4}>
            <Text fontSize="14px" fontWeight="500" color="#52525B">
              {participant.match_info?.is_matched
                ? "Do you want to unmatch this student?"
                : "Do you want to match this student?"}
            </Text>
            {participant.match_info?.is_matched ? (
              <Button
                variant="secondary"
                fontSize="14px"
                fontWeight="600"
                height="36px"
                px={4}
                borderRadius="8px"
                onClick={() => setIsUnmatching(true)}
              >
                Unmatch
              </Button>
            ) : (
              <Button
                variant={buttonVariant}
                fontSize="14px"
                fontWeight="600"
                height="36px"
                px={4}
                borderRadius="8px"
                disabled={participant.match_info?.is_matched || false}
                onClick={() => {
                  if (participant?.id && opportunityId) {
                    router.push(`/dashboard/manage/match/?studentId=${participant.id}&opportunityId=${opportunityId}`);
                  }
                }}
              >
                Match
              </Button>
            )}
          </HStack>
        )}
      </VStack>

      {showFullProfile && (
        <FullProfileCard
          profileId={(participant.profile_id ?? participant.id).toString()}
          profileType={userType}
          onClose={() => setShowFullProfile(false)}
          opportunityId={opportunityId}
        />
      )}

      <MatchConfirmationModal
        isOpen={isUnmatching}
        onClose={() => setIsUnmatching(false)}
        onConfirm={handleUnmatch}
        title="Confirm Unmatch"
        message={`Are you sure you want to unmatch this student from ${getMatchedWithName()}?`}
        confirmText="Unmatch"
        isLoading={unmatchMutation.isPending}
      />
    </Box>
  );
};

export default UserMatchingStatus;
