"use client";
import React from "react";
import {
  Box,
  Container,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Button } from "@/components/ui/Button";
import { useDashboard } from "@/hooks/useDashboard";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";

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
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  const manageRoute = (type: "student" | "organisation") => {
    /*************
     * pathname is returned with the trailing slash in production adding additional trailing slashes to first level routes breaks behaviour in production
     * hence additional trailing slashes arent needed for first level routes but required for second level and extended routes
     * so we need to remove the trailing slash when using the pathname and append trailing slash to second level and extended routes
     */
    router.push(`${pathname}manage/?type=${type}`);
  };

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
        mt={{ base: "80px", lg: "126px" }}
      >
        <VStack gap={4} justify="center" minH="400px">
          <Loader size="xl" color="#000000" />
          <Text>Loading dashboard statistics...</Text>
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
        mt={{ base: "80px", lg: "126px" }}
      >
        <Box bg="transparent" borderColor="#000000" borderRadius="15px" p={6}>
          <Text fontSize="lg" fontWeight="bold" color="#000000" mb={2}>
            Error loading dashboard!
          </Text>
          <Text color="#000000">
            Failed to fetch dashboard statistics. Please try again later.
          </Text>
        </Box>
      </Container>
    );
  }

  if (!dashboardStats) {
    return (
      <Container
        maxW="1512px"
        py={8}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="400px"
        mx="auto"
        mt={{ base: "80px", lg: "126px" }}
      >
        <Box bg="transparent" borderColor="#000000" borderRadius="15px" p={6}>
          <Text fontSize="lg" fontWeight="bold" color="#000000" mb={2}>
            Opportunity not found!
          </Text>
          <Text color="#000000">No dashboard statistics available.</Text>
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
    <Box
      w="100%"
      position="relative"
      borderRadius={{ base: "10px", lg: "15px" }}
      boxShadow="0px 4px 4px 0px rgba(0, 0, 0, 0.25)"
      overflow="hidden"
      height={{ base: "50px", md: "60px", lg: "70px", xl: "78px" }}
      bg={props.bg}
    >
      <Box
        bg={props.gradient}
        h={{ base: "50px", md: "60px", lg: "70px", xl: "78px" }}
        borderRadius={{ base: "10px", lg: "15px" }}
        width={`${percentage}%`}
        position="absolute"
        left={0}
      />
      <Box
        bg={props.gradient}
        h={{ base: "50px", md: "60px", lg: "70px", xl: "78px" }}
        borderRadius={{ base: "10px", lg: "15px" }}
        width="100%"
        opacity={0.5}
        position="relative"
      ></Box>

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
        <Text
          fontWeight="700"
          textAlign="center"
          fontSize={{ base: "20px", lg: "32px" }}
          color="#000000"
          opacity={1.5}
        >
          {value} ({percentage}%)
        </Text>
      </Flex>
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
      label: "Students contacted by at least one organisation:",
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
      value: dashboardStats.organisations.accepted,
      total: dashboardStats.organisations.invited,
    },
    {
      label: "Organisations who have contacted at least one student:",
      value: dashboardStats.organisations.messaged,
      total: dashboardStats.organisations.invited,
    },
    {
      label: "Organisations with at least one matched student:",
      value: dashboardStats.organisations.matched,
      total: dashboardStats.organisations.invited,
    },
  ];

  return (
    <>
      <PageTitle title={PAGE_TITLES.DASHBOARD} />
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
            MTSI Dashboard
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <VStack gap={6}>
              <Box
                bg="white"
                borderRadius="20px"
                p={{ base: 4, md: 8, lg: 12 }}
                boxShadow="-4.3px 4.3px 11.71px 4.3px rgba(0, 0, 0, 0.24)"
                width="100%"
              >
                <HStack mb={{ base: 6, md: 10, lg: 18 }} gap={4}>
                  {isMobile ? (
                    <Box
                      bg="#DC2626"
                      borderRadius="md"
                      width="50px"
                      height="50px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Image
                        src="/assets/studentmetrics.svg"
                        alt="Students Metrics"
                        width={25}
                        height={25}
                      />
                    </Box>
                  ) : (
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
                  )}
                  <Text
                    fontSize={{ base: "20px", lg: "30px" }}
                    fontWeight="600"
                    color="#000000"
                  >
                    Students Metrics
                  </Text>
                </HStack>

                <VStack align="stretch" gap={6}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    gap={6}
                    mb={{ base: 6, md: 10, lg: 24 }}
                    minH={{ base: "auto", md: "124px", lg: "180px" }}
                  >
                    <Text
                      fontSize={{ base: "16px", lg: "23px" }}
                      fontWeight="600"
                      color="#000000"
                    >
                      Students invited to opportunity:
                    </Text>
                    <Box flex={1} display="flex" alignItems="flex-end">
                      <Box
                        bg="#FF9E9E"
                        borderRadius={{ base: "10px", lg: "15px" }}
                        width="100%"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        py={{ base: 2, lg: 0 }}
                        px={{ base: 4, lg: 0 }}
                        textAlign="center"
                        height={{ base: "100%", lg: "96px" }}
                        boxShadow="0px 4px 4px 0px rgba(0, 0, 0, 0.25)"
                      >
                        <Text
                          fontSize={{ base: "24px", lg: "40px" }}
                          fontWeight="bold"
                          color="#000000"
                        >
                          {dashboardStats.students.invited}
                        </Text>
                      </Box>
                    </Box>
                  </Box>

                  {studentsData.map((item, index) => (
                    <Box
                      key={index}
                      display="flex"
                      flexDirection="column"
                      gap={3}
                      minH={{ base: "100px", md: "120px", lg: "146px" }}
                    >
                      <Text
                        fontSize={{
                          base: "14px",
                          md: "16px",
                          lg: "18px",
                          xl: "20px",
                        }}
                        fontWeight="600"
                        color="#000000"
                        lineHeight="1.4"
                        flexShrink={0}
                      >
                        {item.label}
                      </Text>
                      <Box flex="1" display="flex" alignItems="flex-end">
                        <ProgressBar
                          props={{
                            bg: "#FF9E9E",
                            gradient:
                              "linear-gradient(90deg, #990000 0%, #FF0000 100%)",
                          }}
                          value={item.value}
                          total={item.total}
                          percentage={calculatePercentage(
                            item.value,
                            item.total
                          )}
                        />
                      </Box>
                    </Box>
                  ))}
                </VStack>
              </Box>
              <Button
                variant="primary"
                color="white"
                size="lg"
                height="78px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="md"
                fontWeight="bold"
                fontSize="27px"
                width="100%"
                onClick={() => manageRoute("student")}
              >
                Manage Students
              </Button>
            </VStack>

            <VStack gap={6}>
              <Box
                bg="white"
                borderRadius="20px"
                p={{ base: 4, md: 8, lg: 12 }}
                width="100%"
                boxShadow="-4.3px 4.3px 11.71px 4.3px rgba(0, 0, 0, 0.24)"
              >
                <HStack mb={{ base: 6, md: 10, lg: 18 }} gap={4}>
                  {isMobile ? (
                    <Box
                      bg="#089C3F"
                      borderRadius="md"
                      width="50px"
                      height="50px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Image
                        src="/assets/organisationmetrics.svg"
                        alt="Organisation Metrics"
                        width={25}
                        height={25}
                      />
                    </Box>
                  ) : (
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
                  )}
                  <Text
                    fontSize={{ base: "20px", lg: "30px" }}
                    fontWeight="600"
                    color="#000000"
                  >
                    Organisation Metrics
                  </Text>
                </HStack>

                <VStack align="stretch" gap={6}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    gap={6}
                    mb={{ base: 6, md: 10, lg: 24 }}
                    minH={{ base: "auto", md: "124px", lg: "180px" }}
                  >
                    <Text
                      fontSize={{ base: "16px", lg: "23px" }}
                      fontWeight="600"
                      color="#000000"
                    >
                      Organisations invited to opportunity:
                    </Text>
                    <Box flex={1} display="flex" alignItems="flex-end">
                      <Box
                        bg="#ACF2C5"
                        borderRadius={{ base: "10px", lg: "15px" }}
                        width="100%"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        py={{ base: 2, lg: 0 }}
                        px={{ base: 4, lg: 0 }}
                        textAlign="center"
                        height={{ base: "100%", lg: "96px" }}
                        boxShadow="0px 4px 4px 0px rgba(0, 0, 0, 0.25)"
                      >
                        <Text
                          fontSize={{ base: "24px", lg: "40px" }}
                          fontWeight="bold"
                          color="#000000"
                        >
                          {dashboardStats.organisations.invited}
                        </Text>
                      </Box>
                    </Box>
                  </Box>

                  {partnersData.map((item, index) => (
                    <Box
                      key={index}
                      display="flex"
                      flexDirection="column"
                      gap={3}
                      minH={{ base: "100px", md: "120px", lg: "146px" }}
                    >
                      <Text
                        fontSize={{
                          base: "14px",
                          md: "16px",
                          lg: "18px",
                          xl: "20px",
                        }}
                        fontWeight="600"
                        color="#000000"
                        lineHeight="1.4"
                        flexShrink={0}
                      >
                        {item.label}
                      </Text>
                      <Box flex="1" display="flex" alignItems="flex-end">
                        <ProgressBar
                          props={{
                            bg: "#ACF2C5",
                            gradient:
                              "linear-gradient(90deg, #016D14 0%, #00FF1E 100%)",
                          }}
                          value={item.value}
                          total={item.total}
                          percentage={calculatePercentage(
                            item.value,
                            item.total
                          )}
                        />
                      </Box>
                    </Box>
                  ))}
                </VStack>
              </Box>
              <Button
                variant="primary"
                color="white"
                size="lg"
                height="78px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="md"
                fontWeight="bold"
                fontSize="27px"
                width="100%"
                onClick={() => manageRoute("organisation")}
              >
                Manage Organisation
              </Button>
            </VStack>
          </SimpleGrid>

          <SimpleGrid
            columns={{ base: 1, md: 2 }}
            gap={6}
            width="100%"
          ></SimpleGrid>
        </Container>
      </Box>
    </>
  );
};

export default DashboardPage;
