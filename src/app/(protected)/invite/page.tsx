"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Container, useBreakpointValue } from "@chakra-ui/react";
import { useOpportunityDetail, useAcceptInvite } from "@/hooks/useInvite";
import { InviteStatusPage } from "./InviteStatusPage";
import { InviteCard } from "./InviteCard";
import { LoadingState } from "./LoadingState";

function InviteContent() {
  const searchParams = useSearchParams();
  const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });
  const token = searchParams.get("token");
  const opportunityId = searchParams.get("opportunity");
  const [countdown, setCountdown] = useState(3);

  const acceptInviteMutation = useAcceptInvite();
  const {
    data: opportunity,
    isLoading,
    error,
  } = useOpportunityDetail(opportunityId || "");

  useEffect(() => {
    if (acceptInviteMutation.isSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [acceptInviteMutation.isSuccess]);

  const handleAcceptInvite = (questionnaire_answers?: Record<string, any>) => {
    if (!token || !opportunityId) return;
    acceptInviteMutation.mutate({
      opportunityId,
      token,
      ...(questionnaire_answers && { questionnaire_answers }),
    });
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
    <Container maxW={containerMaxW} p={0} pt={{ base: 6, md: 10 }} h="100%">
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
