import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Avatar,
  Grid,
  GridItem,
  Link,
  Alert,
} from "@chakra-ui/react";
import { StudentProfile, OrganisationProfile } from "@/types/discovery";
import {
  useStudentProfile,
  usePartnerProfile,
  useCoordinatorViewUserProfile,
} from "@/services/shared";
import Image from "next/image";
import BadgeSection from "@/components/BadgeSection";
import { ContactPage } from "@/components/ui/ContactPage";
import { Globe } from "lucide-react";
import Loader from "@/components/Loader";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/tooltip";

const getQuestionnaireFieldLabel = (fieldName: string): string => {
  return fieldName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

interface FullProfileCardProps {
  profileId: string;
  profileType: "student" | "organisation";
  onClose?: () => void;
  isModal?: boolean;
  studentProfile?: StudentProfile;
  organisationProfile?: OrganisationProfile;
  disableBtns?: boolean;
  opportunityId?: string;
  isCoordinator?: boolean;
}

export function FullProfileCard({
  profileId,
  profileType,
  onClose,
  isModal = true,
  studentProfile,
  organisationProfile,
  disableBtns = false,
  opportunityId,
  isCoordinator = false,
}: FullProfileCardProps) {
  const shouldFetchStudent =
    profileType === "student" && !studentProfile && !isCoordinator;
  const shouldFetchPartner =
    profileType === "organisation" && !organisationProfile && !isCoordinator;
  const { userProfile, getUserType } = useAuthStore();
  const userType = getUserType();

  const {
    data: studentData,
    isLoading: isStudentLoading,
    error: studentError,
  } = useStudentProfile(
    shouldFetchStudent ? profileId : "",
    opportunityId || ""
  );

  const {
    data: partnerData,
    isLoading: isPartnerLoading,
    error: partnerError,
  } = usePartnerProfile(
    shouldFetchPartner ? profileId : "",
    opportunityId || ""
  );

  const {
    data: coordinatorData,
    isLoading: isCoordinatorLoading,
    error: coordinatorError,
  } = useCoordinatorViewUserProfile(
    isCoordinator ? profileId : "",
    isCoordinator ? opportunityId || "" : ""
  );

  const isLoading = isCoordinator
    ? isCoordinatorLoading
    : isStudentLoading || isPartnerLoading;
  const error = isCoordinator ? coordinatorError : studentError || partnerError;
  const profile = isCoordinator
    ? coordinatorData?.data
    : profileType === "student"
      ? studentProfile || studentData
      : organisationProfile || partnerData;

  if (isLoading) {
    if (isModal) {
      return (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1000}
        >
          <Box
            bg="white"
            borderRadius="xl"
            p={8}
            maxW="md"
            w="90%"
            textAlign="center"
          >
            <Loader size="xl" color="blue.500" />
            <Text mt={4}>Loading profile...</Text>
          </Box>
        </Box>
      );
    }
    return (
      <Box textAlign="center" p={8}>
        <Loader size="xl" color="blue.500" />
        <Text mt={4}>Loading profile...</Text>
      </Box>
    );
  }

  if (error || !profile) {
    if (isModal) {
      return (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1000}
          onClick={onClose}
        >
          <Box
            bg="white"
            borderRadius="xl"
            p={8}
            maxW="md"
            w="90%"
            onClick={(e) => e.stopPropagation()}
          >
            <Alert.Root status="error">
              <Alert.Content>
                <Alert.Title>Error</Alert.Title>
                <Alert.Indicator />
                <Alert.Description>
                  Failed to load profile. Please try again.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
            <Button mt={4} onClick={onClose} w="full">
              Close
            </Button>
          </Box>
        </Box>
      );
    }
    return (
      <Alert.Root status="error">
        <Alert.Content>
          <Alert.Title>Error</Alert.Title>
          <Alert.Indicator />
          <Alert.Description>
            Failed to load profile. Please try again.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  const profileContent = (
    <Box>
      <VStack gap={6} align="stretch">
        {profileType === "student" ? (
          <RenderStudentDetails
            student={profile as StudentProfile}
            disableBtns={disableBtns}
            userProfile={userProfile as OrganisationProfile}
            opportunityId={opportunityId}
            userType={userType}
          />
        ) : (
          <RenderPartnerDetails
            organisation={profile as OrganisationProfile}
            disableBtns={disableBtns}
            opportunityId={opportunityId}
            userType={userType}
          />
        )}
      </VStack>
    </Box>
  );

  if (isModal) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.600"
        display="flex"
        alignItems="center"
        justifyContent="center"
        zIndex={1000}
        onClick={onClose}
      >
        <Box
          bg="white"
          borderRadius="20px"
          w="90%"
          boxShadow="0px 5.92px 11.84px 5.92px #00000040"
          maxW="1000px"
          maxH={{ base: "85vh", lg: "75vh" }}
          overflow="auto"
          mt={{ base: "80px", lg: "128px" }}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          css={{
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
          onClick={(e) => e.stopPropagation()}
          position="relative"
        >
          <Button
            position="sticky"
            zIndex={1000}
            size="sm"
            variant="ghost"
            w="100%"
            display="flex"
            justifyContent="end"
            onClick={onClose}
            pr={4}
            pt={4}
            bg="white"
            borderRadius="full"
            ml="auto"
            mb={-10}
          >
            <Image
              src="/assets/cancel.svg"
              alt="Close"
              width={25}
              height={25}
            />
          </Button>
          {profileContent}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      bg="white"
      borderRadius="20px"
      w="100%"
      boxShadow="0px 5.92px 11.84px 5.92px #00000040"
      overflow="auto"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
      css={{
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      {profileContent}
    </Box>
  );
}

const RenderStudentDetails = ({
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
              {student.course_name || "Student"}
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
          {student.course_name && (
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
                {student.course_name} <br />
                {student.course_progression}
              </Text>
            </HStack>
          )}

          {student.location && (
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
                  src="/assets/locationIcon.svg"
                  alt="location"
                  style={{ objectFit: "contain" }}
                />
              </Box>
              <Text fontSize="sm" color="gray.600">
                {student.location}
              </Text>
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
                  alt="specialization"
                  style={{ objectFit: "contain" }}
                />
              </Box>
              <Text fontSize="sm" color="gray.600">
                {student.credentials.join(", ")}
              </Text>
            </HStack>
          )}

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
                src="/assets/calenderIcon.svg"
                alt="progress"
                fill
                style={{ objectFit: "contain" }}
              />
            </Box>
            <Text fontSize="sm" color="gray.600">
              Available Immediately
            </Text>
          </HStack>
        </Grid>

        <VStack gap={4} w="full" align="start">
          <BadgeSection
            title="Open to Work Locations"
            items={student.preferred_location}
            withinDistance={student.within_distance_km}
            showFallback={true}
            fallbackText={student.location || "Not specified"}
          />

          <BadgeSection title="Specialization" items={student.specialization} />

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

const RenderPartnerDetails = ({
  organisation,
  disableBtns,
  opportunityId,
  userType,
}: {
  organisation: OrganisationProfile;
  disableBtns: boolean;
  opportunityId?: string;
  userType?: string;
}) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const getCompanyLogo = () => {
    if (organisation.logo_url) {
      return organisation.logo_url;
    } else {
      return organisation.profile_picture_url || "";
    }
  };
  return (
    <Box
      w="full"
      h="full"
      display="flex"
      flexDirection={{ base: "column", lg: "row" }}
      px={{ base: 4, lg: 16 }}
      py={{ base: 10, lg: 12 }}
      gap={{ base: 4, lg: 8 }}
    >
      <Box
        display="flex"
        gap={{ base: 4, lg: 8 }}
        alignItems={{ base: "center" }}
        flexDirection={{ base: "column" }}
        w="full"
        maxW={{ base: "full", lg: "40%" }}
        pt={{ base: 6, lg: 0 }}
      >
        <VStack
          flexShrink={0}
          alignItems={{ base: "center" }}
          w="full"
          maxW={{ base: "full", lg: "40%" }}
          h={{ base: "auto", lg: "200px" }}
        >
          <Text
            fontSize="20px"
            mb={6}
            fontWeight="bold"
            color="black"
            display={{ base: "block", lg: "none" }}
          >
            Organisation Profile
          </Text>
          <Avatar.Root
            w={{ base: "180px", lg: "200px" }}
            h={{ base: "180px", lg: "200px" }}
            border="6px solid #22C55E"
          >
            <Avatar.Image src={getCompanyLogo() || ""} />
            <Avatar.Fallback
              name={organisation.first_name + " " + organisation.last_name}
              bg="gray.200"
              color="gray.800"
              fontSize="2xl"
              fontWeight="bold"
            />
          </Avatar.Root>
        </VStack>
        <Box
          w="full"
          borderRadius="10px"
          p={6}
          maxW={{ base: "full" }}
          h="fit-content"
          background="linear-gradient(180deg, #089C3F 0%, #FFFFFF 23.56%, #FFFFFF 37.02%, #FFFFFF 69.71%);"
          boxShadow="0px 3.37px 6.74px 3.37px rgba(0, 0, 0, 0.25)"
        >
          <Text fontSize="24px" fontWeight="bold" mb={4} textAlign="left">
            Connected Industry Partner Profile
          </Text>
          <Text
            fontSize="14px"
            color="black"
            mb={6}
            textAlign="left"
            opacity={0.9}
          >
            Discover Industry Partner Profiles that are connected to this
            organisation
          </Text>

          <VStack
            gap={3}
            align="stretch"
            maxH="250px"
            overflowX="hidden"
            overflowY="auto"
          >
            {organisation.members?.map((person, index) => (
              <HStack key={index} gap={3} align="center">
                <Avatar.Root w="40px" h="40px" borderRadius="50%">
                  <Avatar.Image src={person.profile_picture_url || undefined} />
                  <Avatar.Fallback
                    name={person.first_name + " " + person.last_name}
                    color="grey"
                    fontSize="14px"
                    fontWeight="bold"
                  />
                </Avatar.Root>
                <VStack align="start" gap={0} flex={1}>
                  <Text
                    fontSize="14px"
                    fontWeight="600"
                    w="300px"
                    color="black"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    // textOverflow="ellipsis"
                  >
                    {person.first_name + " " + person.last_name}
                  </Text>
                  <Text
                    fontSize="12px"
                    fontWeight="300"
                    w="350px"
                    color="black"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {person.role}
                  </Text>
                </VStack>
              </HStack>
            ))}
          </VStack>
        </Box>
      </Box>

      <Box
        display="flex"
        gap={{ base: 4, lg: 8 }}
        flexDirection={{ base: "column" }}
        flex={1}
        w="full"
        // alignItems={{ base: "center", lg: "end" }}
      >
        <VStack align="start" gap={2} flex={1} w="full" maxW={{ base: "full" }}>
          <Text
            fontSize="24px"
            mb={6}
            fontWeight="bold"
            color="black"
            display={{ base: "none", lg: "block" }}
          >
            Organisation Profile
          </Text>
          <Heading fontSize="30px" fontWeight="bold" mb={2} color="black">
            {organisation.name || "-"}
          </Heading>

          {organisation.location && (
            <HStack gap={2} align="center">
              <Image
                src="/assets/locationIcon.svg"
                alt="location"
                width={16}
                height={16}
              />
              <Text fontSize="14px" color="black">
                {organisation.location}
              </Text>
            </HStack>
          )}

          {organisation.website && (
            <HStack gap={2} align="center">
              <Globe size={16} color="#C3C3C3" />
              <Link
                href={organisation.website}
                target="_blank"
                fontSize="14px"
                color="blue.500"
                textDecoration="underline"
              >
                {organisation.website}
              </Link>
            </HStack>
          )}

          <HStack gap={2} align="center">
            <Box
              w="12px"
              h="12px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
              pos={"relative"}
            >
              <Image
                src="/assets/calenderIcon.svg"
                alt="progress"
                fill
                style={{ objectFit: "contain" }}
              />
            </Box>
            <Text fontSize="14px" color="black">
              Available Immediately
            </Text>
          </HStack>
        </VStack>

        <VStack
          gap={6}
          align="stretch"
          flex={1}
          w="full"
          maxW={{ base: "full" }}
        >
          {organisation.sector && (
            <BadgeSection
              title="Sector"
              items={organisation.sector}
              badgeProps={{
                bg: "#BBF7D0",
              }}
              titleProps={{
                fontSize: "20px",
                fontWeight: "600",
                color: "black",
                mb: 3,
              }}
            />
          )}

          {organisation.industry && (
            <BadgeSection
              title="Sector Type"
              items={organisation.industry}
              badgeProps={{
                bg: "#BBF7D0",
              }}
              titleProps={{
                fontSize: "20px",
                fontWeight: "600",
                color: "black",
                mb: 3,
              }}
            />
          )}

          {organisation.company_size && (
            <BadgeSection
              title="Company Size"
              items={organisation.company_size}
              badgeProps={{
                bg: "#BBF7D0",
              }}
              titleProps={{
                fontSize: "20px",
                fontWeight: "600",
                color: "black",
                mb: 3,
              }}
            />
          )}

          {organisation.description && (
            <Box w="full">
              <Text fontSize="20px" fontWeight="600" color="black" mb={3}>
                About this Organisation
              </Text>
              <Text fontSize="14px" color="black" lineHeight="1.6" ml={4}>
                {organisation.description}
              </Text>
            </Box>
          )}

          <Box
            w="full"
            display="flex"
            flexDirection={{ base: "column", lg: "row" }}
            justifyContent="space-between"
            gap={{ base: 4, lg: 0 }}
          >
            <HStack gap={4} justify="start">
              {organisation.linkedin && (
                <Link href={organisation.linkedin} target="_blank">
                  <Image
                    src="/assets/linkedIn.svg"
                    alt="LinkedIn"
                    width={24}
                    height={24}
                  />
                </Link>
              )}
              {organisation.instagram && (
                <Link href={organisation.instagram} target="_blank">
                  <Image
                    src="/assets/instagram.svg"
                    alt="Instagram"
                    width={24}
                    height={24}
                  />
                </Link>
              )}
              {organisation.bluesky && (
                <Link href={organisation.bluesky} target="_blank">
                  <Image
                    src="/assets/bluesky.svg"
                    alt="Bluesky"
                    width={24}
                    height={24}
                  />
                </Link>
              )}
              {organisation.allow_contact && (
                <Box
                  cursor="pointer"
                  onClick={() => {
                    if (!disableBtns && userType != "coordinator")
                      setShowContactModal(true);
                  }}
                >
                  <Image
                    src="/assets/mailicon.svg"
                    alt="Email"
                    width={24}
                    height={24}
                  />
                </Box>
              )}
            </HStack>
            {organisation.allow_contact && (
              <Button
                variant="partner"
                borderRadius="40px"
                py={2}
                px={4}
                fontSize="12px"
                fontWeight="400"
                w="100%"
                display="flex"
                justifyContent="center"
                maxW="200px"
                disabled={disableBtns || userType === "coordinator"}
                onClick={() => setShowContactModal(true)}
              >
                Contact
              </Button>
            )}
          </Box>
        </VStack>
      </Box>

      {showContactModal && organisation.id && (
        <ContactPage
          recipientId={organisation.id}
          organisationId={organisation.id.toString()}
          acceptedOpportunityId={opportunityId}
          recipientName={
            organisation.name ||
            `${organisation.first_name} ${organisation.last_name}`
          }
          profileType="organisation"
          onBack={() => setShowContactModal(false)}
        />
      )}
    </Box>
  );
};
