"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Container, useBreakpointValue } from "@chakra-ui/react";
import { useOpportunityDetail, useAcceptInvite } from "@/hooks/useInvite";
import { InviteStatusPage } from "./InviteStatusPage";
import { InviteCard } from "./InviteCard";
import { LoadingState } from "./LoadingState";
import { useAuthStore } from "@/store";
import { toast } from "react-toastify";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });
  const [countdown, setCountdown] = useState(3);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const { isAuthenticated, setInviteData, clearInviteData, user } =
    useAuthStore();

  const token = searchParams.get("token");
  const opportunityId = searchParams.get("opportunity");

  const acceptInviteMutation = useAcceptInvite();
  const {
    data: opportunity,
    isLoading,
    error,
  } = useOpportunityDetail(opportunityId || "");

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthLoading && !isAuthenticated && !user && token && opportunityId) {
        setInviteData(token, opportunityId);
        router.push(
          `/user-type/?invite_token=${token}&opportunity_id=${opportunityId}`
        );
        toast.error(
          "You need to be logged in to accept an invitation. Redirecting to signup..."
        );
        return;
      }
      setIsAuthLoading(false);
    };
    checkAuth();
  }, [token, opportunityId, isAuthenticated, user, isAuthLoading, router, setInviteData]);

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

  }, [acceptInviteMutation.isSuccess, clearInviteData, user, router]);

  const handleAcceptInvite = useCallback(
    (questionnaire_answers?: Record<string, any>) => {
      if (!token || !opportunityId) return;
      acceptInviteMutation.mutate({
        opportunityId,
        token,
        ...(questionnaire_answers && { questionnaire_answers }),
      });
    },
    [token, opportunityId, acceptInviteMutation]
  );

  if (!token || !opportunityId) {
    return (
      <InviteStatusPage
        type="error"
        title="Invalid Invitation Link"
        description="The invitation link is invalid or incomplete. Please check the URL and try again."
      />
    );
  }

  if (isAuthLoading || !isAuthenticated) {
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
    <>
    <PageTitle title={PAGE_TITLES.INVITE} />
    <Container maxW={containerMaxW} p={0} h="100%">
      <InviteCard
        opportunity={opportunity}
        onAccept={handleAcceptInvite}
        acceptInviteMutation={acceptInviteMutation}
      />
    </Container>
    </>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InviteContent />
    </Suspense>
  );
}
