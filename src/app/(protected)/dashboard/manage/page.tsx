"use client";
import { Box, Container, Text, VStack, Button } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import ManageFilter from "../components/ManageFilter";
import InfiniteScroll from "@/components/InfiniteScroll";
import UserManagementCard from "../components/UserManagementCard";
import UserMatchingStatus from "../components/UserMatchingStatus";
import { useManage } from "@/hooks/useManage";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Loader from "@/components/Loader";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { toast } from "react-toastify";

const ManagePage = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const { getCoordinatorOpportunities } = useAuthStore();
  const coordinatorOpportunities = getCoordinatorOpportunities();
  const opportunityId = coordinatorOpportunities[0] || "";
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
  } = useManage(type as "student" | "organisation");

  if (error) {
    return (
      <Box
        py={6}
        px={{ base: 4, lg: "72px" }}
        maxW="1512px"
        mx="auto"
        mt={{ base: "80px", lg: "126px" }}
      >
        <Container maxW="1512px" display="flex" flexDirection="column" gap={12}>
          <Text
            as="h1"
            fontSize={{ base: "32px", lg: "51px" }}
            fontWeight="600"
            color="#000000"
          >
            Manage {type === "student" ? "Students" : "Organisations"}
          </Text>
          <Box
            bg="white"
            borderRadius="20px"
            p={{ base: 6, lg: 12 }}
            width="100%"
          >
            <VStack gap={4}>
              <Text fontSize="lg" fontWeight="bold" color="red.500">
                Error loading{" "}
                {type === "student" ? "students" : "organisations"}
              </Text>
              <Text color="gray.600">{error}</Text>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </VStack>
          </Box>
        </Container>
      </Box>
    );
  }
  return (
    <>
      <PageTitle
        title={
          type === "student"
            ? PAGE_TITLES.MANAGE_STUDENTS
            : PAGE_TITLES.MANAGE_PARTNERS
        }
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
            type={type}
          />
        ) : (
          <ManageDefault />
        )}
      </Box>
    </>
  );
};

export default ManagePage;

