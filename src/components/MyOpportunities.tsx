"use client";
import React, { useState } from "react";
import {
  Box,
  Text,
  Button,
  Flex,
  VStack,
  HStack,
} from "@chakra-ui/react";

interface MyOpportunitiesProps {
  userType: string;
}

const MyOpportunities: React.FC<MyOpportunitiesProps> = ({ userType }) => {
  const [activeSubTab, setActiveSubTab] = useState<number>(0);

  const opportunityTabs = [
    {
      title: "Enrolled Opportunities",
      icon: "fa-solid fa-circle-check",
      
    },
    {
      title: "Closed Opportunities", 
      icon: "fa-solid fa-times-circle",
    },
  ];

  return (
    <Box w="100%">
      {/* Sub-tab navigation */}
      <Flex
        gap={0}
        mb={6}
        borderBottom="2px solid #E2E8F0"
        w="fit-content"
      >
        {opportunityTabs.map((tab, index) => (
          <Button
            key={index}
            variant="ghost"
            onClick={() => setActiveSubTab(index)}
            borderRadius="0"
            borderBottom={
              activeSubTab === index
                ? `3px solid ${userType === "student" ? "#DC2626" : "#089C3F"}`
                : "3px solid transparent"
            }
            color={
              activeSubTab === index
                ? userType === "student" ? "#DC2626" : "#089C3F"
                : "#666666"
            }
            fontWeight="600"
            px={6}
            py={3}
            _hover={{
              color: userType === "student" ? "#DC2626" : "#089C3F",
            }}
          >
            <HStack gap={2}>
              <i
                className={tab.icon}
                style={{
                  fontSize: "16px",
                }}
              />
              <Text>{tab.title}</Text>
            </HStack>
          </Button>
        ))}
      </Flex>

      {/* Tab content */}
      <Box>
        {activeSubTab === 0 && (
          <Box
            p={8}
            borderRadius="12px"
            bg="#F8F9FA"
            border="1px solid #E2E8F0"
            textAlign="center"
          >
            <VStack gap={4}>
              <i
                className="fa-solid fa-folder-closed"
                style={{
                  fontSize: "48px",
                  color: "#9CA3AF",
                }}
              />
              <Text fontSize="18px" fontWeight="600" color="#374151">
                Enrolled Opportunities
              </Text>
              <Text fontSize="14px" color="#6B7280" maxW="400px">
                You are currently enrolled in the following opportunities. 
                Click on any opportunity to view details or cancel enrollment.
              </Text>
              <Text fontSize="12px" color="#9CA3AF" fontStyle="italic">
                No enrolled opportunities found
              </Text>
            </VStack>
          </Box>
        )}

        {activeSubTab === 1 && (
          <Box
            p={8}
            borderRadius="12px"
            bg="#F8F9FA"
            border="1px solid #E2E8F0"
            textAlign="center"
          >
            <VStack gap={4}>
              <i
                className="fa-solid fa-archive"
                style={{
                  fontSize: "48px",
                  color: "#9CA3AF",
                }}
              />
              <Text fontSize="18px" fontWeight="600" color="#374151">
                Closed Opportunities
              </Text>
              <Text fontSize="14px" color="#6B7280" maxW="400px">
                These are opportunities you were previously enrolled in but are no longer active. 
                You can re-enroll in some of these opportunities.
              </Text>
              <Text fontSize="12px" color="#9CA3AF" fontStyle="italic">
                No closed opportunities found
              </Text>
            </VStack>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MyOpportunities;
