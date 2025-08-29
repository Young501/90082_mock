"use client";

import React, { useEffect } from "react";
import { Box, VStack, Heading, Text, Separator } from "@chakra-ui/react";
import { useDiscovery } from "@/hooks/useDiscovery";
import { DiscoveryFilterBox } from "./DiscoveryFilterBox";
import { DiscoveryResultBox } from "./DiscoveryResultBox";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function DiscoveryPage() {
  const {
    searchResults,
    hasSearched,
    filterableFields,
    filterOptions,
    targetUserType,
    isLoading,
    isSearching,
    form,
    handleSearch,
    handleReset,
    checkDependencies,
    resultsCount,
    showResults,
    currentPage,
    pageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    opportunityId,
  } = useDiscovery();

  const { control, watch, getValues } = form;
  const watchedValues = watch();
  const { getUserType } = useAuthStore();
  const userType = getUserType();
  const router = useRouter();
  // ================================

  // Redirect to dashboard page if user is a coordinator
  useEffect(() => {
    if (userType === "coordinator") {
      router.push("/dashboard");
    }
  }, [userType, router]);
  // ================================

  return (
    <>
      <PageTitle title={PAGE_TITLES.DISCOVER} />
      <Box p={6} maxW="1280px" mx="auto" mt={{ base: "80px", lg: "126px" }}>
        <VStack align="stretch" mb={8}>
          <Heading size="lg" color="#282F68">
            Discover {targetUserType === "student" ? "Students" : "Partners"}
          </Heading>
          <Text color="gray.600">
            Search and filter{" "}
            {targetUserType === "student" ? "students" : "partners"} based on
            your criteria
          </Text>
        </VStack>

        <Box borderRadius="md" mb={8} w="100%">
          <DiscoveryFilterBox
            fields={filterableFields}
            control={control}
            watchedValues={watchedValues}
            checkDependencies={checkDependencies}
            hasSearched={hasSearched}
            isSearching={isSearching}
            onSubmit={handleSearch}
            onReset={handleReset}
            filterOptions={filterOptions}
          />
        </Box>

        <Separator my={6} />

        <DiscoveryResultBox
          results={searchResults}
          count={resultsCount}
          isLoading={isSearching}
          hasSearched={hasSearched}
          show={showResults}
          userType={targetUserType!}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          opportunityId={opportunityId}
        />
      </Box>
    </>
  );
}
