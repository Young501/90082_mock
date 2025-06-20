"use client";

import React from "react";
import { Box, VStack, Heading, Text, Separator } from "@chakra-ui/react";
import { useDiscovery } from "@/hooks/useDiscovery";
import { DiscoveryFilterBox } from "./DiscoveryFilterBox";
import { DiscoveryResultBox } from "./DiscoveryResultBox";

export default function DiscoveryPage() {
  const {
    searchResults,
    hasSearched,
    filterableFields,
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
  } = useDiscovery();

  const { control, watch } = form;
  const watchedValues = watch();

  if (isLoading || !targetUserType) {
    return (
      <Box p={8}>
        <Text>
          {!targetUserType
            ? "Please log in to access discovery features..."
            : "Loading configuration..."}
        </Text>
      </Box>
    );
  }

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <VStack align="stretch" mb={8}>
        <Heading size="lg" color="#282F68">
          Discover {targetUserType === "student" ? "Students" : "Partners"}
        </Heading>
        <Text color="gray.600">
          Search and filter{" "}
          {targetUserType === "student" ? "students" : "partners"} based on your
          criteria
        </Text>
      </VStack>

      <Box bg="gray.50" p={6} borderRadius="md" mb={8}>
        <DiscoveryFilterBox
          fields={filterableFields}
          control={control}
          watchedValues={watchedValues}
          checkDependencies={checkDependencies}
          hasSearched={hasSearched}
          isSearching={isSearching}
          onSubmit={handleSearch}
          onReset={handleReset}
        />
      </Box>

      <Separator my={6} />

      <DiscoveryResultBox
        results={searchResults}
        count={resultsCount}
        isLoading={isSearching}
        hasSearched={hasSearched}
        show={showResults}
        userType={targetUserType}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </Box>
  );
}
