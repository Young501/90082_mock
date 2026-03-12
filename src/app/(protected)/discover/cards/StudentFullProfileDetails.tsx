"use client";

import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Avatar,
  Flex,
  Badge,
  Link,
  IconButton,
} from "@chakra-ui/react";
import { StudentProfile, OrganisationProfile } from "@/types/discovery";
import Image from "next/image";
import { ContactPage } from "@/components/ContactPage";
import {
  FileText,
  Download,
  ExternalLink,
  Link as LinkIcon,
  MapPin,
  ChevronDown,
  GraduationCap,
  MessageCircle,
  FolderPlus,
  Linkedin,
} from "lucide-react";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { useOpportunityDetail } from "@/services/shared";
import { AddToFolderModal } from "../../folders/modals/AddToFolderModal";

const getQuestionnaireFieldLabel = (fieldName: string): string => {
  return fieldName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

function getResumeDisplayName(url: string): string {
  try {
    const path = new URL(url).pathname;
    const filename = path.split("/").filter(Boolean).pop();
    return filename ? decodeURIComponent(filename) : "CV / Resume";
  } catch {
    return "CV / Resume";
  }
}

function getLinkDisplayText(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return (
      parsed.hostname.replace(/^www\./, "") +
        parsed.pathname.replace(/\/$/, "") || url
    );
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
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

function getUniversityName(student: StudentProfile): string {
  const u = student.university;
  if (typeof u === "string") return u;
  return u?.name ?? "";
}

export const RenderStudentDetails = ({
  student,
  disableBtns,
  userProfile,
  opportunityId,
  opportunitySlug,
  userType,
}: {
  student: StudentProfile;
  disableBtns: boolean;
  userProfile: OrganisationProfile;
  opportunityId?: string;
  opportunitySlug?: string;
  userType?: string;
}) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const { data: opportunity } = useOpportunityDetail(opportunityId || "");

  const [showAddToFolderModal, setShowAddToFolderModal] = useState(false);

  const resumeUrl =
    student.resume_url ?? (student as { resume?: string }).resume;
  const preferredLocations = getPreferredLocations(student);
  const courseStream = getCourseStreamLabel(student);
  const universityName = getUniversityName(student);
  const interestedAreas =
    (student.questionnaire_answers?.sector as string[] | undefined) ?? [];

  const academicLine = [universityName, courseStream, student.progression]
    .filter(Boolean)
    .join(", ");

  return (
    <Box
      w="full"
      h="full"
      px={{ base: 4, md: 6, lg: 10 }}
      py={{ base: 5, md: 8, lg: 10 }}
    >
      <Box
        position="relative"
        bg="#0A425F"
        backgroundImage="url('/assets/profileBackgroundWaves.svg')"
        backgroundSize="auto"
        backgroundRepeat="repeat"
        borderRadius="12px"
        overflow="hidden"
        px={{ base: 4, md: 6, lg: "60px" }}
        py={{ base: 4, md: 6, lg: 10 }}
      >
        <Flex
          direction={{ base: "column", lg: "row" }}
          align="center"
          gap={{ base: 4, md: 6 }}
          position="relative"
        >
          <HStack
            w="full"
            align="stretch"
            // justify={{ base: "center", xl: "space-between" }}
            justify="space-between"
          >
            <Avatar.Root
              w={{ base: "72px", md: "100px", lg: "114px" }}
              h={{ base: "72px", md: "100px", lg: "114px" }}
              flexShrink={0}
              border="1.2px solid #FFFFFF"
              borderRadius={{ base: "19.2px", md: "30.4px" }}
            >
              <Avatar.Image
                src={student.profile_picture_url || ""}
                borderRadius={{ base: "19.2px", md: "30.4px" }}
              />
              <Avatar.Fallback
                name={`${student.first_name} ${student.last_name}`}
                bg="whiteAlpha.400"
                color="white"
                fontSize={{ base: "12px", md: "16px", lg: "24px" }}
                fontWeight="bold"
                borderRadius={{ base: "19.2px", md: "30.4px" }}
              />
            </Avatar.Root>
            <Flex
              flex={1}
              direction="column"
              gap={{ base: 1, md: 2 }}
              align="flex-start"
              textAlign="left"
            >
              <Heading
                fontSize={{ base: "xl", md: "3xl" }}
                fontWeight="bold"
                color="white"
                textTransform="capitalize"
                lineHeight="38px"
              >
                {student.first_name} {student.last_name}
              </Heading>
              {academicLine && (
                <HStack gap={1} align="start" color="#FAFAFA">
                  <IconButton
                    variant="ghost"
                    size="sm"
                    h="fit-content"
                    minW="fit-content"
                  >
                    <GraduationCap size={14} color="#FAFAFA" />
                  </IconButton>
                  <Text fontSize="sm" color="">
                    {academicLine}
                  </Text>
                </HStack>
              )}
              {student.location && (
                <HStack gap={1} align="center" color="#FAFAFA" fontSize="sm">
                  <IconButton
                    variant="ghost"
                    size="sm"
                    h="fit-content"
                    color="#FAFAFA"
                    minW="fit-content"
                  >
                    <MapPin size={14} />
                  </IconButton>

                  <Text>{student.location}</Text>
                  {student.distance_km != null && student.distance_km !== 0 && (
                    <Text opacity={0.9}>({student.distance_km} km)</Text>
                  )}
                </HStack>
              )}
            </Flex>
          </HStack>

          <HStack
            gap={3}
            // align="flex-end"
            // alignSelf={{ base: "center", md: "end" }}
            // justifyContent={{ base: "center", md: "flex-end" }}
            justifyContent="end"
            flexShrink={0}
            flex={1}
            // w="full"
          >
            <ButtonV2
              variant="primary"
              icon={<MessageCircle size={16} />}
              iconPosition="start"
              h="40px"
              w={{ base: "50%", md: "fit-content" }}
              size="sm"
              onClick={() => setShowContactModal(true)}
              disabled={disableBtns || userType === "coordinator"}
            >
              Contact Student
            </ButtonV2>
            {opportunitySlug && (
              <ButtonV2
                variant="secondary"
                icon={<FolderPlus size={16} />}
                iconPosition="start"
                h="40px"
                w={{ base: "50%", md: "fit-content" }}
                disabled={disableBtns || userType === "coordinator"}
                onClick={() => setShowAddToFolderModal(true)}
              >
                Add to Folder
              </ButtonV2>
            )}
          </HStack>
        </Flex>
      </Box>

      <Box
        py={6}
        display="flex"
        flexDirection={{ base: "column", lg: "row" }}
        gap={6}
      >
        {/* Left column */}
        <VStack
          align="stretch"
          gap={4}
          w={{ base: "full", lg: "50%" }}
          flex={1}
        >
          <VStack
            gap={4}
            align="stretch"
            borderRadius="12px"
            border="1px solid #E4E4E7"
            p={5}
          >
            {resumeUrl && typeof resumeUrl === "string" && (
              <Box>
                <Text fontSize="md" fontWeight="600" color="#18181B" mb={3}>
                  CV
                </Text>
                <Link
                  href={
                    resumeUrl.startsWith("http")
                      ? resumeUrl
                      : `https://${resumeUrl}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  _hover={{ textDecoration: "none" }}
                  w="full"
                >
                  <Flex
                    align="center"
                    justify="space-between"
                    gap={3}
                    px={3}
                    py={3}
                    bg="#F4F4F5"
                    borderRadius="12px"
                    w="full"
                    h="54px"
                  >
                    <Flex align="center" gap={3} minW={0}>
                      <FileText fontWeight="bold" size={20} color="#27272A" />
                      <Text fontSize="sm" color="black" truncate>
                        {getResumeDisplayName(resumeUrl)}
                      </Text>
                    </Flex>
                    <Box flexShrink={0}>
                      <Download size={18} color="#27272A" />
                    </Box>
                  </Flex>
                </Link>
              </Box>
            )}

            {student.linkedin && (
              <Box>
                <Text fontSize="md" fontWeight="600" color="#18181B" mb={3}>
                  LinkedIn
                </Text>
                <Link
                  href={
                    student.linkedin.startsWith("http")
                      ? student.linkedin
                      : `https://${student.linkedin}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  _hover={{ textDecoration: "none" }}
                  w="full"
                >
                  <Flex
                    align="center"
                    justify="space-between"
                    gap={3}
                    px={4}
                    py={3}
                    bg="#F4F4F5"
                    borderRadius="12px"
                    w="full"
                    h="54px"
                    // _hover={{ bg: "#EEEEEE" }}
                  >
                    <Flex align="center" gap={3} minW={0}>
                      <Linkedin size={20} color="#27272A" />
                      <Text fontSize="sm" color="black" truncate>
                        {getLinkDisplayText(student.linkedin)}
                      </Text>
                    </Flex>
                    <Box flexShrink={0}>
                      <ExternalLink size={18} color="#27272A" />
                    </Box>
                  </Flex>
                </Link>
              </Box>
            )}

            {student.homepage && (
              <Box w="full">
                <Text fontSize="md" fontWeight="600" color="#18181B" mb={3}>
                  Portfolio
                </Text>
                <Link
                  href={
                    student.homepage.startsWith("http")
                      ? student.homepage
                      : `https://${student.homepage}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  _hover={{ textDecoration: "none" }}
                  w="full"
                >
                  <Flex
                    align="center"
                    justify="space-between"
                    gap={3}
                    px={4}
                    py={3}
                    bg="#F4F4F5"
                    borderRadius="12px"
                    w="full"
                    h="54px"
                  >
                    <Flex align="center" gap={3} minW={0}>
                      <LinkIcon fontWeight="bold" size={20} color="#27272A" />
                      <Text fontSize="sm" color="black" truncate>
                        {getLinkDisplayText(student.homepage)}
                      </Text>
                    </Flex>
                    <Box flexShrink={0}>
                      <ExternalLink size={18} color="#27272A" />
                    </Box>
                  </Flex>
                </Link>
              </Box>
            )}
          </VStack>

          <VStack
            gap={4}
            align="stretch"
            borderRadius="12px"
            border="1px solid #E4E4E7"
            p={5}
          >
            {student.skills && student.skills.length > 0 && (
              <Box>
                <Text fontSize="md" fontWeight="600" color="#18181B" mb={3}>
                  Skills
                </Text>
                <Flex gap={2} flexWrap="wrap">
                  {student.skills.map((skill, index) => (
                    <Box
                      key={index}
                      bg="#F3E8FF"
                      color="#641BA3"
                      borderRadius="4px"
                      py={1.5}
                      px={2}
                      fontSize="sm"
                      fontWeight="400"
                      boxShadow="0px 0px 1px 0px #641BA3 inset"
                    >
                      {skill}
                    </Box>
                  ))}
                </Flex>
              </Box>
            )}

            {interestedAreas.length > 0 && (
              <Box>
                <Text fontSize="md" fontWeight="600" color="#18181B" mb={3}>
                  Interested areas
                </Text>
                <Flex gap={2} flexWrap="wrap">
                  {interestedAreas.map((area, index) => (
                    <Box
                      key={index}
                      bg="#DCFCE7"
                      color="#116932"
                      borderRadius="4px"
                      py={1.5}
                      px={2}
                      fontSize="sm"
                      fontWeight="400"
                      boxShadow="0px 0px 1px 0px #27272A inset"
                    >
                      {area}
                    </Box>
                  ))}
                </Flex>
              </Box>
            )}
          </VStack>
          <VStack
            gap={4}
            align="stretch"
            borderRadius="12px"
            border="1px solid #E4E4E7"
            p={5}
          >
            {(preferredLocations.length > 0 || student.location) && (
              <Box>
                <Text fontSize="md" fontWeight="600" color="#18181B" mb={3}>
                  Open to work locations
                </Text>
                <Flex gap={2} flexWrap="wrap">
                  {(preferredLocations.length > 0
                    ? preferredLocations
                    : [student.location]
                  )
                    .filter(Boolean)
                    .map((location, index) => (
                      <Box
                        key={index}
                        bg="#DBEAFE"
                        color="#173DA6"
                        borderRadius="4px"
                        py={1.5}
                        px={2}
                        fontSize="sm"
                        fontWeight="400"
                        boxShadow="0px 0px 1px 0px #173DA6 inset"
                      >
                        {location}
                      </Box>
                    ))}
                </Flex>
              </Box>
            )}
          </VStack>
        </VStack>

        {/* Right column */}
        <VStack
          align="stretch"
          gap={4}
          w={{ base: "full", lg: "50%" }}
          flex={1}
        >
          {student.questionnaire_answers &&
            Object.keys(student.questionnaire_answers).length > 0 && (
              <VStack
                gap={4}
                align="stretch"
                borderRadius="12px"
                border="1px solid #E4E4E7"
              >
                <Box>
                  <Text
                    fontSize="md"
                    fontWeight="600"
                    color="#18181B"
                    p={5}
                    borderBottom="1px solid #E4E4E7"
                  >
                    Enrollment Answers
                  </Text>
                  <VStack align="stretch" gap={4} p={5}>
                    {Object.entries(student.questionnaire_answers).map(
                      ([field, value]) => {
                        const label = getQuestionnaireFieldLabel(field);
                        const displayValue = Array.isArray(value)
                          ? value.join(", ")
                          : typeof value === "string"
                            ? value
                            : String(value ?? "");
                        if (!displayValue) return null;
                        return (
                          <Box key={field}>
                            <Text
                              fontSize="xs"
                              color="#71717A"
                              mb={1}
                              fontWeight="500"
                            >
                              {label}
                            </Text>
                            <Box
                              px={3}
                              py={2}
                              bg="#F4F4F5"
                              borderRadius="6px"
                              fontSize="sm"
                              color="black"
                            >
                              {displayValue}
                            </Box>
                          </Box>
                        );
                      }
                    )}
                  </VStack>
                </Box>
              </VStack>
            )}

          <VStack
            gap={4}
            align="stretch"
            borderRadius="12px"
            border="1px solid #E4E4E7"
            p={5}
          >
            {(universityName ||
              courseStream ||
              student.degree ||
              student.specialisations) && (
              <Box>
                <Text fontSize="md" fontWeight="600" color="#18181B" mb={4}>
                  Education
                </Text>
                <VStack align="stretch" gap={2}>
                  {(courseStream || student.degree) && (
                    <Text fontSize="sm" fontWeight="600" color="black">
                      {[courseStream, student.degree]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  )}
                  {student.specialisations &&
                    (Array.isArray(student.specialisations)
                      ? student.specialisations
                      : [student.specialisations]
                    )
                      .filter(Boolean)
                      .map((s, i) => (
                        <Text key={i} fontSize="sm" color="#52525B">
                          {s}
                        </Text>
                      ))}
                  {universityName && (
                    <Text fontSize="sm" color="#52525B">
                      {universityName}
                    </Text>
                  )}
                </VStack>
              </Box>
            )}
          </VStack>
        </VStack>
      </Box>

      {showAddToFolderModal && student.id && opportunitySlug && (
        <AddToFolderModal
          isOpen={showAddToFolderModal}
          onClose={() => setShowAddToFolderModal(false)}
          userId={student.id}
          userName={student.first_name + " " + student.last_name || "Student"}
          opportunitySlug={opportunitySlug}
          memberType="student"
        />
      )}

      {showContactModal && student.id && (
        <ContactPage
          recipientId={student.id}
          recipientName={`${student.first_name} ${student.last_name}`}
          profileType="student"
          organisationName={userProfile?.organisation?.name || ""}
          organisationContact={userProfile?.organisation?.contact_email || ""}
          onBack={() => setShowContactModal(false)}
          acceptedOpportunityId={opportunityId}
        />
      )}
    </Box>
  );
};
