import React from "react";
import { Box, VStack, Text, Drawer, IconButton } from "@chakra-ui/react";
import { StudentProfile, OrganisationProfile } from "@/types/discovery";
import { useStudentProfile, usePartnerProfile } from "@/services/shared";

import Loader from "@/components/ui/Loader";
import { useAuthStore } from "@/store/authStore";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { RenderStudentDetails, RenderOrganisationDetails } from "./index";
import { X, AlertCircle } from "lucide-react";

interface FullProfileCardProps {
  profileId: string;
  profileType: "student" | "organisation";
  onClose?: () => void;
  isModal?: boolean;
  studentProfile?: StudentProfile;
  organisationProfile?: OrganisationProfile;
  disableBtns?: boolean;
  opportunityId?: string;
  opportunitySlug?: string;
  isPreview?: boolean;
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
  opportunitySlug,
  isPreview = false,
}: FullProfileCardProps) {
  const shouldFetchStudent = profileType === "student" && !studentProfile;
  const shouldFetchPartner = profileType === "organisation" && !organisationProfile;
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

  const isLoading = isStudentLoading || isPartnerLoading;
  const error = studentError || partnerError;
  const profile = profileType === "student"
    ? studentProfile || studentData
    : organisationProfile || partnerData;

  if (isLoading) {
    if (isModal) {
      return (
        <Drawer.Root
          open
          onOpenChange={(details) => {
            if (!details.open) onClose?.();
          }}
          placement="bottom"
          size="full"
        >
          <Drawer.Backdrop style={{ zIndex: 10000 }} />
          <Drawer.Positioner style={{ zIndex: 10000 }}>
            <Drawer.Content
              maxH={{ base: "90vh", lg: "85vh" }}
              borderTopRadius="xl"
              boxShadow="0px 5.92px 11.84px 5.92px #00000040"
            >
              <Drawer.Body p={8} textAlign="center">
                <Loader size="xl" color="blue.500" />
                <Text mt={4}>Loading profile...</Text>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Drawer.Root>
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
    const errorMessage =
      (error as any)?.response?.data?.detail ||
      (error as any)?.response?.data?.message ||
      (error as any)?.message ||
      "Failed to load profile. Please try again.";

    const errorContent = (
      <VStack gap={3} pt={10} px={6} textAlign="center">
        <Box color="red.400">
          <AlertCircle size={36} strokeWidth={1.5} />
        </Box>
        <Text fontSize="sm" color="gray.600" maxW="xs">
          {errorMessage}
        </Text>
        <ButtonV2 onClick={onClose} px={8}>
          Close
        </ButtonV2>
      </VStack>
    );

    if (isModal) {
      return (
        <Drawer.Root
          open
          onOpenChange={(details) => {
            if (!details.open) onClose?.();
          }}
          placement="bottom"
          size="full"
        >
          <Drawer.Backdrop style={{ zIndex: 10000 }} />
          <Drawer.Positioner style={{ zIndex: 10000 }}>
            <Drawer.Content
              maxH={{ base: "90vh", lg: "85vh" }}
              borderTopRadius="xl"
              boxShadow="0px 5.92px 11.84px 5.92px #00000040"
            >
              <Drawer.Body display="flex" justifyContent="center">
                {errorContent}
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Drawer.Root>
      );
    }
    return (
      <Box display="flex" justifyContent="center">
        {errorContent}
      </Box>
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
            opportunitySlug={opportunitySlug}
            userType={userType}
            hideActions={isPreview}
          />
        ) : (
          <RenderOrganisationDetails
            organisation={profile as OrganisationProfile}
            disableBtns={disableBtns}
            opportunityId={opportunityId}
            opportunitySlug={opportunitySlug}
            userType={userType}
            hideActions={isPreview}
          />
        )}
      </VStack>
    </Box>
  );

  if (isModal) {
    return (
      <Drawer.Root
        open
        onOpenChange={(details) => {
          if (!details.open) onClose?.();
        }}
        placement="bottom"
        size="full"
      >
        <Drawer.Backdrop style={{ zIndex: 10000 }} />
        <Drawer.Positioner style={{ zIndex: 10000 }}>
          <Drawer.Content
            maxH={{ base: "95vh", lg: "92vh" }}
            overflowY="auto"
            position="relative"
            bg="transparent"
            border="none"
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
            <IconButton
              position="sticky"
              top="-100px"
              zIndex={10}
              size="sm"
              variant="ghost"
              w="100%"
              display="flex"
              justifyContent="flex-end"
              onClick={onClose}
              pr={4}
              bg="transparent"
              border="none"
              borderRadius="full"
              ml="auto"
            >
              <X size={24} fontWeight="bold" color="white" />
            </IconButton>

            <Drawer.Body
              p={0}
              pt={0}
              bg="white"
              borderTopRadius="xl"
              // py={{ base: 5, md: 16 }}
              // px={{ base: 4, md: 6 }}
              boxShadow="0px 5.92px 11.84px 5.92px #00000040"
            >
              {profileContent}
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
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
