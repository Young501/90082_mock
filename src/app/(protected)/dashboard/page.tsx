"use client";

import React from "react";
import {
  Box,
  Container,
  Text,
  VStack,
} from "@chakra-ui/react";
import Loader from "@/components/ui/Loader";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { useAuthStore } from "@/store";
import { useDashboard } from "@/hooks/useDashboard";
import { CoordinatorDashboard } from "./components/CoordinatorDashboard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const DashboardPage = () => {
  const router = useRouter();
  const userType = useAuthStore((s) => s.user?.user_types?.[0]);
  const isCoordinator = userType === "coordinator";

  const {
    dashboardStats,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useDashboard();

  useEffect(() => {
    if (!isCoordinator && userType) {
      router.replace("/home/");
    }
  }, [isCoordinator, userType, router]);

  if (!isCoordinator) {
    return (
      <Container
        maxW="1512px"
        py={8}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="400px"
        mx="auto"
      >
        <VStack gap={4} justify="center" minH="400px">
          <Loader size="xl" color="#000000" />
          <Text>Redirecting...</Text>
        </VStack>
      </Container>
    );
  }

  if (isDashboardLoading) {
    return (
      <Container
        maxW="1512px"
        py={8}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="400px"
        mx="auto"
      >
        <VStack gap={4} justify="center" minH="400px">
          <Loader size="xl" color="#000000" />
          <Text>Loading dashboard...</Text>
        </VStack>
      </Container>
    );
  }

  if (dashboardError) {
    return (
      <Container
        maxW="1512px"
        py={8}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="400px"
        mx="auto"
      >
        <Box bg="transparent" borderColor="#000000" borderRadius="15px" p={6}>
          <Text fontSize="lg" fontWeight="bold" color="#000000" mb={2}>
            Error loading dashboard!
          </Text>
          <Text color="#000000">
            Failed to load dashboard. Please try again later.
          </Text>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <PageTitle title={PAGE_TITLES.DASHBOARD} />
      <Box maxW="1512px" mx="auto">
        <Container
          maxW="1512px"
          px={0}
          display="flex"
          flexDirection="column"
          gap={12}
        >
          {!dashboardStats ? (
            <Box bg="transparent" borderRadius="15px" p={6}>
              <Text fontSize="lg" fontWeight="bold" color="#000000" mb={2}>
                No opportunity selected
              </Text>
              <Text color="#000000">
                Please select an opportunity to view dashboard statistics.
              </Text>
            </Box>
          ) : (
            <CoordinatorDashboard
              dashboardStats={dashboardStats}
              isLoading={false}
              error={null}
            />
          )}
        </Container>
      </Box>
    </>
  );
};

export default DashboardPage;
