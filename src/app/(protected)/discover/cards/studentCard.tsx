import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  Avatar,
  Button,
  Heading,
} from "@chakra-ui/react";
import { StudentProfile } from "@/types/discovery";
import {
  locationIcon,
  emailIcon,
  addIcon,
  calenderIcon,
  educationIcon,
  certificationIcon,
} from "@/assets";
import Image from "next/image";

interface StudentCardProps {
  student: StudentProfile;
  userType: string;
}

export function StudentCard({ student, userType }: StudentCardProps) {
  const getDisplayName = () => {
    const firstName = student.first_name || "";
    // const lastName = student.last_name || "";
    return firstName;
    // return `${firstName} ${lastName}`.trim() || "No name provided";
  };

  const getProfileImage = () => {
    return student.profile_picture_url || null;
  };

  const getSkillsData = () => {
    if (
      !student.skills ||
      !Array.isArray(student.skills) ||
      student.skills.length === 0
    ) {
      return [];
    }

    return student.skills;
  };

  const skills = getSkillsData();
  const maxVisibleSkills = 2;
  const visibleSkills = skills.slice(0, maxVisibleSkills);
  const remainingSkills = skills.slice(maxVisibleSkills);
  const hasMoreSkills = remainingSkills.length > 0;
  const showSkillsSection = skills.length > 0;

  return (
    <Box
      bg="#D1D1D1"
      borderRadius="20px"
      border="1px solid"
      borderColor="gray.200"
      boxShadow="0px 3.37px 6.74px 3.37px rgba(0, 0, 0, 0.25)"
      overflow="hidden"
      position="relative"
      borderTopRightRadius="20px"
      w="100%"
    >
      <Box position="absolute" top={4} right={4} zIndex={1}>
        <Box
          w={6}
          h={6}
          bg="transparent"
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
        >
          <Image
            width={20}
            height={20}
            src={addIcon}
            alt="add"
            objectFit="contain"
          />
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
        gap={4}
      >
        <Box
          display="flex"
          flexDirection="row"
          gap={4}
          justifyContent="center"
          w="full"
        >
          <Box display="flex" flexDirection="column" gap={6}>
            <Box flexShrink={0} w="130px" h="130px">
              <Avatar.Root
                w="130px"
                h="130px"
                border="4px solid"
                borderColor="#DC2626"
                borderRadius="50%"
              >
                <Avatar.Fallback
                  name={getDisplayName()}
                  bg="blue.500"
                  color="white"
                  fontWeight="bold"
                  w="100%"
                  h="100%"
                />
                {getProfileImage() && (
                  <Avatar.Image src={getProfileImage()!} w="130px" h="130px" />
                )}
              </Avatar.Root>
            </Box>

            {student.availability && (
              <Box
                bg="#DC2626"
                color="white"
                borderRadius="2xl"
                py={2}
                px={4}
                fontSize="12px"
                fontWeight="400"
                w="100%"
                display="flex"
                justifyContent="center"
              >
                {student.availability}
              </Box>
            )}
          </Box>

          <Box display="flex" flexDirection="column" gap={6} w="full">
            <Box>
              <Heading
                fontSize="20px"
                textTransform="capitalize"
                mb={2}
                fontWeight="bold"
                color="#000000"
              >
                {getDisplayName()}
              </Heading>
              <Text
                fontSize="14px"
                textTransform="capitalize"
                fontWeight="400"
                color="#000000"
              >
                {userType}
              </Text>
            </Box>

            <Box display="flex" flexDirection="column" gap={2}>
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
                      src={educationIcon}
                      alt="course"
                      objectFit="contain"
                    />
                  </Box>
                  <Text fontSize="sm" color="gray.600">
                    {student.course_name}
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
                      src={locationIcon}
                      alt="location"
                      objectFit="contain"
                    />
                  </Box>
                  <Text fontSize="sm" color="gray.600">
                    {student.location}
                  </Text>
                </HStack>
              )}

              {student.specialization && (
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
                      src={certificationIcon}
                      alt="specialization"
                      objectFit="contain"
                    />
                  </Box>
                  <Text fontSize="sm" color="gray.600">
                    {Array.isArray(student.specialization)
                      ? student.specialization.join(", ")
                      : student.specialization}
                  </Text>
                </HStack>
              )}

              {student.course_progression && (
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
                      src={calenderIcon}
                      alt="progress"
                      objectFit="contain"
                    />
                  </Box>
                  <Text fontSize="sm" color="gray.600">
                    {student.course_progression}
                  </Text>
                </HStack>
              )}
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

        <Button
          w="full"
          bg="#DC2626"
          color="white"
          borderRadius="xl"
          py={6}
          fontSize="14px"
          fontWeight="bold"
        >
          View Full Profile
        </Button>
      </Box>
    </Box>
  );
}
