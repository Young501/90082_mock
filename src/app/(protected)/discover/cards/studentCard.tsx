import React from "react";
import { Box, VStack, HStack, Text, Card, Avatar } from "@chakra-ui/react";
import { StudentProfile } from "@/types/discovery";

interface StudentCardProps {
  student: StudentProfile;
}

export function StudentCard({ student }: StudentCardProps) {
  const getDisplayName = () => {
    const firstName = student.first_name || "";
    const lastName = student.last_name || "";
    return `${firstName} ${lastName}`.trim() || "No name provided";
  };

  const getProfileImage = () => {
    return student.profile_picture_url || null;
  };

  return (
    <Card.Root
      p={4}
      bg="white"
      borderRadius="md"
      border="1px solid"
      borderColor="gray.200"
    >
      <Card.Body>
        <HStack align="start" gap={4}>
          <Box flexShrink={0}>
            <Avatar.Root size="md">
              <Avatar.Fallback name={getDisplayName()} />
              {getProfileImage() && (
                <Avatar.Image
                  src={getProfileImage()!}
                  onError={(e) => {
                    console.error("Failed to load image:", getProfileImage());
                    console.error("Error details:", e);
                  }}
                  onLoad={() => {
                    console.log(
                      "Image loaded successfully:",
                      getProfileImage()
                    );
                  }}
                />
              )}
            </Avatar.Root>
          </Box>

          <VStack align="start" flex={1} gap={2}>
            <Text fontWeight="bold" fontSize="lg">
              {getDisplayName()}
            </Text>

            {student.location && (
              <Text fontSize="sm" color="gray.600">
                📍 {student.location}
              </Text>
            )}

            {student.course_name && (
              <Text fontSize="sm">
                <Text as="span" fontWeight="medium">
                  Course:
                </Text>{" "}
                {student.course_name}
              </Text>
            )}

            {student.specialization && (
              <Text fontSize="sm">
                <Text as="span" fontWeight="medium">
                  Specialization:
                </Text>{" "}
                {Array.isArray(student.specialization)
                  ? student.specialization.join(", ")
                  : student.specialization}
              </Text>
            )}

            {student.course_progression && (
              <Text fontSize="sm">
                <Text as="span" fontWeight="medium">
                  Progress:
                </Text>{" "}
                {student.course_progression}
              </Text>
            )}
          </VStack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}
