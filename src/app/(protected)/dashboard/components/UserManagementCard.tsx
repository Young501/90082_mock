import React from "react";
import { Box, HStack, VStack, Text, Avatar, Badge } from "@chakra-ui/react";
import { Participant } from "@/types/dashboard";
import { getInitial } from "@/utils/getInitials";
import Image from "next/image";
import { Tooltip } from "@/components/ui/tooltip";

interface UserManagementCardProps {
  participant: Participant;
  isSelected: boolean;
  onClick: () => void;
  userType: "student" | "partner";
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

  const getBorderColor = () => {
    return userType === "student" ? "#DC2626" : "#089C3F";
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
        isDeclined || isInvited ? "gray.100" : isSelected ? "#A2DDF0" : "white"
      }
      border={
        isDeclined
          ? "1px solid #DC2626"
          : participant.match_info?.is_matched
            ? "1px solid #089C3F"
            : "1px solid #2CA9DF"
      }
      borderRadius="md"
      p={4}
      cursor={isDeclined || isInvited ? "not-allowed" : "pointer"}
      onClick={isDeclined || isInvited ? undefined : onClick}
      _hover={{
        bg: isDeclined
          ? "gray.100"
          : isSelected
            ? "#A2DDF0"
            : isSelected && participant.match_info?.is_matched
              ? "#00000024"
              : "gray.50",
        borderColor: isDeclined ? "#DC2626" : "blue.300",
      }}
      transition="all 0.2s"
      opacity={isDeclined || isInvited ? 0.6 : 1}
    >
      <HStack gap={4}>
        <Box
          w={{ base: "67px" }}
          h={{ base: "67px" }}
          borderRadius="50%"
          border={`10px solid ${getBorderColor()}`}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Avatar.Root width="62px" height="62px" borderRadius="50%">
            <Avatar.Fallback
              name={getInitial(participant.name || "")}
              bg="gray.200"
              color="gray.800"
              fontWeight="bold"
              fontSize="2xl"
            />
            {participant.image_url && (
              <Avatar.Image
                src={participant.image_url || ""}
                w="62px"
                h="62px"
              />
            )}
          </Avatar.Root>
        </Box>
        <VStack align="start" flex={1} gap={1}>
          <HStack>
            <Tooltip content={participant.name}>
              <Text fontWeight="600" fontSize="md" maxW={{base: "150px", md: "250px", lg: "150px", xl: "250px"}} style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>
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

          {userType === "student" ? (
            <Box>
              <Text
                fontSize={{ base: "12px", lg: "12px" }}
                color="#000000"
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
