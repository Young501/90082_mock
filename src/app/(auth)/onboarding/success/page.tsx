"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Text,
  VStack,
  Icon,
  useBreakpointValue,
  Flex,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { CheckCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { useEffect, useState } from "react";

interface OpportunityCardProps {
  icon: string;
  label: string;
}

const OpportunityCard = ({ icon, label }: OpportunityCardProps) => {
  return (
    <Box
      border="1px solid #2CA9DF"
      borderRadius="12px"
      p={3}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      bg="white"
      boxShadow="0px 2px 4px rgba(0, 0, 0, 0.05)"
      transition="all 0.2s ease"
      cursor="pointer"
      minW="80px"
      maxW="100px"
    >
      <Box
        w="45px"
        h="45px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Image src={icon} alt={label} width={24} height={24} />
      </Box>
      <Text fontSize="12px" textAlign="center" fontWeight="700" color="#2CA9DF">
        {label}
      </Text>
    </Box>
  );
};

export default function OnboardingSuccessPage() {
  const router = useRouter();
  const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });
  const { getUserType, getProfileImageUrl, getLogoUrl } = useAuthStore();
  const [userType, setUserType] = useState<string | undefined>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const type = getUserType();
    setUserType(type);
    // images arent required for users
    if (type === "student") {
      setImageUrl(getProfileImageUrl());
    } else if (type === "partner") {
      setImageUrl(getLogoUrl() || getProfileImageUrl());
    }
  }, [getUserType, getProfileImageUrl, getLogoUrl]);

  const handleProfileClick = () => {
    router.push("/home/");
  };

  const handleOrgProfileClick = () => {
    router.push("/home/");
  };

  const handleExploreClick = (): void => {
    router.push("/discover/");
  };

  const opportunities = [
    { icon: "/assets/employment.svg", label: "Employment" },
    { icon: "/assets/student.svg", label: "Student" },
    { icon: "/assets/internship.svg", label: "Internship" },
    { icon: "/assets/mentoring.svg", label: "Mentoring" },
    { icon: "/assets/research.svg", label: "Research" },
  ];

  return (
    <Container maxW={containerMaxW} pb={10} h="100%">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="space-between"
        textAlign="center"
        h="100%"
      >
        <Box>
          <Icon
            as={CheckCircle}
            boxSize={{ base: 12, md: 16 }}
            color="green.500"
          />

          <Text
            fontSize={{ base: "24px", md: "32px" }}
            fontWeight="700"
            color="black"
            lineHeight="1.21"
          >
            Congratulations!
          </Text>
        </Box>

        <Text
          fontSize={{ base: "18px", md: "24px" }}
          fontWeight="500"
          color="black"
          lineHeight="1.3"
        >
          {userType === "student"
            ? "You have successfully completed your Profile"
            : "You have successfully completed your Organisation Profile"}
          {userType === "partner" && (
            <Text as="span" display="block" fontSize="18px" mt={2}>
              for the [Course] [CLLO]
            </Text>
          )}
        </Text>
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          w="100%"
          maxW="1512px"
        >
          <Box
            w="100%"
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-start"
            gap={4}
          >
            <Box
              borderRadius="full"
              overflow="hidden"
              w={{ base: "100px", md: "210px" }}
              h={{ base: "100px", md: "210px" }}
              border="10px solid #089C3F"
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Profile"
                  width={200}
                  height={200}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              ) : userType === "partner" ? (
                <Image
                  src={getLogoUrl() || ""}
                  alt="Organization Logo"
                  width={200}
                  height={200}
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                />
              ) : (
                <Box
                  bg="#2CA9DF"
                  w="200px"
                  h="200px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="2xl" fontWeight="bold" color="white">
                    {userType?.charAt(0)?.toUpperCase() || ""}
                  </Text>
                </Box>
              )}
            </Box>

            <Box
              display="flex"
              flexDirection="column"
              gap={4}
              w="100%"
              maxW="400px"
            >
              <Button
                variant="primary"
                onClick={handleProfileClick}
                style={{
                  borderRadius: "50px",
                  maxWidth: "372x",
                  width: "100%",
                }}
                bg="#282F68"
                color="white"
              >
                Go to My Profile
              </Button>

              {userType === "partner" && (
                <Button
                  variant="secondary"
                  onClick={handleOrgProfileClick}
                  style={{
                    borderRadius: "50px",
                    maxWidth: "372x",
                    width: "100%",
                  }}
                  bg="#282F68"
                  color="white"
                >
                  Go the Org. Profile
                </Button>
              )}
            </Box>
          </Box>

          <Box w="100%" maxW="400px" mt={8}>
            <Text
              fontSize={{ base: "16px", md: "20px" }}
              fontWeight="700"
              mb={4}
              color="#000000"
            >
              Explore other Opportunities
            </Text>

            <Flex justifyContent="center" mb={6}>
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="center"
                flexWrap="wrap"
                gap={4}
              >
                {opportunities.map((opp, index) => (
                  <GridItem key={index}>
                    <OpportunityCard icon={opp.icon} label={opp.label} />
                  </GridItem>
                ))}
              </Box>
            </Flex>

            <Button
              variant="primary"
              onClick={handleExploreClick}
              style={{
                borderRadius: "4px",
                maxWidth: "272px",
                width: "100%",
              }}
            >
              EXPLORE
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
