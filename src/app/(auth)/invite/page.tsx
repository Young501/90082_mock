"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { OrganisationInvitePage } from "../onboarding/OrganisationInvitePage";
import { Box, Text, VStack, Button } from "@chakra-ui/react";
import Loader from "@/components/ui/Loader";
import {
  useOrganisationInvite,
  useOrganisationInviteAccept,
  useOrganisationInviteDecline,
  useOrganisationMemberMeV2,
  useOrganisationProfileV2,
} from "@/services/organisation";
import {
  checkOnboardingStatus,
  isOrganisationMemberComplete,
  isOrganisationComplete,
} from "@/hooks/auth";
import { toast } from "react-toastify";

const AUTH_HYDRATION_DELAY_MS = 300;
const NO_INVITE_REDIRECT_DELAY_MS = 3000;

export default function InvitePage() {
  const router = useRouter();
  const { user, token, setUserProfile } = useAuthStore();
  const userType = user?.user_types?.[0];
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const shouldFetchInvite =
    !!token && !!userType && userType === "organisation";

  const {
    data: invite,
    isLoading,
    isFetched,
    isError: isInviteError,
  } = useOrganisationInvite(shouldFetchInvite);

  const noInviteState =
    ((isFetched && !invite) || isInviteError) && shouldFetchInvite;

  const { data: organisationMember, isLoading: isMemberLoading } =
    useOrganisationMemberMeV2(noInviteState);
  const { data: organisationProfile, isLoading: isProfileLoading } =
    useOrganisationProfileV2(noInviteState);

  const acceptMutation = useOrganisationInviteAccept();
  const declineMutation = useOrganisationInviteDecline();

  const memberComplete = isOrganisationMemberComplete(
    organisationMember ?? null
  );
  const orgComplete = isOrganisationComplete(organisationProfile ?? null);
  const onboardingComplete = memberComplete && orgComplete;
  const isCheckingNoInviteStatus =
    noInviteState && (isMemberLoading || isProfileLoading);

  useEffect(() => {
    if (!hasCheckedAuth) {
      const timer = setTimeout(
        () => setHasCheckedAuth(true),
        AUTH_HYDRATION_DELAY_MS
      );
      return () => clearTimeout(timer);
    }

    if (!token || !userType) {
      router.replace("/login/");
      return;
    }

    if (userType !== "organisation") {
      router.replace("/home/");
      return;
    }

    if (noInviteState && !isCheckingNoInviteStatus && !onboardingComplete) {
      router.replace("/onboarding/");
    }
  }, [
    router,
    token,
    userType,
    hasCheckedAuth,
    noInviteState,
    isCheckingNoInviteStatus,
    onboardingComplete,
  ]);

  useEffect(() => {
    if (!(noInviteState && onboardingComplete)) return;

    const timer = setTimeout(() => {
      router.push("/home/");
    }, NO_INVITE_REDIRECT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [router, noInviteState, onboardingComplete]);

  const handleAccept = async () => {
    if (!invite || acceptMutation.isPending || declineMutation.isPending)
      return;
    try {
      await acceptMutation.mutateAsync();
      // useAuthStore.getState().setIsOrganisationMemberOnboarding(true);
      await checkOnboardingStatus({
        user: user!,
        router,
        setUserProfile,
        redirectOnSuccess: true,
      });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail || "Failed to accept invitation"
      );
    }
  };

  const handleDecline = async () => {
    if (!invite || acceptMutation.isPending || declineMutation.isPending)
      return;
    try {
      await declineMutation.mutateAsync();

      await checkOnboardingStatus({
        user: user!,
        router,
        setUserProfile,
        redirectOnSuccess: true,
      });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail || "Failed to decline invitation"
      );
    }
  };

  if (!hasCheckedAuth || isLoading || isCheckingNoInviteStatus) {
    return <Loader type="page" text="Loading invitation..." />;
  }

  if (noInviteState && onboardingComplete) {
    return (
      <Box
        h="100%"
        w="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Box
          maxW="480px"
          mx="auto"
          bg="white"
          borderRadius="4xl"
          px={{ base: 6, md: 12 }}
          py={{ base: 6, md: 8 }}
          border="1px solid #E4E4E7"
          textAlign="center"
        >
          <VStack gap={4}>
            <Text
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="600"
              color="#18181B"
            >
              You don&apos;t have an active invitation
            </Text>

            <Button
              onClick={() => router.push("/home/")}
              bg="#3AADA8"
              color="white"
              _hover={{ bg: "#2d8d89" }}
              size="lg"
            >
              Redirecting to Home...
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  if (!invite) {
    return null;
  }

  return (
    <Box
      h="100%"
      w="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <OrganisationInvitePage
        invite={invite}
        onAccept={handleAccept}
        onDecline={handleDecline}
        isAccepting={acceptMutation.isPending}
        isDeclining={declineMutation.isPending}
      />
    </Box>
  );
}
