import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  Avatar,
  Grid,
  GridItem,
  Link,
  Spinner,
  Alert,
} from "@chakra-ui/react";
import { StudentProfile, PartnerProfile } from "@/types/discovery";
import { useStudentProfile, usePartnerProfile } from "@/services/shared";
import Image from "next/image";
import BadgeSection from "@/components/BadgeSection";
import { ContactModal } from "@/components/ui/ContactModal";
import { Globe } from "lucide-react";

interface FullProfileCardProps {
  profileId: string;
  profileType: "student" | "partner";
  onClose?: () => void;
  isModal?: boolean;
  studentProfile?: StudentProfile;
  partnerProfile?: PartnerProfile;
  disableBtns?: boolean;
}

export function FullProfileCard({
  profileId,
  profileType,
  onClose,
  isModal = true,
  studentProfile,
  partnerProfile,
  disableBtns = false,
}: FullProfileCardProps) {
  const shouldFetchStudent = profileType === "student" && !studentProfile;
  const shouldFetchPartner = profileType === "partner" && !partnerProfile;

  const {
    data: studentData,
    isLoading: isStudentLoading,
    error: studentError,
  } = useStudentProfile(shouldFetchStudent ? profileId : "");

  const {
    data: partnerData,
    isLoading: isPartnerLoading,
    error: partnerError,
  } = usePartnerProfile(shouldFetchPartner ? profileId : "");

  const isLoading = isStudentLoading || isPartnerLoading;
  const error = studentError || partnerError;
  const profile =
    profileType === "student"
      ? studentProfile || studentData
      : partnerProfile || partnerData;

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
            <Spinner size="xl" color="blue.500" />
            <Text mt={4}>Loading profile...</Text>
          </Box>
        </Box>
      );
    }
    return (
      <Box textAlign="center" p={8}>
        <Spinner size="xl" color="blue.500" />
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
          />
        ) : (
          <RenderPartnerDetails
            partner={profile as PartnerProfile}
            disableBtns={disableBtns}
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
          maxH="90vh"
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
}: {
  student: StudentProfile;
  disableBtns: boolean;
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
            w="110px"
            h="110px"
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
          {student.email && (
            <Box display="flex" gap={2} alignItems="center">
              <Image
                src="/assets/mailicon.svg"
                alt="Mail"
                width={20}
                height={20}
                objectFit="contain"
              />
              <Text textDecoration="underline">{student?.email || "-"}</Text>
            </Box>
          )}
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
                src="/assets/linkedin.svg"
                alt="LinkedIn"
                width={20}
                height={20}
                objectFit="contain"
              />
              <Text
                textDecoration="underline"
                onClick={() => window.open(student.linkedin, "_blank")}
              >
                LinkedIn
              </Text>
            </Box>
          )}
          {student.instagram && (
            <Box display="flex" gap={2} alignItems="start">
              <Image
                src="/assets/instagram.svg"
                alt="Instagram"
                width={20}
                height={20}
                objectFit="contain"
              />
              <Text
                textDecoration="underline"
                onClick={() => window.open(student.instagram, "_blank")}
              >
                Instagram
              </Text>
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
              <Text
                textDecoration="underline"
                onClick={() => window.open(student.bluesky, "_blank")}
              >
                Bluesky
              </Text>
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
            bg={"#DC2626"}
            color="white"
            size="lg"
            px={8}
            borderRadius="40px"
            fontSize="14px"
            w="100%"
            boxShadow="0px 3.34px 3.34px 0px #00000040"
            _hover={{
              bg: "#B91C1C",
            }}
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
            size="lg"
            px={8}
            bg={"#DC2626"}
            borderRadius="40px"
            borderColor={"#DC2626"}
            color="white"
            fontSize="14px"
            boxShadow="0px 3.34px 3.34px 0px #00000040"
            w="100%"
            onClick={() => setShowContactModal(true)}
            disabled={disableBtns}
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
                  src="/assets/educationIcon.svg"
                  alt="course"
                  objectFit="contain"
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
                  objectFit="contain"
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
                  objectFit="contain"
                />
              </Box>
              <Text fontSize="sm" color="gray.600">
                {student.credentials.join(", ")}
              </Text>
            </HStack>
          )}

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
                src="/assets/calenderIcon.svg"
                alt="progress"
                objectFit="contain"
              />
            </Box>
            <Text fontSize="sm" color="gray.600">
              Available Immediately
            </Text>
          </HStack>
        </Grid>

        <VStack gap={4} w="full" align="start">
          <BadgeSection title="Specialization" items={student.specialization} />

          <BadgeSection title="Skills" items={student.skills} />

          <BadgeSection
            title="Open to Work Locations"
            items={student.preferred_location}
            showFallback={true}
            fallbackText={student.location || "Not specified"}
          />
          <BadgeSection title="Available For" items={student.position_type} />
        </VStack>
      </Box>

      {showContactModal && student.email && (
        <ContactModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          recipientEmail={student.email}
          recipientName={`${student.first_name} ${student.last_name}`}
        />
      )}
    </Box>
  );
};

