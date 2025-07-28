"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Container, useBreakpointValue } from "@chakra-ui/react";
import { useOpportunityDetail, useAcceptInvite } from "@/hooks/useInvite";
import { InviteStatusPage } from "./InviteStatusPage";
import { InviteCard } from "./InviteCard";
import { LoadingState } from "./LoadingState";
import { useAuthStore } from "@/store";
import { checkOnboardingStatus } from "@/hooks/auth";
import { User } from "@/types/user";


function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });
  const [countdown, setCountdown] = useState(3);
  const { isAuthenticated, setInviteData, clearInviteData, user } = useAuthStore();
  
  const token = searchParams.get("token");
  const opportunityId = searchParams.get("opportunity");

  const acceptInviteMutation = useAcceptInvite();
  const {
    data: opportunity,
    isLoading,
    error,
  } = useOpportunityDetail(opportunityId || "");

  useEffect(() => {
    if (!token || !opportunityId) {
      router.push("/login/?error=invalid_invite");
      return;
    }

    if (!isAuthenticated) {
      setInviteData(token, opportunityId);
      router.push(`/login/?invite_token=${token}&opportunity_id=${opportunityId}`);
      return;
    }
  }, [token, opportunityId, isAuthenticated, router, setInviteData]);

  useEffect(() => {
    if (acceptInviteMutation.isSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            clearInviteData();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }

    if (user) {
      console.log("user-invite-page", user);
      checkOnboardingStatus({
        user: user as User,
        router,
      });
    }

  }, [acceptInviteMutation.isSuccess, clearInviteData, user]);

  const handleAcceptInvite = () => {
    if (!token || !opportunityId) return;
    acceptInviteMutation.mutate({ opportunityId, token });

  };

  if (!token || !opportunityId) {
    return (
      <InviteStatusPage
        type="error"
        title="Invalid Invitation Link"
        description="The invitation link is invalid or incomplete. Please check the URL and try again."
      />
    );
  }

  if (!isAuthenticated) {
    return <LoadingState />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <InviteStatusPage
        type="error"
        title="Invitation Not Found"
        description="Unable to load invitation details. The opportunity may no longer exist."
      />
    );
  }

  if (acceptInviteMutation.isSuccess) {
    return (
      <InviteStatusPage
        type="success"
        title="Invitation Accepted!"
        description={`You have successfully joined "${opportunity?.title}".`}
        countdown={countdown}
      />
    );
  }

  return (
    <Container maxW={containerMaxW} p={0} h="100%">
      <InviteCard
        opportunity={opportunity}
        onAccept={handleAcceptInvite}
        acceptInviteMutation={acceptInviteMutation}
      />
    </Container>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InviteContent />
    </Suspense>
  );
}
