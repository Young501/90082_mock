"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  Box,
  Container,
  Text,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { InvitationForm } from "./component/InvitationForm";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";

const InvitePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type");
  const oppSlug = searchParams.get("opp") ?? undefined;
  const { getCoordinatorOpportunities } = useAuthStore();
  const coordinatorOpportunities = getCoordinatorOpportunities();
  const selected = oppSlug
    ? coordinatorOpportunities.find((o) => o.slug === oppSlug)
    : coordinatorOpportunities[0];
  const opportunityId = selected?.id ? String(selected.id) : "";

  const oppParam = oppSlug ? `&opp=${oppSlug}` : "";

  const handleSuccess = () => {
    router.push(`/dashboard/manage?type=${type}${oppParam}`);
  };

  const handleCancel = () => {
    router.push(`/dashboard/manage?type=${type}${oppParam}`);
  };

  if (type === "student") {
    return (
      <StudentInvitePage opportunityId={opportunityId} onSuccess={handleSuccess} onCancel={handleCancel} />
    );
  } else if (type === "organisation") {
    return (
      <PartnerInvitePage opportunityId={opportunityId} onSuccess={handleSuccess} onCancel={handleCancel} />
    );
  }

  return (
    <Box maxW="1512px" mx="auto">
      <Container maxW="1512px" display="flex" flexDirection="column" gap={12}>
        <Text fontSize="lg" color="gray.500">
          Invalid invitation type
        </Text>
      </Container>
    </Box>
  );
};

export default InvitePage;

const StudentInvitePage = ({
  opportunityId,
  onSuccess,
  onCancel,
}: {
  opportunityId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}) => {
  const router = useRouter();

  return (
    <>
      <PageTitle title={PAGE_TITLES.INVITE_STUDENTS} />
      <Box maxW="1512px" mx="auto">
        <Container maxW="1512px" display="flex" flexDirection="column" gap={8}>
          <HStack gap={2} align="center">
            <IconButton
              aria-label="Go back"
              onClick={onCancel || (() => router.push("/dashboard/manage?type=student"))}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft size={20} />
            </IconButton>
            <Text as="h1" fontSize={{ base: "22px", lg: "28px" }} fontWeight="600" color="#000000">
              Invite Students
            </Text>
          </HStack>

          <InvitationForm
            userType="student"
            opportunityId={opportunityId}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </Container>
      </Box>
    </>
  );
};

const PartnerInvitePage = ({
  opportunityId,
  onSuccess,
  onCancel,
}: {
  opportunityId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}) => {
  const router = useRouter();

  return (
    <>
      <PageTitle title={PAGE_TITLES.INVITE_PARTNERS} />
      <Box maxW="1512px" mx="auto">
        <Container maxW="1512px" display="flex" flexDirection="column" gap={8}>
          <HStack gap={2} align="center">
            <IconButton
              aria-label="Go back"
              onClick={onCancel || (() => router.push("/dashboard/manage?type=organisation"))}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft size={20} />
            </IconButton>
            <Text as="h1" fontSize={{ base: "22px", lg: "28px" }} fontWeight="600" color="#000000">
              Invite Organisations
            </Text>
          </HStack>

          <InvitationForm
            userType="organisation"
            opportunityId={opportunityId}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </Container>
      </Box>
    </>
  );
};
