"use client";

import React, { Suspense, useEffect, useState } from "react";
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
import { getParticipants } from "@/services/manage";

async function fetchAllPendingEmails(
  opportunityId: string,
  userType: "student" | "organisation"
): Promise<string[]> {
  const pageSize = 100;
  let page = 1;
  const all: string[] = [];
  while (true) {
    const res = await getParticipants(opportunityId, {
      user_type: userType,
      accepted_status: "pending",
      page,
      page_size: pageSize,
    });
    all.push(...res.results.filter((p) => !!p.email).map((p) => p.email!));
    if (!res.next) break;
    page += 1;
  }
  return all;
}

const ResendPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") as "student" | "organisation" | null;
  const oppSlug = searchParams.get("opp") ?? undefined;
  const email = searchParams.get("email") ?? "";
  const participantName = searchParams.get("name") ?? undefined;
  const bulk = searchParams.get("bulk") === "true";

  const { getCoordinatorOpportunities } = useAuthStore();
  const coordinatorOpportunities = getCoordinatorOpportunities();
  const selected = oppSlug
    ? coordinatorOpportunities.find((o) => o.slug === oppSlug)
    : coordinatorOpportunities[0];
  const opportunityId = selected?.id ? String(selected.id) : "";

  const [pendingEmails, setPendingEmails] = useState<string[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(bulk);

  useEffect(() => {
    if (!bulk || !type || !opportunityId) return;
    let cancelled = false;
    setIsLoadingPending(true);
    fetchAllPendingEmails(opportunityId, type)
      .then((emails) => {
        if (!cancelled) setPendingEmails(emails);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPending(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bulk, type, opportunityId]);

  const handleSuccess = () => router.back();
  const handleCancel = () => router.back();

  if (!type || (!bulk && !email)) {
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

  if (bulk && isLoadingPending) {
    return (
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
    );
  }

  if (bulk && pendingEmails.length === 0) {
    return (
      <Box maxW="1512px" mx="auto">
        <Container maxW="1512px" display="flex" flexDirection="column" gap={4}>
          <HStack gap={2} align="center">
            <IconButton
              aria-label="Go back"
              onClick={handleCancel}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft size={20} />
            </IconButton>
          </HStack>
          <Text fontSize="lg" color="gray.500">
            No pending participants found — everyone invited has already
            responded.
          </Text>
        </Container>
      </Box>
    );
  }

  const title = bulk
    ? type === "student"
      ? "Remind All Pending Students"
      : "Remind All Pending Organisations"
    : type === "student"
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
            emails={bulk ? pendingEmails : [email]}
            participantName={bulk ? undefined : participantName}
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
