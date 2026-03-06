"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { OrganisationInvitePage } from "../onboarding/OrganisationInvitePage";
import { Box } from "@chakra-ui/react";
import Loader from "@/components/ui/Loader";
import {
  useOrganisationInvite,
  useOrganisationInviteAccept,
  useOrganisationInviteDecline,
} from "@/services/organisation";
import { checkOnboardingStatus } from "@/hooks/auth";
import { toast } from "react-toastify";

export default function InvitePage() {
  const router = useRouter();
  const { user, token, setUserProfile } = useAuthStore();
  const userType = user?.user_types?.[0];

  const shouldFetchInvite =
    !!token && !!userType && userType === "organisation";

  const {
    data: invite,
    isLoading,
    isFetched,
  } = useOrganisationInvite(shouldFetchInvite);

  const acceptMutation = useOrganisationInviteAccept();
  const declineMutation = useOrganisationInviteDecline();

  useEffect(() => {
    if (!token || !userType) {
      router.replace("/login/");
      return;
    }

    if (userType !== "organisation") {
      router.replace("/home/");
      return;
    }

    if (isFetched && !invite) {
      router.replace("/onboarding/");
    }
  }, [router, token, userType, isFetched, invite]);

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

  if (isLoading) {
    return <Loader type="page" text="Loading invitation..." />;
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
