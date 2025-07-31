import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Separator,
} from "@chakra-ui/react";
import { Participant } from "@/types/dashboard";
import { getInitial } from "@/utils/getInitials";
import { formatDate } from "@/utils/formatDate";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUnmatch } from "@/services/manage";
import { MatchConfirmationModal } from "@/components/ui";
import { Button } from "@/components/ui/Button";

interface UserMatchingStatusProps {
  participant: Participant | null;
  userType: "student" | "partner";
  opportunityId: string;
  onParticipantUpdate?: (updatedParticipant: Participant) => void;
}

const UserMatchingStatus: React.FC<UserMatchingStatusProps> = ({
  participant,
  userType,
  opportunityId,
  onParticipantUpdate,
}) => {
  const router = useRouter();
  const unmatchMutation = useUnmatch(opportunityId.toString(), participant?.match_info?.matched_with?.match_id?.toString() || " ");
  
  const [isUnmatching, setIsUnmatching] = useState(false);
  
  const getBorderColor = () => {
    return userType === "student" ? "#DC2626" : "#089C3F";
  };

  const getDotColor = () => {
    return userType === "student" ? "#DC2626" : "#089C3F";
  };

  const getMatchedWithName = () => {
    if (!participant?.match_info?.matched_with) return "";

    if (Array.isArray(participant.match_info.matched_with)) {
      const matches = participant.match_info.matched_with;
      return matches.length > 0 ? matches[0].name || "" : "";
    } else {
      return participant.match_info.matched_with.name || "";
    }
  };

  const getMessageText = (message: any) => {
    if (message.sender?.user_type === "partner") {
      return `Student is contacted by ${message.sender?.name || "-"}`;
    } else {
      return `Student contacted ${message.receiver?.name || "-"}`;
    }
  };

  const getEmptyStateText = () => {
    return userType === "student"
      ? "Click on a Student's profile to access matching status"
      : "Click on an Organisation's profile to access matching status";
  };

  const handleUnmatch = () => {
    if (participant?.match_info?.matched_with) {
      unmatchMutation.mutate(undefined, {
        onSuccess: () => {
          if (participant && onParticipantUpdate) {
            const updatedParticipant = {
              ...participant,
              match_info: {
                ...participant.match_info,
                is_matched: false,
                matched_with: null,
              },
            };
            onParticipantUpdate(updatedParticipant);
          }
          setIsUnmatching(false);
        },
      });
    }
  };

  const handleUnmatchClick = () => {
    setIsUnmatching(true);
  };

  const handleCloseUnmatchModal = () => {
    setIsUnmatching(false);
  };

  if (!participant) {
    return (
      <Box height="100%">
        <Text
          fontSize={{ base: "20px", lg: "35px" }}
          fontWeight="600"
          color="#000000"
          textAlign="left"
        >
          Matching Status
        </Text>
        <Box
          bg="white"
          borderRadius="lg"
          p={6}
          height="fit-content"
          display="flex"
          alignItems="center"
          justifyContent="center"
          minH={{ base: "100%", lg: "400px" }}
        >
          <Text
            fontSize={{ base: "18px", lg: "27px" }}
            fontWeight="400"
            color="#000000"
            maxW={{ base: "100%", lg: "417px" }}
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
      <Text
        fontSize={{ base: "20px", lg: "35px" }}
        mb={{ base: "20px", lg: "50px" }}
        fontWeight="600"
        color="#000000"
        textAlign="left"
      >
        Matching Status
      </Text>

      <VStack align="stretch" gap={4}>
        <HStack gap={4} mb={{ base: "20px", lg: "40px" }}>
          <Box
            w={{ base: "90px" }}
            h={{ base: "90px" }}
            borderRadius="50%"
            border={`10px solid ${getBorderColor()}`}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Avatar.Root width="85px" height="85px">
              <Avatar.Fallback
                name={getInitial(participant.name || "")}
                bg="gray.200"
                color="gray.800"
                fontWeight="bold"
                fontSize={{ base: "20px", lg: "35px" }}
              />
              {participant.image_url && (
                <Avatar.Image
                  src={participant.image_url || ""}
                  w="85px"
                  h="85px"
                />
              )}
            </Avatar.Root>
          </Box>
          <VStack align="start" gap={1}>
            <Text fontWeight="600" fontSize={{ base: "16px", lg: "20px" }}>
              {participant.name}
            </Text>
          </VStack>
        </HStack>

        <Separator borderColor="#000000" mb={{ base: "20px", lg: "40px" }} />

        <VStack
          align="stretch"
          gap={{ base: "20px", lg: "40px" }}
          mb={{ base: "20px", lg: "40px" }}
        >
          {participant?.messages &&
          participant.messages.length &&
          userType === "student" ? (
            <VStack align="stretch" gap={2}>
              {participant.messages.map((message, index) => (
                <Box key={message.id || index}>
                  <HStack gap={6} alignItems="start" w="100%">
                    <Box
                      w={{ base: "8px", md: "12px", lg: "23px" }}
                      mt={2}
                      h={{ base: "8px", md: "12px", lg: "23px" }}
                    >
                      <Box
                        w={{ base: "8px", md: "12px", lg: "23px" }}
                        h={{ base: "8px", md: "12px", lg: "23px" }}
                        bg={getDotColor()}
                        borderRadius="20px"
                      />
                    </Box>

                    <Box>
                      <Text
                        fontSize={{ base: "18px", lg: "22px" }}
                        fontWeight="700"
                      >
                        {getMessageText(message)}
                      </Text>
                      <Text
                        fontSize={{ base: "16px", lg: "20px" }}
                        color="#000000"
                        fontWeight="400"
                      >
                        {formatDate(message.sent_at || "")}
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              ))}
            </VStack>
          ) : userType === "partner" ? (
            <VStack align="stretch" gap={2}>
              {Array.isArray(participant.match_info?.matched_with) &&
              participant.match_info?.matched_with?.length &&
              participant.match_info?.matched_with?.length > 0 ? (
                <>
                  <Text
                    fontSize={{ base: "16px", lg: "20px" }}
                    color="#000000"
                    fontWeight="400"
                  >
                    List of students matched with this organisation
                  </Text>
                  {participant.match_info?.matched_with.map(
                    (matchedWith: any, index: number) => (
                      <Box
                        key={matchedWith.id || index}
                        border="1px solid #2CA9DF"
                        px={6}
                        py={2}
                        borderRadius="10px"
                        w="100%"
                        display="flex"
                        alignItems="center"
                        justifyContent="start"
                        gap={6}
                      >
                        <Box
                          w={{ base: "40px" }}
                          h={{ base: "40px" }}
                          borderRadius="50%"
                          border={`5px solid #DC2626`}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Avatar.Root
                            width="35px"
                            height="35px"
                            borderRadius="50%"
                          >
                            <Avatar.Fallback
                              name={getInitial(matchedWith.name || "")}
                              bg="gray.200"
                              color="gray.800"
                              fontWeight="bold"
                              fontSize={{ base: "16px", lg: "20px" }}
                            />
                            <Avatar.Image
                              src={matchedWith.image_url || ""}
                              w="35px"
                              h="35px"
                            />
                          </Avatar.Root>
                        </Box>

                        <Text
                          fontSize={{ base: "18px", lg: "22px" }}
                          fontWeight="700"
                        >
                          {matchedWith.name}
                        </Text>

                        <Text
                          fontSize={{ base: "14px", lg: "16px" }}
                          fontWeight="400"
                          color="gray.600"
                        >
                          Matched at -{" "}
                          {formatDate(matchedWith.matched_at || "")}
                        </Text>
                      </Box>
                    )
                  )}
                </>
              ) : (
                <Text
                  fontSize={{ base: "16px", lg: "20px" }}
                  color="#000000"
                  fontWeight="400"
                >
                  This organisation did not match with any students yet
                </Text>
              )}
            </VStack>
          ) : (
            <Text
              fontSize={{ base: "16px", lg: "20px" }}
              color="#000000"
              fontStyle="italic"
            >
              No messages yet
            </Text>
          )}
        </VStack>

        {participant.match_info?.is_matched && userType === "student" && (
          <VStack align="start">
            <Box display="flex" alignItems="center" gap={2}>
              <Image
                src="/assets/matched.svg"
                alt="check-circle"
                width={34}
                height={34}
              />
              <Text
                fontSize={{ base: "16px", lg: "20px" }}
                color="#000000"
                fontWeight="600"
              >
                Student is MATCHED to {getMatchedWithName()}
              </Text>
            </Box>

            <Text
              fontSize={{ base: "16px", lg: "20px" }}
              color="#000000"
              fontWeight="400"
            >
              Matched at -{" "}
              {formatDate(
                Array.isArray(participant.match_info?.matched_with)
                  ? participant.match_info.matched_with[0]?.matched_at || ""
                  : participant.match_info?.matched_with?.matched_at || ""
              )}
            </Text>
          </VStack>
        )}

        <Separator borderColor="#000000" mb={{ base: "20px", lg: "40px" }} />

        {userType === "student" && (
          <Box>
            {participant.match_info?.is_matched ? (
              <HStack
                align="center"
                gap={3}
                w="100%"
                justifyContent="space-between"
              >
                <Text
                  fontWeight="600"
                  fontSize={{ base: "16px", lg: "20px" }}
                  width="100%"
                  color="gray.700"
                >
                  Do you want to unmatch this{" "}
                  {userType === "student" ? "student" : "organisation"}?
                </Text>
                <Button
                  variant="secondary"
                  fontSize={{ base: "20px", lg: "27px" }}
                  fontWeight="600"
                  borderRadius="18px"
                  py={{ base: "10px", lg: "20px" }}
                  px={{ base: "20px", lg: "40px" }}
                  maxW={{ base: "100%", lg: "200px" }}
                  onClick={handleUnmatchClick}
                >
                  Unmatch
                </Button>
              </HStack>
            ) : (
              <HStack
                align="stretch"
                gap={3}
                w="100%"
                justifyContent="space-between"
              >
                <Text
                  fontWeight="600"
                  fontSize={{ base: "16px", lg: "20px" }}
                  width="100%"
                  color="gray.700"
                >
                  Do you want to match this{" "}
                  {userType === "student" ? "student" : "organisation"}?
                </Text>
                <Button
                  variant="primary"
                  color="white"
                  fontSize={{ base: "20px", lg: "27px" }}
                  fontWeight="600"
                  borderRadius="18px"
                  py={{ base: "10px", lg: "20px" }}
                  px={{ base: "20px", lg: "40px" }}
                  maxW={{ base: "100%", lg: "200px" }}
                  disabled={participant.match_info?.is_matched || false}
                  onClick={() => {
                    if (participant && participant.id && opportunityId) {
                      router.push(
                        `/dashboard/manage/match/?studentId=${participant.id}&opportunityId=${opportunityId}`
                      );
                    }
                  }}
                >
                  Match
                </Button>
              </HStack>
            )}
          </Box>
        )}
      </VStack>

      <MatchConfirmationModal
        isOpen={isUnmatching}
        onClose={handleCloseUnmatchModal}
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
