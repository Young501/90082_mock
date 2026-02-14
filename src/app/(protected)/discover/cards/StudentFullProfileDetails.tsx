import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Avatar,
  Grid,
  Link,
} from "@chakra-ui/react";
import { StudentProfile, OrganisationProfile } from "@/types/discovery";

import Image from "next/image";
import BadgeSection from "@/components/BadgeSection";
import { ContactPage } from "@/components/ContactPage";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";

const getQuestionnaireFieldLabel = (fieldName: string): string => {
  return fieldName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export const RenderStudentDetails = ({
  student,
  disableBtns,
  userProfile,
  opportunityId,
  userType,
}: {
  student: StudentProfile;
  disableBtns: boolean;
  userProfile: OrganisationProfile;
  opportunityId?: string;
  userType?: string;
}) => {
  const [showContactModal, setShowContactModal] = useState(false);
  return (
    <Box
      w="full"
      h="full"
      display="flex"
      flexDirection={{ base: "column", lg: "row" }}
      gap={{ base: 6, lg: 20 }}
      px={{ base: 4, lg: 16 }}
      py={{ base: 10, lg: 12 }}
    >
      <VStack gap={6} align="start" w={{ base: "full", lg: "40%" }}>
        <Box
          display="flex"
          gap={2}
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          w="full"
        >
          <Avatar.Root
            w="180px"
            h="180px"
            border={"6px solid #DC2626"}
            borderRadius="50%"
          >
            <Avatar.Image src={student.profile_picture_url || ""} />
            <Avatar.Fallback
              name={student.first_name + " " + student.last_name}
              bg="gray.200"
              color="gray.800"
              fontSize="2xl"
              fontWeight="bold"
            />
          </Avatar.Root>
          <VStack gap={2} flex={1} w="full">
            <Heading
              fontSize="23px"
              fontWeight="bold"
              textTransform="capitalize"
            >
              {student.first_name + " " + student.last_name}
            </Heading>
            <Text fontSize="14px" fontWeight="400" textTransform="capitalize">
              {"Student"}
            </Text>
          </VStack>
        </Box>

        <VStack justify="start" w="full" gap={2} align="start">
          {student.homepage && (
            <Box display="flex" gap={2} alignItems="center">
              <Globe
                size={25}
                style={{ color: "#C3C3C3", fontWeight: "600" }}
              />
              <Link href={student.homepage} target="_blank">
                <Text textDecoration="underline">
                  {student?.homepage || "-"}
                </Text>
              </Link>
            </Box>
          )}
          {student.linkedin && (
            <Box display="flex" gap={2} alignItems="center">
              <Image
                src="/assets/linkedIn.svg"
                alt="LinkedIn"
                width={24}
                height={24}
              />
              <Link href={student.linkedin} target="_blank">
                <Text textDecoration="underline">LinkedIn</Text>
              </Link>
            </Box>
          )}
          {student.instagram && (
            <Box display="flex" gap={2} alignItems="start">
              <Image
                src="/assets/instagram.svg"
                alt="Instagram"
                width={20}
                height={20}
                style={{ objectFit: "contain" }}
              />
              <Link href={student.instagram} target="_blank">
                <Text textDecoration="underline">Instagram</Text>
              </Link>
            </Box>
          )}
          {student.bluesky && (
            <Box display="flex" gap={2} alignItems="start">
              <Image
                src="/assets/bluesky.svg"
                alt="Bluesky"
                width={20}
                height={20}
              />
              <Link href={student.bluesky} target="_blank">
                <Text textDecoration="underline">Bluesky</Text>
              </Link>
            </Box>
          )}
        </VStack>
        <VStack
          gap={3}
          justify="center"
          w="full"
          alignSelf={{ base: "center", lg: "end" }}
        >
          <Button
            variant="student"
            borderRadius="40px"
            size="lg"
            px={8}
            w="100%"
            boxShadow="0px 3.34px 3.34px 0px #00000040"
            onClick={() => {
              if (student.resume_url) {
                window.open(student.resume_url, "_blank");
              }
            }}
            disabled={disableBtns}
          >
            View CV
          </Button>
          <Button
            variant="student"
            borderRadius="40px"
            size="lg"
            px={8}
            w="100%"
            boxShadow="0px 3.34px 3.34px 0px #00000040"
            onClick={() => setShowContactModal(true)}
            disabled={disableBtns || userType === "coordinator"}
          >
            Contact
          </Button>
        </VStack>
      </VStack>

      <Box
        w={{ base: "full", lg: "60%" }}
        pt={4}
        display="flex"
        flexDirection="column"
        gap={{ base: 4, lg: 8 }}
      >
        <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
          {student.degree && (
            <HStack gap={2} align="start">
              <Box
                w="12px"
                h="12px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
                pos="relative"
                mt={"5px"}
              >
                <Image
                  src="/assets/educationIcon.svg"
                  alt="course"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </Box>
              <Text fontSize="sm" color="gray.600">
                {student.faculty} <br />
                {student.course_stream} <br />
                {student.degree} <br />
                {student.progression}
              </Text>
            </HStack>
          )}

          {student.location && (
            <HStack align="flex-start" gap={2}>
              <Box
                w="16px"
                h="16px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
                mt="2px"
              >
                <Image
                  width={12}
                  height={12}
                  src="/assets/locationIcon.svg"
                  alt="location"
                  style={{ objectFit: "contain" }}
                />
              </Box>

              <Box>
                <Text
                  fontSize="sm"
                  color="gray.600"
                  whiteSpace="normal"
                  wordBreak="break-word"
                >
                  {student.location}
                </Text>

                {student.distance_km != undefined &&
                  student.distance_km != null && (
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      whiteSpace="normal"
                      wordBreak="break-word"
                    >
                      (
                      <Text as="span" fontWeight="semibold">
                        {student.distance_km} km
                      </Text>
                      )
                    </Text>
                  )}
              </Box>
            </HStack>
          )}

          {student.credentials && student.credentials.length > 0 && (
            <HStack gap={2} align="start">
              <Box
                w="20px"
                h="20px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Image
                  width={12}
                  height={12}
                  src="/assets/certificationIcon.svg"
                  alt="specialisations"
                  style={{ objectFit: "contain" }}
                />
              </Box>
              <Text fontSize="sm" color="gray.600">
                {student.credentials.join(", ")}
              </Text>
            </HStack>
          )}
        </Grid>

        <VStack gap={4} w="full" align="start">
          <BadgeSection
            title="Open to Work Locations"
            items={student.preferred_location}
            withinDistance={student.within_distance_km}
            showFallback={true}
            fallbackText={student.location || "Not specified"}
          />

          <BadgeSection
            title="specialisations"
            items={student.specialisations}
          />

          <BadgeSection title="Skills" items={student.skills} />

          <BadgeSection title="Available For" items={student.position_type} />

          {student.questionnaire_answers &&
            Object.keys(student.questionnaire_answers).length > 0 && (
              <Box w="full">
                <Text mb={3} fontSize="14px" fontWeight="600" color="black">
                  Opportunity Requirements
                </Text>
                <HStack
                  gap={3}
                  align="start"
                  w="full"
                  flexWrap="wrap"
                  flexDirection={{ base: "column", lg: "row" }}
                  justifyContent={{ base: "center", lg: "start" }}
                >
                  {Object.entries(student.questionnaire_answers).map(
                    ([field, value]) => (
                      <Box
                        key={field}
                        w="full"
                        display="flex"
                        gap={2}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        <BadgeSection
                          title={getQuestionnaireFieldLabel(field)}
                          items={value}
                          titleProps={{
                            fontSize: "sm",
                            color: "gray.600",
                            mb: 2,
                            ml: 3,
                          }}
                        />
                      </Box>
                    )
                  )}
                </HStack>
              </Box>
            )}
        </VStack>
      </Box>

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
