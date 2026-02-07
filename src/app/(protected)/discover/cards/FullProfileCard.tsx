import React, { useState } from "react";
import { Box, VStack, Text, Alert, Drawer } from "@chakra-ui/react";
import { StudentProfile, OrganisationProfile } from "@/types/discovery";
import {
  useStudentProfile,
  usePartnerProfile,
  useCoordinatorViewUserProfile,
} from "@/services/shared";
import Image from "next/image";

import Loader from "@/components/ui/Loader";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { RenderStudentDetails, RenderOrganisationDetails } from "./index";

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
        <Drawer.Root
          open
          onOpenChange={(details) => {
            if (!details.open) onClose?.();
          }}
          placement="bottom"
          size="full"
        >
          <Drawer.Backdrop />
          <Drawer.Positioner>
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
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content
              maxH={{ base: "90vh", lg: "85vh" }}
              borderTopRadius="xl"
              boxShadow="0px 5.92px 11.84px 5.92px #00000040"
            >
              <Drawer.Body p={8}>
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
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Drawer.Root>
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
          <RenderOrganisationDetails
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
      <Drawer.Root
        open
        onOpenChange={(details) => {
          if (!details.open) onClose?.();
        }}
        placement="bottom"
        size="full"
      >
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content
            maxH={{ base: "90vh", lg: "85vh" }}
            borderTopRadius="xl"
            boxShadow="0px 5.92px 11.84px 5.92px #00000040"
            overflowY="auto"
            position="relative"
            bg="white"
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
            <Button
              position="sticky"
              top={0}
              zIndex={10}
              size="sm"
              variant="ghost"
              w="100%"
              display="flex"
              justifyContent="flex-end"
              onClick={onClose}
              pr={4}
              pt={4}
              pb={2}
              bg="transparent"
              borderRadius="full"
              ml="auto"
            >
              <Image
                src="/assets/cancel.svg"
                alt="Close"
                width={25}
                height={25}
              />
            </Button>
            <Drawer.Body p={0} pt={0} bg="white">
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
