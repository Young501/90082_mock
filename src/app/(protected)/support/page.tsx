"use client";

import React from "react";
import { Box, Heading } from "@chakra-ui/react";
import { SupportContent } from "@/components/SupportContent";

const Support = () => {
  return (
    <Box bg="white" w="100%" mx="auto" maxW="800px" borderRadius="lg" p={{ base: 4, lg: 8 }}>
      <Box mb={8}>
        <Heading as="h1" size="2xl" color="gray.900" mb={2}>
          Support
        </Heading>
      </Box>
      <SupportContent />
    </Box>
  );
};

export default Support;
