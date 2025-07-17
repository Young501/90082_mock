"use client";
import React from "react";
import {
  Box,
  Container,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Spinner,
  Flex,
  Button,
} from "@chakra-ui/react";
import { useDashboard } from "@/hooks/useDashboard";
import Image from "next/image";

interface ProgressBarProps {
  value: number;
  total: number;
  percentage: number;
  props: {
    bg: string;
    gradient: string;
  };
}

const DashboardPage = () => {
  const { dashboardStats, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack gap={4} justify="center" minH="400px">
          <Spinner size="xl" color="blue.500" />
          <Text>Loading dashboard statistics...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="7xl" py={8}>
        <Box
          bg="red.50"
          border="1px"
          borderColor="red.200"
          borderRadius="lg"
          p={6}
        >
          <Text fontSize="lg" fontWeight="bold" color="red.800" mb={2}>
            Error loading dashboard!
          </Text>
          <Text color="red.600">
            Failed to fetch dashboard statistics. Please try again later.
          </Text>
        </Box>
      </Container>
    );
  }

  if (!dashboardStats) {
    return (
      <Container maxW="7xl" py={8}>
        <Box
          bg="blue.50"
          border="1px"
          borderColor="blue.200"
          borderRadius="lg"
          p={6}
        >
          <Text fontSize="lg" fontWeight="bold" color="blue.800" mb={2}>
            No data available
          </Text>
          <Text color="blue.600">
            No dashboard statistics available.
          </Text>
        </Box>
      </Container>
    );
  }

  const ProgressBar = ({
    value,
    total,
    percentage,
    props,
  }: ProgressBarProps) => (
    <Box w="100%" position="relative" borderRadius={{base: "10px", lg: "15px"}} boxShadow="0px 4px 4px 0px rgba(0, 0, 0, 0.25)" overflow="hidden" height={{base: "50px", lg: "78px"}}>
      <Box 
        bg={props.gradient} 
        h={{base: "50px", lg: "78px"}} 
        borderRadius={{base: "10px", lg: "15px"}}
        width={`${percentage}%`}
        position="absolute"
        left={0}
      />
      <Box 
        bg={props.gradient} 
        h={{base: "50px", lg: "78px"}} 
        borderRadius={{base: "10px", lg: "15px"}}
        width="100%"
        opacity={0.5}
        position="relative"
      >
        <Flex 
          position="absolute" 
          left={0} 
          top={0} 
          bottom={0} 
          width="100%"
          alignItems="center"
          justifyContent="center"
          px={4}
        >
          <Text fontWeight="700" textAlign="center" fontSize={{base: "20px", lg: "32px"}} color="#000000">
            {value} ({percentage}%)
          </Text>
        </Flex>
      </Box>
    </Box>
  );

  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const studentsData = [
    {
      label: "Students who accepted invitation:",
      value: dashboardStats.students.accepted,
      total: dashboardStats.students.invited,
    },
    {
      label: "Students contacted by at least one school:",
      value: dashboardStats.students.messaged,
      total: dashboardStats.students.invited,
    },
    {
      label: "Students matched to opportunity:",
      value: dashboardStats.students.matched,
      total: dashboardStats.students.invited,
    },
  ];

  const partnersData = [
    {
      label: "Organisations who accepted invitation:",
      value: dashboardStats.partners.accepted,
      total: dashboardStats.partners.invited,
    },
    {
      label: "Organisations who have contacted at least one student:",
      value: dashboardStats.partners.messaged,
      total: dashboardStats.partners.invited,
    },
    {
      label: "Organisations with at least one matched student:",
      value: dashboardStats.partners.matched,
      total: dashboardStats.partners.invited,
    },
  ];

  return (
    <Box py={6} px={{ base: 4, lg: "72px" }} maxW="1512px" mx="auto" mt="126px">
      <Container maxW="1512px" display="flex" flexDirection="column" gap={12}>
       <Text as="h1" fontSize={{base: "32px", lg: "51px"}} fontWeight="600" color="#000000">
          MTSI Dashboard
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} >
          <VStack gap={6}>

          <Box 
            bg="white" 
            borderRadius="20px" 
            p={{base: 6, lg: 12}} 
            boxShadow="-4.3px 4.3px 11.71px 4.3px rgba(0, 0, 0, 0.24)"
            width="100%"
          >
            <HStack mb={{base: 6, md: 10, lg: 18}} gap={4}>
              <Box 
                bg="#DC2626" 
                borderRadius="md"
                width="80px"
                height="80px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Image 
                  src="/assets/studentmetrics.svg" 
                  alt="Students Metrics" 
                  width={38}
                  height={34}
                />
              </Box>
              <Text fontSize={{base: "20px", lg: "30px"}} fontWeight="600" color="#000000">Students Metrics</Text>
            </HStack>

            <VStack align="stretch" gap={6}>
              <Box display="flex" flexDirection="column"  gap={6} mb={{base: 6, md: 10, lg: 24}}>
                <Text fontSize={{base: "16px", lg: "23px"}} fontWeight="600" color="#000000">Students invited to opportunity:</Text>
                <Box bg="#FF9E9E" borderRadius={{base: "10px", lg: "15px"}} width="100%" display="flex" alignItems="center" justifyContent="center" py={{base: 2, lg: 0}} px={{base: 4, lg: 0}} textAlign="center" height={{base: "100%", lg: "96px"}} boxShadow="0px 4px 4px 0px rgba(0, 0, 0, 0.25)">
                  <Text fontSize={{base: "24px", lg: "40px"}} fontWeight="bold" color="#000000">
                    {dashboardStats.students.invited}
                  </Text>
                </Box>
              </Box>

              {studentsData.map((item, index) => (
                <Box key={index} display="flex" flexDirection="column" gap={3}>
                  <Text fontSize={{base: "16px", lg: "20px"}} fontWeight="600" color="#000000">{item.label}</Text>
                  <ProgressBar 
                    props={{
                      bg: "#FF9E9E",
                      gradient: "linear-gradient(90deg, #990000 0%, #FF0000 100%)"
                    }}
                    value={item.value} 
                    total={item.total} 
                    percentage={calculatePercentage(item.value, item.total)} 
                  />
                </Box>
              ))}
            </VStack>
          </Box>
          <Button 
            size="lg" 
            height="78px"      
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="#002157"
            color="white"
            borderRadius="md"
            fontWeight="bold"
            fontSize="27px"
            width="100%"
          >
            Manage Students
          </Button>
          </VStack>

          <VStack gap={6}>

          <Box 
            bg="white" 
            borderRadius="20px" 
            p={{base: 6, lg: 12}} 
            width="100%"
            boxShadow="-4.3px 4.3px 11.71px 4.3px rgba(0, 0, 0, 0.24)"
          >
            <HStack mb={{base: 6, md: 10, lg: 18}} gap={4}>
              <Box 
                bg="#089C3F" 
                borderRadius="md"
                width="80px"
                height="80px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Image 
                  src="/assets/organisationmetrics.svg" 
                  alt="Organisation Metrics" 
                  width={45}
                  height={38}
                />
              </Box>
              <Text fontSize={{base: "20px", lg: "30px"}} fontWeight="600" color="#000000">Organisation Metrics</Text>
            </HStack>

            <VStack align="stretch" gap={6}>
              <Box display="flex" flexDirection="column" gap={6} mb={{base: 6, md: 10, lg: 24}}>
                <Text fontSize={{base: "16px", lg: "23px"}} fontWeight="600" color="#000000">Organisations invited to opportunity:</Text>
                <Box bg="#ACF2C5" borderRadius={{base: "10px", lg: "15px"}} width="100%" display="flex" alignItems="center" justifyContent="center" py={{base: 2, lg: 0}} px={{base: 4, lg: 0}} textAlign="center" height={{base: "100%", lg: "96px"}} boxShadow="0px 4px 4px 0px rgba(0, 0, 0, 0.25)">
                  <Text fontSize={{base: "24px", lg: "40px"}} fontWeight="bold" color="#000000">
                    {dashboardStats.partners.invited}
                  </Text>
                </Box>
              </Box>

              {partnersData.map((item, index) => (
                <Box key={index} display="flex" flexDirection="column" gap={3}>
                  <Text fontSize={{base: "16px", lg: "20px"}} fontWeight="600" color="#000000">{item.label}</Text>
                  <ProgressBar 
                    props={{
                      bg: "#ACF2C5",
                      gradient: "linear-gradient(90deg, #016D14 0%, #00FF1E 100%)"
                    }}
                    value={item.value} 
                    total={item.total} 
                    percentage={calculatePercentage(item.value, item.total)} 
                  />
                </Box>
              ))}
            </VStack>
          </Box>
          <Button 
            size="lg" 
            height="78px"            
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="#002157"
            color="white"
            borderRadius="md"
            fontWeight="bold"
            fontSize="27px"
            width="100%"
          >
            Manage Organisation
          </Button>
          </VStack>

        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} width="100%">
         
          
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default DashboardPage;