const StudentPage = ({
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
  opportunityId,
  type,
}: {
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
  type: string;
}) => {
  const router = useRouter();
  return (
    <Box
      py={6}
      px={{ base: 4, lg: "48px", xl: "72px" }}
      maxW="1512px"
      mx="auto"
      mt={{ base: "80px", lg: "126px" }}
    >
      <Container maxW="1512px" display="flex" flexDirection="column" gap={12}>
        <Box
          display="flex"
          justifyContent={{ base: "start", lg: "space-between" }}
          alignItems={{ base: "center", lg: "flex-start" }}
          flexDirection={{ base: "column", lg: "row" }}
          gap={8}
        >
          <Text
            as="h1"
            fontSize={{ base: "32px", lg: "51px" }}
            fontWeight="600"
            color="#000000"
          >
            Manage Students
          </Text>
          <Button
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="#CFF3FF"
            color="#000000"
            height={{ base: "50px", lg: "80px" }}
            fontWeight="600"
            fontSize={{ base: "16px", lg: "22px" }}
            gap={2}
            px={{ base: 4, lg: 10 }}
            borderRadius={{ base: "10px", lg: "18px" }}
            boxShadow="0px 4px 4px 0px rgba(0, 0, 0, 0.25)"
            onClick={() => {
              router.push(`/dashboard/manage/invite?type=${type}`);
            }}
          >
            <Image
              src="/assets/smallplusicon.svg"
              alt="Add Students"
              width={18}
              height={18}
            />
            Add Students to this list
          </Button>
        </Box>

        <VStack
          width="100%"
          gap={8}
          alignItems="flex-start"
          justifyContent="flex-start"
        >
          <Box
            width={{ base: "100%", lg: "35%" }}
            height="fit-content"
            display="flex"
            flexDirection="column"
            gap={8}
            maxW={{ base: "100%", lg: "550px" }}
            alignItems="flex-start"
            justifyContent="flex-start"
          >
            <ManageFilter
              filters={filters}
              onFilterChange={updateFilters}
              onReset={resetFilters}
            />
          </Box>
          <Box
            display="flex"
            flexDirection={{ base: "column", lg: "row" }}
            gap={{ base: 8, lg: 0 }}
            width="100%"
            justifyContent={{ base: "start", lg: "space-between" }}
            alignItems={{ base: "center", lg: "flex-start" }}
          >
            <Box
              bg="white"
              borderRadius="20px"
              px={{ base: 6, lg: 10 }}
              py={{ base: 4, lg: 8 }}
              boxShadow="-4.3px 4.3px 11.71px 4.3px rgba(0, 0, 0, 0.24)"
              height="fit-content"
              width={{ base: "100%", lg: "35%" }}
              maxW={{ base: "100%", lg: "550px" }}
            >
              <Box
                maxH="700px"
                overflowY="auto"
                css={{
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {isLoading && participants.length === 0 ? (
                  <VStack gap={4} py={10}>
                    <Loader />
                  </VStack>
                ) : participants.length === 0 ? (
                  <VStack gap={4} py={8}>
                    <Text fontSize="lg" color="gray.500">
                      No students found
                    </Text>
                  </VStack>
                ) : (
                  <InfiniteScroll
                    onLoadMore={loadMore}
                    hasMore={hasMore}
                    isLoading={isLoading}
                  >
                    <VStack gap={3} align="stretch">
                      {participants.map((participant) => (
                        <UserManagementCard
                          key={participant.id}
                          participant={participant}
                          isSelected={
                            selectedParticipant?.id === participant.id
                          }
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
              borderRadius="20px"
              px={{ base: 6, lg: 10 }}
              py={{ base: 4, lg: 8 }}
              boxShadow="-4.3px 4.3px 11.71px 4.3px rgba(0, 0, 0, 0.24)"
              height="fit-content"
              width={{ base: "100%", lg: "60%" }}
              maxW={{ base: "100%", lg: "750px" }}
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
  opportunityId,
  type,
}: {
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
  type: string;
}) => {
  const router = useRouter();
  return (
    <Box
      py={6}
      px={{ base: 4, lg: "48px", xl: "72px" }}
      maxW="1512px"
      mx="auto"
      mt={{ base: "80px", lg: "126px" }}
    >
      <Container maxW="1512px" display="flex" flexDirection="column" gap={12}>
        <Box
          display="flex"
          justifyContent={{ base: "start", lg: "space-between" }}
          alignItems={{ base: "center", lg: "flex-start" }}
          flexDirection={{ base: "column", lg: "row" }}
          gap={8}
        >
          <Text
            as="h1"
            fontSize={{ base: "32px", lg: "51px" }}
            fontWeight="600"
            color="#000000"
          >
            Manage Organisations
          </Text>
          <Button
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="#CFF3FF"
            color="#000000"
            height={{ base: "50px", lg: "80px" }}
            fontWeight="600"
            fontSize={{ base: "16px", lg: "22px" }}
            gap={2}
            px={{ base: 4, lg: 10 }}
            borderRadius={{ base: "10px", lg: "18px" }}
            boxShadow="0px 4px 4px 0px rgba(0, 0, 0, 0.25)"
            onClick={() => {
              router.push(`/dashboard/manage/invite?type=${type}`);
            }}
          >
            <Image
              src="/assets/smallplusicon.svg"
              alt="Add Organisations"
              width={18}
              height={18}
            />
            Add Organisations to this list
          </Button>
        </Box>

        <VStack
          width="100%"
          gap={8}
          alignItems="flex-start"
          justifyContent="flex-start"
        >
          <Box
            width={{ base: "100%", lg: "35%" }}
            height="fit-content"
            display="flex"
            flexDirection="column"
            gap={8}
            maxW={{ base: "100%", lg: "550px" }}
            alignItems="flex-start"
            justifyContent="flex-start"
          >
            <ManageFilter
              filters={filters}
              onFilterChange={updateFilters}
              onReset={resetFilters}
            />
          </Box>
          <Box
            display="flex"
            flexDirection={{ base: "column", lg: "row" }}
            gap={{ base: 8, lg: 0 }}
            width="100%"
            justifyContent={{ base: "start", lg: "space-between" }}
            alignItems={{ base: "center", lg: "flex-start" }}
          >
            <Box
              bg="white"
              borderRadius="20px"
              px={{ base: 6, lg: 10 }}
              py={{ base: 4, lg: 8 }}
              boxShadow="-4.3px 4.3px 11.71px 4.3px rgba(0, 0, 0, 0.24)"
              height="fit-content"
              width={{ base: "100%", lg: "35%" }}
              maxW={{ base: "100%", lg: "550px" }}
            >
              <Box
                maxH="700px"
                overflowY="auto"
                css={{
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {isLoading && participants.length === 0 ? (
                  <VStack gap={4} py={10}>
                    <Loader />
                  </VStack>
                ) : participants.length === 0 ? (
                  <VStack gap={4} py={8}>
                    <Text fontSize="lg" color="gray.500">
                      No organisations found
                    </Text>
                  </VStack>
                ) : (
                  <InfiniteScroll
                    onLoadMore={loadMore}
                    hasMore={hasMore}
                    isLoading={isLoading}
                  >
                    <VStack gap={3} align="stretch">
                      {participants.map((participant) => (
                        <UserManagementCard
                          key={participant.id}
                          participant={participant}
                          isSelected={
                            selectedParticipant?.id === participant.id
                          }
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
              borderRadius="20px"
              px={{ base: 6, lg: 10 }}
              py={{ base: 4, lg: 8 }}
              boxShadow="-4.3px 4.3px 11.71px 4.3px rgba(0, 0, 0, 0.24)"
              height="fit-content"
              width={{ base: "100%", lg: "60%" }}
              maxW={{ base: "100%", lg: "750px" }}
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
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/dashboard");
    }, 3000);
    return () => clearTimeout(timeout);
  }, [router]);
  return (
    <Box
      py={6}
      px={{ base: 4, lg: "72px" }}
      maxW="1512px"
      mx="auto"
      h={{ base: `calc(100vh - 72px)`, lg: "calc(100vh - 126px)" }}
      mt={{ base: "72px", lg: "126px" }}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Container maxW="1512px" display="flex" flexDirection="column" gap={12}>
        <VStack gap={4} alignItems="center" justifyContent="center">
          <Text fontSize="20px" color="#000000" fontWeight="600">
            No type selected, please select a type
          </Text>
          <Text fontSize="20px" color="#000000" textAlign="center">
            Redirecting to dashboard in {countdown} seconds...
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};