const RenderPartnerDetails = ({
  partner,
  disableBtns,
}: {
  partner: PartnerProfile;
  disableBtns: boolean;
}) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const getCompanyLogo = () => {
    if (partner.logo_url) {
      return partner.logo_url;
    } else {
      return partner.profile_picture_url || "";
    }
  };
  return (
    <Box
      w="full"
      h="full"
      display="flex"
      flexDirection={{ base: "column" }}
      px={{ base: 4, lg: 16 }}
      py={{ base: 10, lg: 12 }}
      gap={{ base: 4, lg: 8 }}
    >
      <Box
        display="flex"
        gap={{ base: 4, lg: 8 }}
        alignItems="start"
        flexDirection={{ base: "column", lg: "row" }}
        w="full"
        pt={{ base: 6, lg: 0 }}
      >
        <Box
          flexShrink={0}
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
            Organization Profile
          </Text>
          <Avatar.Root
            w={{ base: "100px", lg: "200px" }}
            h={{ base: "100px", lg: "200px" }}
            border="6px solid #22C55E"
          >
            <Avatar.Image src={getCompanyLogo() || ""} />
            <Avatar.Fallback
              name={partner.first_name + " " + partner.last_name}
              bg="gray.200"
              color="gray.800"
              fontSize="2xl"
              fontWeight="bold"
            />
          </Avatar.Root>
        </Box>

        <VStack
          align="start"
          gap={2}
          flex={1}
          w="full"
          maxW={{ base: "full", lg: "60%" }}
        >
          <Text
            fontSize="24px"
            mb={6}
            fontWeight="bold"
            color="black"
            display={{ base: "none", lg: "block" }}
          >
            Organization Profile
          </Text>
          <Heading fontSize="30px" fontWeight="bold" mb={2} color="black">
            {partner.company_name || "-"}
          </Heading>

          {partner.location && (
            <HStack gap={2} align="center">
              <Image
                src="/assets/locationIcon.svg"
                alt="location"
                width={16}
                height={16}
              />
              <Text fontSize="14px" color="black">
                {partner.location}
              </Text>
            </HStack>
          )}

          {partner.email && (
            <HStack gap={2} align="center">
              <Image
                src="/assets/emailicon.svg"
                alt="website"
                width={16}
                height={16}
              />
              <Link
                href={`mailto:${partner.email}`}
                target="_blank"
                fontSize="14px"
                color="blue.500"
                textDecoration="underline"
              >
                {partner.email}
              </Link>
            </HStack>
          )}

          {partner.homepage && (
            <HStack gap={2} align="center">
              <Globe size={16} color="#C3C3C3" />
              <Link
                href={partner.homepage}
                target="_blank"
                fontSize="14px"
                color="blue.500"
                textDecoration="underline"
              >
                {partner.homepage}
              </Link>
            </HStack>
          )}

          <HStack gap={2} align="center">
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
                src="/assets/calenderIcon.svg"
                alt="progress"
                objectFit="contain"
              />
            </Box>
            <Text fontSize="14px" color="black">
              Available Immediately
            </Text>
          </HStack>
        </VStack>
      </Box>

      <Box
        display="flex"
        gap={{ base: 4, lg: 8 }}
        flexDirection={{ base: "column", lg: "row" }}
        flex={1}
        w="full"
        alignItems={{ base: "center", lg: "end" }}
      >
        <Box
          w="full"
          borderRadius="10px"
          p={6}
          maxW={{ base: "full", lg: "40%" }}
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
            organization
          </Text>

          <VStack gap={3} align="stretch">
            {[
              { name: "Dr. Amanda Samson" },
              { name: "Andrew J Nash" },
              { name: "Dr. Amanda Samson" },
              { name: "Andrew J Nash" },
            ].map((person, index) => (
              <HStack key={index} gap={3} align="center">
                <Avatar.Root w="40px" h="40px" borderRadius="50%">
                  <Avatar.Image src="/assets/imgplaceholder.png" />
                  <Avatar.Fallback
                    name={person.name}
                    bg="white"
                    color="black"
                    fontSize="14px"
                    fontWeight="bold"
                  />
                </Avatar.Root>
                <VStack align="start" gap={0} flex={1}>
                  <Text fontSize="14px" fontWeight="600" color="black">
                    {person.name}
                  </Text>
                </VStack>
              </HStack>
            ))}
          </VStack>
        </Box>

        <VStack
          gap={6}
          align="stretch"
          flex={1}
          w="full"
          maxW={{ base: "full", lg: "60%" }}
        >
          {partner.sector && (
            <BadgeSection
              title="Sector"
              items={partner.sector}
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

          {partner.industry && (
            <BadgeSection
              title="Industry Focus"
              items={partner.industry}
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

          {partner.company_size && (
            <BadgeSection
              title="Company Size"
              items={partner.company_size}
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

          {partner.about && (
            <Box w="full">
              <Text fontSize="20px" fontWeight="600" color="black" mb={3}>
                About this Organization
              </Text>
              <Text fontSize="14px" color="black" lineHeight="1.6" ml={4}>
                {partner.about ||
                  "This organization is committed to fostering innovation and collaboration in their industry. They work closely with educational institutions and students to provide meaningful opportunities for growth and development. Their focus on excellence and partnership makes them a valuable member of our network."}
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
              {partner.linkedin && (
                <Link href={partner.linkedin} target="_blank">
                  <Image
                    src="/assets/linkedIn.svg"
                    alt="LinkedIn"
                    width={24}
                    height={24}
                  />
                </Link>
              )}
              {partner.instagram && (
                <Link href={partner.instagram} target="_blank">
                  <Image
                    src="/assets/instagram.svg"
                    alt="Instagram"
                    width={24}
                    height={24}
                  />
                </Link>
              )}
              {partner.bluesky && (
                <Link href={partner.bluesky} target="_blank">
                  <Image
                    src="/assets/bluesky.svg"
                    alt="Bluesky"
                    width={24}
                    height={24}
                  />
                </Link>
              )}
              <Link
                href={`mailto:${partner.email || "contact@company.com"}`}
                target="_blank"
              >
                <Image
                  src="/assets/mailicon.svg"
                  alt="Email"
                  width={24}
                  height={24}
                />
              </Link>
            </HStack>
            <Button
              bg="#22C45E"
              color="white"
              borderRadius="40px"
              py={2}
              px={4}
              fontSize="12px"
              fontWeight="400"
              w="100%"
              display="flex"
              justifyContent="center"
              maxW="200px"
              disabled={disableBtns}
              onClick={() => setShowContactModal(true)}
            >
              Contact
            </Button>
          </Box>
        </VStack>
      </Box>

      {showContactModal && partner.email && (
        <ContactModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          recipientEmail={partner.email}
          recipientName={
            partner.company_name || `${partner.first_name} ${partner.last_name}`
          }
        />
      )}
    </Box>
  );
};
