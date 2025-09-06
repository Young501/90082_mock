import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  Avatar,
  Heading,
} from "@chakra-ui/react";
import { StudentProfile } from "@/types/discovery";
import Image from "next/image";
import { FullProfileCard } from "./FullProfileCard";
import { AddToFolderModal } from "@/app/(protected)/folders/modals/AddToFolderModal";
import { DeleteModal } from "../../folders/modals/DeleteModal";
import { Button } from "@/components/ui/Button";

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
}: StudentCardProps) {
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [showAddToFolderModal, setShowAddToFolderModal] = useState(false);
  const [clickBackground, setClickBackground] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const getDisplayName = () => {
    const firstName = student.first_name || "";
    const lastName = student.last_name || "";
    return `${firstName} ${lastName}`.trim() || "";
  };

  const getProfileImage = () => {
    if (profilePictureUrl) {
      return profilePictureUrl;
    } else {
      return student.profile_picture_url || "";
    }
  };

  const getSkillsData = () => {
    if (
      !student?.skills ||
      !Array.isArray(student.skills) ||
      student.skills.length === 0
    ) {
      return [];
    }

    return student?.skills;
  };

  const handleViewFullProfile = () => {
    if (student.id && !disableViewFullProfile && !isMatched) {
      setShowFullProfile(true);
    }
  };

  const handleAddToFolder = () => {
    setClickBackground(true);
    if (student.id) {
      if (isInFolder && onRemoveFromFolder) {
        setDeleteModal(true);
      } else {
        setShowAddToFolderModal(true);
      }
    } else {
      setClickBackground(false);
    }
  };

  const isMatched = student?.matched;

  const skills = getSkillsData();
  const maxVisibleSkills = 2;
  const visibleSkills = skills.slice(0, maxVisibleSkills);
  const remainingSkills = skills.slice(maxVisibleSkills);
  const hasMoreSkills = remainingSkills.length > 0;
  const showSkillsSection = skills.length > 0;

  return (
    <>
      <Box
        bg={clickBackground ? "#2CA9DF" : "#D1D1D1"}
        borderRadius="20px"
        border="1px solid"
        borderColor="gray.200"
        boxShadow="0px 3.37px 6.74px 3.37px rgba(0, 0, 0, 0.25)"
        overflow="hidden"
        position="relative"
        borderTopRightRadius="20px"
        w="100%"
        maxW={maxW}
        pointerEvents={isMatched ? "none" : "auto"}
        opacity={isMatched ? 0.6 : 1}
      >
        <Box position="absolute" top={4} right={4} zIndex={1}>
          <Box
            w={6}
            h={6}
            bg={clickBackground ? "#2CA9DF" : "transparent"}
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            // _focus={{
            //   outline: "none",
            //   bg: "#2CA9DF",
            // }}
            onClick={disableAddToFolder ? undefined : handleAddToFolder}
          >
            {isInFolder ? (
              <i
                className="fa-solid fa-trash"
                style={{ color: "#DC2626", fontSize: "20px" }}
              />
            ) : (
              <Image
                width={20}
                height={20}
                src="/assets/addicon.svg"
                alt="add"
                objectFit="contain"
              />
            )}
          </Box>
        </Box>

        <Box
          px="20px"
          py="40px"
          bg="white"
          borderTopRightRadius="150px"
          display="flex"
          flexDirection="column"
          boxShadow="0px 3.37px 6.74px 3.37px rgba(0, 0, 0, 0.25)"
          w="full"
          h="full"
        >
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            flex="1"
          >
            <Box
              display="flex"
              flexDirection="row"
              gap={4}
              justifyContent="center"
              w="full"
            >
              <Avatar.Root
                w="130px"
                h="130px"
                border="6px solid #DC2626"
                borderRadius="full"
              >
                <Avatar.Fallback
                  name={student.first_name + " " + student.last_name}
                  bg="gray.200"
                  color="gray.800"
                  fontWeight="bold"
                  fontSize="2xl"
                />
                {getProfileImage() && (
                  <Avatar.Image src={getProfileImage() || ""} />
                )}
              </Avatar.Root>

              <Box display="flex" flexDirection="column" gap={6} w="full">
                <Box>
                  <Heading
                    fontSize={{ base: "16px", md: "20px" }}
                    textTransform="capitalize"
                    mb={2}
                    fontWeight="bold"
                    color="#000000"
                    whiteSpace="normal"
                    wordBreak="break-word"
                  >
                    {getDisplayName()}
                  </Heading>
                  <Text
                    fontSize="14px"
                    textTransform="capitalize"
                    fontWeight="400"
                    color="#000000"
                    whiteSpace="normal"
                    wordBreak="break-word"
                  >
                    {userType}
                  </Text>
                </Box>

                <Box display="flex" flexDirection="column" gap={2} mb={4}>
                  {student.course_name && (
                    <HStack gap={2} align="start">
                      <Box
                        w="16px"
                        h="16px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <Image
                          width={12}
                          height={12}
                          src="/assets/educationIcon.svg"
                          alt="course"
                          objectFit="contain"
                        />
                      </Box>
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        whiteSpace="normal"
                        wordBreak="break-word"
                      >
                        {student.course_name} <br />
                        {student.course_progression}
                      </Text>
                    </HStack>
                  )}

                  {student.location && (
                    <HStack gap={2} align="center">
                      <Box
                        w="16px"
                        h="16px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <Image
                          width={12}
                          height={12}
                          src="/assets/locationIcon.svg"
                          alt="location"
                          objectFit="contain"
                        />
                      </Box>
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        whiteSpace="normal"
                        wordBreak="break-word"
                      >
                        {student.location}
                      </Text>
                    </HStack>
                  )}

                  {student.credentials && student.credentials.length > 0 && (
                    <HStack gap={2} align="start">
                      <Box
                        w="16px"
                        h="16px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <Image
                          width={12}
                          height={12}
                          src="/assets/certificationIcon.svg"
                          alt="specialization"
                          objectFit="contain"
                        />
                      </Box>
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        whiteSpace="normal"
                        wordBreak="break-word"
                      >
                        {student.credentials.join(", ")}
                      </Text>
                    </HStack>
                  )}

                  <HStack gap={2} align="start">
                    <Box
                      w="16px"
                      h="16px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Image
                        width={12}
                        height={12}
                        src="/assets/calenderIcon.svg"
                        alt="progress"
                        objectFit="contain"
                      />
                    </Box>
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      whiteSpace="normal"
                      wordBreak="break-word"
                    >
                      Available Immediately
                    </Text>
                  </HStack>
                </Box>
              </Box>
            </Box>

            {showSkillsSection && (
              <Box display="flex" flexDirection="row" gap={2} flexWrap="wrap">
                {visibleSkills.map((skill, index) => (
                  <Box
                    key={index}
                    bg="#FFB3AC"
                    color="#000000"
                    borderRadius="xl"
                    py={2}
                    px={3}
                    fontSize="12px"
                    fontWeight="400"
                  >
                    {skill}
                  </Box>
                ))}

                {hasMoreSkills && (
                  <Box
                    bg="#FFB3AC"
                    color="#000000"
                    borderRadius="xl"
                    py={2}
                    px={3}
                    fontSize="12px"
                    fontWeight="400"
                    cursor="pointer"
                    position="relative"
                    _hover={{
                      bg: "#FFB3AC",
                    }}
                    title={remainingSkills.join(", ")}
                  >
                    +{remainingSkills.length}
                  </Box>
                )}
              </Box>
            )}
          </Box>

          <Button
            variant="student"
            w="full"
            py={6}
            mt={4}
            onClick={handleViewFullProfile}
            disabled={!student.id || disableViewFullProfile || isMatched}
          >
            View Full Profile
          </Button>
        </Box>
      </Box>

      {showFullProfile && student.id && (
        <FullProfileCard
          profileId={student.id.toString()}
          profileType="student"
          opportunityId={opportunityId || ""}
          onClose={() => setShowFullProfile(false)}
        />
      )}

      {showAddToFolderModal && student.id && !isInFolder && (
        <AddToFolderModal
          isOpen={showAddToFolderModal}
          onClose={() => setShowAddToFolderModal(false)}
          userId={student.id.toString()}
          userName={getDisplayName()}
          onAddToFolder={() => setClickBackground(true)}
          onResetBackground={() => setClickBackground(false)}
          memberType="student"
        />
      )}

      {deleteModal && (
        <DeleteModal
          isOpen={deleteModal}
          onClose={() => setDeleteModal(false)}
          onDelete={() => onRemoveFromFolder?.()}
          InFolder={true}
          onResetBackground={() => setClickBackground(false)}
        />
      )}
    </>
  );
}
