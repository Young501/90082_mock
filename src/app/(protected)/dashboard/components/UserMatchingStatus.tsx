import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Separator,
  IconButton,
} from "@chakra-ui/react";
import { Participant } from "@/types/dashboard";
import { getInitial } from "@/utils/getInitials";
import { formatDate, formatDateTimeToReadable } from "@/utils/formatDate";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { EllipsisVertical, Trash2, EyeOff, Eye } from "lucide-react";
import {
  useUnmatch,
  useDeleteParticipant,
  useToggleParticipantVisibility,
} from "@/services/manage";
import { MatchConfirmationModal } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/tooltip";
import { FullProfileCard } from "@/app/(protected)/discover/cards/FullProfileCard";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { MenuPopover } from "@/components/ui/MenuPopover";
import { PendingResendPanel } from "./PendingResendPanel";

interface UserMatchingStatusProps {
  participant: Participant | null;
  userType: "student" | "organisation";
  opportunityId: string;
  oppSlug?: string;
  onParticipantUpdate?: (updatedParticipant: Participant) => void;
  onDelete?: () => void;
  isExpired?: boolean;
}

const UserMatchingStatus: React.FC<UserMatchingStatusProps> = ({
  participant,
  userType,
  opportunityId,
  oppSlug,
  onParticipantUpdate,
  onDelete,
  isExpired = false,
}) => {
  const [showFullProfile, setShowFullProfile] = useState(false);
  const router = useRouter();
  const unmatchMutation = useUnmatch(
    opportunityId.toString(),
    participant?.match_info?.matched_with?.match_id?.toString() || " "
  );
  const [isUnmatching, setIsUnmatching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const deleteParticipantMutation = useDeleteParticipant(opportunityId);
  const toggleVisibilityMutation =
    useToggleParticipantVisibility(opportunityId);

  const buttonVariant = userType === "student" ? "student" : "partner";

  const getDotColor = () => (userType === "student" ? "#1679AB" : "#1F7F7B");

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

  const handleDelete = () => {
    if (!participant?.id) return;
    deleteParticipantMutation.mutate(participant.id, {
      onSuccess: () => {
        setIsDeleting(false);
        onDelete?.();
      },
    });
  };

  const handleToggleVisibility = () => {
    if (!participant?.id) return;
    const newHidden = !participant.hidden;
    toggleVisibilityMutation.mutate(
      { participantId: participant.id, hidden: newHidden },
      {
        onSuccess: () => {
          setIsTogglingVisibility(false);
          if (onParticipantUpdate) {
            onParticipantUpdate({ ...participant, hidden: newHidden });
          }
        },
      }
    );
  };

  const handleUnmatch = () => {
    if (participant?.match_info?.matched_with) {
      unmatchMutation.mutate(undefined, {
        onSuccess: () => {
          if (participant && onParticipantUpdate) {
            onParticipantUpdate({
              ...participant,
              match_info: {
                ...participant.match_info,
                is_matched: false,
                matched_with: null,
              },
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
        <Text
          fontSize={{ base: "16px", lg: "20px" }}
          fontWeight="600"
          color="#000000"
        >
          Participant Panel
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

  const isPending = participant.accepted_status === "Pending";

  return (
    <Box bg="white" height="fit-content">
      {/* Panel title + three-dot menu */}
      <HStack justify="space-between" align="center" mb={4}>
        <Text
          fontSize={{ base: "16px", lg: "20px" }}
          fontWeight="600"
          color="#000000"
        >
          Participant Panel
        </Text>
        <MenuPopover
          placement="bottom-end"
          trigger={
            <IconButton
              aria-label="Participant options"
              variant="ghost"
              size="sm"
              minW="fit-content"
              h="fit-content"
            >
              <EllipsisVertical size={18} color="#71717A" />
            </IconButton>
          }
        >
          <Box
            as="button"
            display="flex"
            alignItems="center"
            gap={2}
            w="100%"
            px={2}
            py={1.5}
            borderRadius="md"
            fontSize="sm"
            color="#52525B"
            _hover={{ bg: "#F4F4F5" }}
            cursor="pointer"
            onClick={() => setIsTogglingVisibility(true)}
          >
            {participant.hidden ? <Eye size={14} /> : <EyeOff size={14} />}
            {participant.hidden ? "Unhide from peers" : "Hide from peers"}
          </Box>
          <Tooltip
            content="This opportunity has expired"
            disabled={!isExpired}
            showArrow
          >
            <Box
              as="button"
              display="flex"
              alignItems="center"
              gap={2}
              w="100%"
              px={2}
              py={1.5}
              borderRadius="md"
              fontSize="sm"
              color={isExpired ? "#A1A1AA" : "#EF4444"}
              _hover={{ bg: isExpired ? undefined : "#FEF2F2" }}
              cursor={isExpired ? "not-allowed" : "pointer"}
              onClick={() => !isExpired && setIsDeleting(true)}
            >
              <Trash2 size={14} />
              Remove Participant
            </Box>
          </Tooltip>
        </MenuPopover>
      </HStack>

      <VStack align="stretch" gap={4}>
        {/* Shared participant header — same for all statuses */}
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
              {participant.invitation_sent_at && (
                <Text fontSize="11px" color="#A1A1AA" fontWeight="400">
                  Invited on{" "}
                  {formatDateTimeToReadable(participant.invitation_sent_at)}
                </Text>
              )}
            </VStack>
          </HStack>

          {!isPending && (
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
          )}
        </HStack>

        <Separator borderColor="#E4E4E7" />

        {/* Body — branches on pending vs accepted */}
        {isPending ? (
          <PendingResendPanel
            participant={participant}
            userType={userType}
            oppSlug={oppSlug}
          />
        ) : (
          <>
            <VStack align="stretch" gap={3} py={2}>
              {participant?.messages &&
              participant.messages.length &&
              userType === "student" ? (
                <VStack align="stretch" gap={3}>
                  {participant.messages.map((message, index) => (
                    <HStack
                      key={message.id || index}
                      gap={3}
                      alignItems="flex-start"
                      w="100%"
                    >
                      <Box
                        w="8px"
                        h="8px"
                        mt="6px"
                        bg={getDotColor()}
                        borderRadius="full"
                        flexShrink={0}
                      />
                      <Box>
                        <Text
                          fontSize={{ base: "13px", lg: "14px" }}
                          fontWeight="600"
                        >
                          {getMessageText(message)}
                        </Text>
                        <Text
                          fontSize={{ base: "12px", lg: "13px" }}
                          color="#71717A"
                          fontWeight="400"
                        >
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
                      {participant.match_info.matched_with.map(
                        (matchedWith: any, index: number) => (
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
                        )
                      )}
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
                <Image
                  src="/assets/matched.svg"
                  alt="matched"
                  width={18}
                  height={18}
                />
                <Box>
                  <Text fontSize="14px" fontWeight="600" color="#000000">
                    Matched with {getMatchedWithName()}
                  </Text>
                  <Text fontSize="12px" color="#71717A">
                    {formatDate(
                      Array.isArray(participant.match_info?.matched_with)
                        ? participant.match_info.matched_with[0]?.matched_at ||
                            ""
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
                  <Tooltip
                    content="This opportunity has expired"
                    disabled={!isExpired}
                    showArrow
                  >
                    <Button
                      variant="secondary"
                      fontSize="14px"
                      fontWeight="600"
                      height="36px"
                      px={4}
                      borderRadius="8px"
                      disabled={isExpired}
                      onClick={() => !isExpired && setIsUnmatching(true)}
                    >
                      Unmatch
                    </Button>
                  </Tooltip>
                ) : (
                  <Tooltip
                    content="This opportunity has expired"
                    disabled={!isExpired}
                    showArrow
                  >
                    <Button
                      variant={buttonVariant}
                      fontSize="14px"
                      fontWeight="600"
                      height="36px"
                      px={4}
                      borderRadius="8px"
                      disabled={
                        isExpired || participant.match_info?.is_matched || false
                      }
                      onClick={() => {
                        if (!isExpired && participant?.id && opportunityId) {
                          router.push(
                            `/dashboard/manage/match/?studentId=${participant.id}&opportunityId=${opportunityId}`
                          );
                        }
                      }}
                    >
                      Match
                    </Button>
                  </Tooltip>
                )}
              </HStack>
            )}
          </>
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

      <MatchConfirmationModal
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={handleDelete}
        title="Remove Participant"
        message={`Are you sure you want to remove ${participant?.name ?? "this participant"} from the opportunity? This will permanently delete all associated data including any matches. This action cannot be undone.`}
        confirmText="Remove Participant"
        confirmVariant="danger"
        isLoading={deleteParticipantMutation.isPending}
      />

      <MatchConfirmationModal
        isOpen={isTogglingVisibility}
        onClose={() => setIsTogglingVisibility(false)}
        onConfirm={handleToggleVisibility}
        title={participant?.hidden ? "Unhide Participant" : "Hide Participant"}
        message={
          participant?.hidden
            ? `Are you sure you want to unhide ${participant?.name ?? "this participant"}? They will appear in search results for other participants.`
            : `Are you sure you want to hide ${participant?.name ?? "this participant"}? They will no longer appear in search results for other participants.`
        }
        confirmText={participant?.hidden ? "Unhide" : "Hide"}
        isLoading={toggleVisibilityMutation.isPending}
      />
    </Box>
  );
};

export default UserMatchingStatus;
