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
import { useHomepage } from "@/hooks/useHomepage";
import { HomepageDashboard } from "@/app/(protected)/dashboard/components/HomepageDashboard";

const HomePage = () => {
  const {
    homepageStats,
    isLoading,
    error,
  } = useHomepage();

  if (isLoading) {
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
          <Text>Loading...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
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
            Error loading home
          </Text>
          <Text color="#000000">
            Failed to load. Please try again later.
          </Text>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <PageTitle title={PAGE_TITLES.HOME} />
      <Box maxW="1512px" mx="auto">
        <Container
          maxW="1512px"
          px={0}
          display="flex"
          flexDirection="column"
          gap={12}
        >
          {homepageStats ? (
            <HomepageDashboard data={homepageStats} />
          ) : (
            <Box bg="transparent" borderRadius="15px" p={6}>
              <Text fontSize="lg" fontWeight="bold" color="#000000" mb={2}>
                No data available
              </Text>
              <Text color="#000000">
                No data available. Please try again later.
              </Text>
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};

export default HomePage;
