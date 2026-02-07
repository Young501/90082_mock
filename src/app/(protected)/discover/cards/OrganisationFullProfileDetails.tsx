import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Avatar,
  Link,
} from "@chakra-ui/react";
import { StudentProfile, OrganisationProfile } from "@/types/discovery";

import Image from "next/image";
import BadgeSection from "@/components/BadgeSection";
import { ContactPage } from "@/components/ContactPage";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const RenderOrganisationDetails = ({
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
      maxW="1006px"
      display="flex"
      //   justifyContent="center"
      mx="auto"
      flexDirection={{ base: "column", lg: "row" }}
    //   px={{ base: 4, lg: 16 }}
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
                {organisation.distance_km != undefined &&
                  organisation.distance_km != null && (
                    <>
                      {" "}
                      (
                      <Text as="span" fontWeight="semibold">
                        {organisation.distance_km} km
                      </Text>
                      )
                    </>
                  )}
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
