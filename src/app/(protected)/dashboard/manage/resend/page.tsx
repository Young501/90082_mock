"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  Box,
  Container,
  Text,
  IconButton,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { ResendForm } from "./component/ResendForm";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";

const ResendPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") as "student" | "organisation" | null;
  const oppSlug = searchParams.get("opp") ?? undefined;
  const email = searchParams.get("email") ?? "";
  const participantName = searchParams.get("name") ?? undefined;

  const { getCoordinatorOpportunities } = useAuthStore();
  const coordinatorOpportunities = getCoordinatorOpportunities();
  const selected = oppSlug
    ? coordinatorOpportunities.find((o) => o.slug === oppSlug)
    : coordinatorOpportunities[0];
  const opportunityId = selected?.id ? String(selected.id) : "";

  const oppParam = oppSlug ? `&opp=${oppSlug}` : "";
  const manageUrl = `/dashboard/manage?type=${type}${oppParam}`;

  const handleSuccess = () => router.back();
  const handleCancel = () => router.back();

  if (!type || !email) {
    return (
      <Box maxW="1512px" mx="auto">
        <Container maxW="1512px">
          <Text fontSize="lg" color="gray.500">
            Invalid resend parameters.
          </Text>
        </Container>
      </Box>
    );
  }

  const title =
    type === "student"
      ? "Resend Student Invitation"
      : "Resend Organisation Invitation";

  return (
    <>
      <PageTitle title={PAGE_TITLES.RESEND_INVITATION} />
      <Box maxW="1512px" mx="auto">
        <Container maxW="1512px" display="flex" flexDirection="column" gap={8}>
          <HStack gap={2} align="center">
            <IconButton
              aria-label="Go back"
              onClick={handleCancel}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft size={20} />
            </IconButton>
            <Text
              as="h1"
              fontSize={{ base: "22px", lg: "28px" }}
              fontWeight="600"
              color="#000000"
            >
              {title}
            </Text>
          </HStack>

          <ResendForm
            email={email}
            participantName={participantName}
            userType={type}
            opportunityId={opportunityId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </Container>
      </Box>
    </>
  );
};

const ResendPage = () => {
  return (
    <Suspense
      fallback={
        <Box
          maxW="1512px"
          mx="auto"
          display="flex"
          justifyContent="center"
          alignItems="center"
          minH="50vh"
        >
          <Spinner size="xl" />
        </Box>
      }
    >
      <ResendPageContent />
    </Suspense>
  );
};

export default ResendPage;
