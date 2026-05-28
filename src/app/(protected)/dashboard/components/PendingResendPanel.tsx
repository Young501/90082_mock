"use client";

import React from "react";
import { VStack, Text } from "@chakra-ui/react";
import { Participant } from "@/types/dashboard";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface PendingResendPanelProps {
  participant: Participant;
  userType: "student" | "organisation";
  oppSlug?: string;
}

export const PendingResendPanel: React.FC<PendingResendPanelProps> = ({
  participant,
  userType,
  oppSlug,
}) => {
  const router = useRouter();
  const buttonVariant = userType === "student" ? "student" : "partner";

  const handleResend = () => {
    const params = new URLSearchParams({ type: userType });
    if (oppSlug) params.set("opp", oppSlug);
    if (participant.email) params.set("email", participant.email);
    if (participant.name) params.set("name", participant.name);
    router.push(`/dashboard/manage/resend?${params.toString()}`);
  };

  return (
    <VStack align="stretch" gap={4}>
      <Text fontSize="sm" color="#71717A">
        This {userType === "student" ? "student" : "organisation"} has not
        accepted their invitation yet. You can resend the invitation with an
        optional custom message.
      </Text>
      <Button
        variant={buttonVariant}
        onClick={handleResend}
        disabled={!participant.email}
        alignSelf="flex-start"
      >
        Resend Invitation
      </Button>
    </VStack>
  );
};
