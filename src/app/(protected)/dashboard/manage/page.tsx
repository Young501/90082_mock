"use client";
import {
  Box,
  Container,
  Text,
  VStack,
  HStack,
  Button,
  Spinner,
  IconButton,
} from "@chakra-ui/react";
import React, { Suspense, useEffect, useState } from "react";
import { Button as AppButton } from "@/components/ui/Button";
import ManageFilter from "../components/ManageFilter";
import InfiniteScroll from "@/components/InfiniteScroll";
import UserManagementCard from "../components/UserManagementCard";
import UserMatchingStatus from "../components/UserMatchingStatus";
import { useManage } from "@/hooks/useManage";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Loader from "@/components/ui/Loader";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";

const ManagePageContent = () => {
  const searchParams = useSearchParams();
  React.useEffect(() => { window.scrollTo(0, 0); }, []);
  const type = searchParams.get("type");
  const oppSlug = searchParams.get("opp") ?? undefined;
  const { getCoordinatorOpportunities } = useAuthStore();
  const coordinatorOpportunities = getCoordinatorOpportunities();
  const selected = oppSlug
    ? coordinatorOpportunities.find((o) => o.slug === oppSlug)
    : coordinatorOpportunities[0];
  const opportunityId = selected?.id ? String(selected.id) : "";
  const {
    participants,
    selectedParticipant,
    filters,
    hasMore,
    isLoading,
    error,
    loadMore,
    updateFilters,
    resetFilters,
    selectParticipant,
    updateSelectedParticipant,
  } = useManage(type as "student" | "organisation", opportunityId);

  if (error) {
    return (
      <Box maxW="1512px" mx="auto">
        <Container maxW="1512px" display="flex" flexDirection="column" gap={8}>
          <Text as="h1" fontSize={{ base: "22px", lg: "28px" }} fontWeight="600" color="#000000">
            Manage {type === "student" ? "Students" : "Organisations"}
          </Text>
          <Box bg="white" borderRadius="12px" border="1px solid" borderColor="#E4E4E7" p={6} width="100%">
            <VStack gap={4}>
              <Text fontSize="lg" fontWeight="bold" color="red.500">
                Error loading {type === "student" ? "students" : "organisations"}
              </Text>
              <Text color="gray.600">{error}</Text>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </VStack>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <>
      <PageTitle
        title={type === "student" ? PAGE_TITLES.MANAGE_STUDENTS : PAGE_TITLES.MANAGE_PARTNERS}
      />
      <Box>
        {type === "student" ? (
          <StudentPage
            participants={participants}
            selectedParticipant={selectedParticipant}
            filters={filters}
            hasMore={hasMore}
            isLoading={isLoading}
            error={error}
            loadMore={loadMore}
            updateFilters={updateFilters}
            resetFilters={resetFilters}
            selectParticipant={selectParticipant}
            updateSelectedParticipant={updateSelectedParticipant}
            opportunityId={opportunityId}
            oppSlug={oppSlug}
            type={type}
          />
        ) : type === "organisation" ? (
          <PartnerPage
            participants={participants}
            selectedParticipant={selectedParticipant}
            filters={filters}
            hasMore={hasMore}
            isLoading={isLoading}
            error={error}
            loadMore={loadMore}
            updateFilters={updateFilters}
            resetFilters={resetFilters}
            selectParticipant={selectParticipant}
            updateSelectedParticipant={updateSelectedParticipant}
            opportunityId={opportunityId}
            oppSlug={oppSlug}
            type={type}
          />
        ) : (
          <ManageDefault />
        )}
      </Box>
    </>
  );
};

const ManagePage = () => {
  return (
    <Suspense
      fallback={
        <Box maxW="1512px" mx="auto" display="flex" justifyContent="center" alignItems="center" minH="50vh">
          <Spinner size="xl" />
        </Box>
      }
    >
      <ManagePageContent />
    </Suspense>
  );
};

export default ManagePage;

interface PageProps {
  participants: any[];
  selectedParticipant: any;
  filters: any;
  hasMore: boolean;
  isLoading: boolean;
  error: any;
  loadMore: () => void;
  updateFilters: (filters: any) => void;
  resetFilters: () => void;
  selectParticipant: (participant: any) => void;
  updateSelectedParticipant: (participant: any) => void;
  opportunityId: string;
  oppSlug?: string;
  type: string;
}

const StudentPage = ({
  participants, selectedParticipant, filters, hasMore, isLoading,
  loadMore, updateFilters, resetFilters, selectParticipant,
  updateSelectedParticipant, opportunityId, oppSlug, type,
}: PageProps) => {
  const router = useRouter();
  const inviteUrl = `/dashboard/manage/invite?type=${type}${oppSlug ? `&opp=${oppSlug}` : ""}`;

  return (
    <Box maxW="1512px" mx="auto">
      <Container maxW="1512px" display="flex" flexDirection="column" gap={8}>
        <Box
          display="flex"
          justifyContent={{ base: "start", lg: "space-between" }}
          alignItems={{ base: "flex-start", lg: "center" }}
          flexDirection={{ base: "column", lg: "row" }}
          gap={4}
        >
          <HStack gap={2} align="center">
            <IconButton aria-label="Back" variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft size={20} />
            </IconButton>
            <Text as="h1" fontSize={{ base: "22px", lg: "28px" }} fontWeight="600" color="#000000">
              Manage Students
            </Text>
          </HStack>
          <AppButton variant="student" onClick={() => router.push(inviteUrl)} fontSize="15px" height="40px" px={5} borderRadius="8px">
            + Add Students to this list
          </AppButton>
        </Box>

        <VStack width="100%" gap={6} alignItems="flex-start">
          <Box width="100%" height="fit-content">
            <ManageFilter filters={filters} onFilterChange={updateFilters} onReset={resetFilters} />
          </Box>
          <Box
            display="flex"
            flexDirection={{ base: "column", lg: "row" }}
            gap={6}
            width="100%"
            alignItems={{ base: "center", lg: "flex-start" }}
          >
            <Box
              bg="white"
              borderRadius="12px"
              border="1px solid"
              borderColor="#E4E4E7"
              px={{ base: 4, lg: 6 }}
              py={{ base: 4, lg: 6 }}
              height="fit-content"
              width={{ base: "100%", lg: "45%" }}
            >
              <Box
                maxH="700px"
                overflowY="auto"
                px={1}
                py={1}
                css={{ "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {isLoading && participants.length === 0 ? (
                  <VStack gap={4} py={10}><Loader /></VStack>
                ) : participants.length === 0 ? (
                  <VStack gap={4} py={8}><Text fontSize="lg" color="gray.500">No students found</Text></VStack>
                ) : (
                  <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore} isLoading={isLoading}>
                    <VStack gap={3} align="stretch">
                      {participants.map((participant) => (
                        <UserManagementCard
                          key={participant.id}
                          participant={participant}
                          isSelected={selectedParticipant?.id === participant.id}
                          onClick={() => selectParticipant(participant)}
                          userType="student"
                        />
                      ))}
                    </VStack>
                  </InfiniteScroll>
                )}
              </Box>
            </Box>

            <Box
              bg="white"
              borderRadius="12px"
              border="1px solid"
              borderColor="#E4E4E7"
              px={{ base: 4, lg: 6 }}
              py={{ base: 4, lg: 6 }}
              height="fit-content"
              flex={1}
            >
              <UserMatchingStatus
                participant={selectedParticipant}
                userType="student"
                opportunityId={opportunityId}
                onParticipantUpdate={updateSelectedParticipant}
              />
            </Box>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

const PartnerPage = ({
  participants, selectedParticipant, filters, hasMore, isLoading,
  loadMore, updateFilters, resetFilters, selectParticipant,
  updateSelectedParticipant, opportunityId, oppSlug, type,
}: PageProps) => {
  const router = useRouter();
  const inviteUrl = `/dashboard/manage/invite?type=${type}${oppSlug ? `&opp=${oppSlug}` : ""}`;

  return (
    <Box maxW="1512px" mx="auto">
      <Container maxW="1512px" display="flex" flexDirection="column" gap={8}>
        <Box
          display="flex"
          justifyContent={{ base: "start", lg: "space-between" }}
          alignItems={{ base: "flex-start", lg: "center" }}
          flexDirection={{ base: "column", lg: "row" }}
          gap={4}
        >
          <HStack gap={2} align="center">
            <IconButton aria-label="Back" variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft size={20} />
            </IconButton>
            <Text as="h1" fontSize={{ base: "22px", lg: "28px" }} fontWeight="600" color="#000000">
              Manage Organisations
            </Text>
          </HStack>
          <AppButton variant="partner" onClick={() => router.push(inviteUrl)} fontSize="15px" height="40px" px={5} borderRadius="8px">
            + Add Organisations to this list
          </AppButton>
        </Box>

        <VStack width="100%" gap={6} alignItems="flex-start">
          <Box width="100%" height="fit-content">
            <ManageFilter filters={filters} onFilterChange={updateFilters} onReset={resetFilters} />
          </Box>
          <Box
            display="flex"
            flexDirection={{ base: "column", lg: "row" }}
            gap={6}
            width="100%"
            alignItems={{ base: "center", lg: "flex-start" }}
          >
            <Box
              bg="white"
              borderRadius="12px"
              border="1px solid"
              borderColor="#E4E4E7"
              px={{ base: 4, lg: 6 }}
              py={{ base: 4, lg: 6 }}
              height="fit-content"
              width={{ base: "100%", lg: "45%" }}
            >
              <Box
                maxH="700px"
                overflowY="auto"
                px={1}
                py={1}
                css={{ "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {isLoading && participants.length === 0 ? (
                  <VStack gap={4} py={10}><Loader /></VStack>
                ) : participants.length === 0 ? (
                  <VStack gap={4} py={8}><Text fontSize="lg" color="gray.500">No organisations found</Text></VStack>
                ) : (
                  <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore} isLoading={isLoading}>
                    <VStack gap={3} align="stretch">
                      {participants.map((participant) => (
                        <UserManagementCard
                          key={participant.id}
                          participant={participant}
                          isSelected={selectedParticipant?.id === participant.id}
                          onClick={() => selectParticipant(participant)}
                          userType="organisation"
                        />
                      ))}
                    </VStack>
                  </InfiniteScroll>
                )}
              </Box>
            </Box>

            <Box
              bg="white"
              borderRadius="12px"
              border="1px solid"
              borderColor="#E4E4E7"
              px={{ base: 4, lg: 6 }}
              py={{ base: 4, lg: 6 }}
              height="fit-content"
              flex={1}
            >
              <UserMatchingStatus
                participant={selectedParticipant}
                userType="organisation"
                opportunityId={opportunityId}
                onParticipantUpdate={updateSelectedParticipant}
              />
            </Box>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

const ManageDefault = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);
  useEffect(() => {
    const interval = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const timeout = setTimeout(() => router.push("/dashboard"), 3000);
    return () => clearTimeout(timeout);
  }, [router]);
  return (
    <Box maxW="1512px" mx="auto" h={{ base: `calc(100vh - 72px)`, lg: "calc(100vh - 126px)" }} display="flex" alignItems="center" justifyContent="center">
      <Container maxW="1512px" display="flex" flexDirection="column" gap={12}>
        <VStack gap={4} alignItems="center" justifyContent="center">
          <Text fontSize="20px" color="#000000" fontWeight="600">No type selected, please select a type</Text>
          <Text fontSize="20px" color="#000000" textAlign="center">Redirecting to dashboard in {countdown} seconds...</Text>
        </VStack>
      </Container>
    </Box>
  );
};
