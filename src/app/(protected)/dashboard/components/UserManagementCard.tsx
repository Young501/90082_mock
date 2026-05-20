import React from "react";
import { Box, HStack, VStack, Text, Badge } from "@chakra-ui/react";
import { Participant } from "@/types/dashboard";
import { getInitial } from "@/utils/getInitials";
import Image from "next/image";
import { Tooltip } from "@/components/ui/tooltip";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { PROFILE_TINT_COLORS } from "@/theme/theme";

interface UserManagementCardProps {
  participant: Participant;
  isSelected: boolean;
  onClick: () => void;
  userType: "student" | "organisation";
}

const UserManagementCard: React.FC<UserManagementCardProps> = ({
  participant,
  isSelected,
  onClick,
  userType,
}) => {
  const getStatusText = (status: string) => {
    switch (status) {
      case "Pending":
        return "Invited";
      case "Accepted":
        return "Matched";
      case "NotMatched":
        return "Ready for Match";
      case "Declined":
        return "Declined";
      default:
        return "Unknown";
    }
  };

  const getMatchedWithName = () => {
    if (!participant.match_info?.matched_with) return "";

    if (Array.isArray(participant.match_info.matched_with)) {
      const matches = participant.match_info.matched_with;
      return matches.length > 0 ? matches[0].name || "" : "";
    } else {
      return participant.match_info.matched_with.name || "";
    }
  };

  const getMatchedWithCount = () => {
    if (!participant.match_info?.matched_with) return 0;

    if (Array.isArray(participant.match_info.matched_with)) {
      return participant.match_info.matched_with.length;
    } else {
      return 1;
    }
  };

  const isDeclined = participant.accepted_status === "Declined";
  const isInvited = participant.accepted_status === "Pending";
  const isMatched =
    participant.match_info?.is_matched &&
    participant.accepted_status === "Accepted";
  const isNotMatched =
    !participant.match_info?.is_matched &&
    participant.accepted_status === "Accepted" &&
    participant.has_profile;

  return (
    <Box
      bg={
        isDeclined || isInvited
          ? "gray.100"
          : isSelected
            ? PROFILE_TINT_COLORS[userType]
            : "white"
      }
      border={
        isDeclined
          ? "1px solid #DC2626"
          : participant.match_info?.is_matched
            ? "1px solid #089C3F"
            : isSelected
              ? `1px solid ${PROFILE_TINT_COLORS[userType]}`
              : "1px solid #E4E4E7"
      }
      borderRadius="md"
      p={4}
      cursor={isDeclined || isInvited ? "not-allowed" : "pointer"}
      onClick={isDeclined || isInvited ? undefined : onClick}
      _hover={{
        transform: isDeclined || isInvited ? "none" : "scale(1.01)",
      }}
      transition="all 0.2s"
      opacity={isDeclined || isInvited ? 0.6 : 1}
    >
      <HStack gap={4}>
        <ProfileAvatar
          src={participant.image_url}
          fallback={getInitial(participant.name || "")}
          size="lg"
          borderRadius="12px"
          alt={participant.name}
        />
        <VStack align="start" flex={1} gap={1}>
          <HStack>
            <Tooltip content={participant.name}>
              <Text
                fontWeight="600"
                fontSize="md"
                maxW={{ base: "150px", md: "250px", lg: "150px", xl: "250px" }}
                style={{
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {participant.name}
              </Text>
            </Tooltip>

            {isMatched && (
              <Image
                src="/assets/matched.svg"
                alt="check-circle"
                width={20}
                height={20}
              />
            )}
          </HStack>

          {participant.email && (
            <Text fontSize="11px" color="#000000" fontWeight="400">
              {participant.email}
            </Text>
          )}

          {userType === "student" ? (
            <Box>
              <Text
                fontSize={{ base: "12px", lg: "12px" }}
                color="#71717A"
                fontWeight="400"
              >
                {isMatched
                  ? "Matched with " + getMatchedWithName()
                  : getStatusText(
                      isNotMatched
                        ? "NotMatched"
                        : participant.accepted_status || ""
                    )}
              </Text>
            </Box>
          ) : (
            <Text
              fontSize={{ base: "12px", lg: "12px" }}
              color="#000000"
              fontWeight="400"
            >
              {isMatched
                ? "Matched with " + getMatchedWithCount() + " students"
                : getStatusText(
                    !participant.match_info?.is_matched &&
                      participant.accepted_status === "Accepted"
                      ? "NotMatched"
                      : participant.accepted_status || ""
                  )}
            </Text>
          )}
        </VStack>
      </HStack>
    </Box>
  );
};

export default UserManagementCard;
