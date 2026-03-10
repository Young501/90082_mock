"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { OrganisationInvitePage } from "../onboarding/OrganisationInvitePage";
import { Box, Button, Alert, VStack, Text } from "@chakra-ui/react";
import { TriangleAlert } from "lucide-react";
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
  }, [router, token, userType, hasCheckedAuth]);

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

  if (noInviteState) {
    return (
      <Box
        h="100%"
        w="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Alert.Root
          status="warning"
          variant="subtle"
          borderRadius="12px"
          border="1px solid"
          borderColor="orange.300"
          bg="orange.50"
          maxW="480px"
          w="100%"
          mx="auto"
          p={8}
        >
          <VStack align="center" gap={4} w="100%">
            <TriangleAlert size={32} color="var(--chakra-colors-orange-500)" />
            <Text
              fontWeight="600"
              fontSize="md"
              color="orange.800"
              textAlign="center"
            >
              You don&apos;t have an active invitation
            </Text>
            {onboardingComplete ? (
              <Button
                onClick={() => router.push("/home/")}
                colorPalette="orange"
                size="sm"
              >
                Go to Home
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/onboarding/")}
                colorPalette="orange"
                size="sm"
                mt="10px"
              >
                Create New Organisation
              </Button>
            )}
          </VStack>
        </Alert.Root>
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
