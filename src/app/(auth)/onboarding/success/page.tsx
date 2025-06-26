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
      border="1px solid #E2E8F0"
      borderRadius="8px"
      p={3}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      bg="white"
      boxShadow="0px 2px 4px rgba(0, 0, 0, 0.05)"
      transition="all 0.2s ease"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(44, 169, 223, 0.15)",
        borderColor: "#2CA9DF",
      }}
      cursor="pointer"
      minW="80px"
      maxW="120px"
    >
      <Box
        w="40px"
        h="40px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Image src={icon} alt={label} width={24} height={24} />
      </Box>
      <Text
        fontSize="xs"
        textAlign="center"
        fontWeight="medium"
        color="#4A5568"
      >
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

    if (type === "student") {
      setImageUrl(getProfileImageUrl());
    } else if (type === "partner") {
      setImageUrl(getLogoUrl());
    }
  }, [getUserType, getProfileImageUrl, getLogoUrl]);

  const handleProfileClick = () => {
    router.push("/profile");
  };

  const handleOrgProfileClick = () => {
    router.push("/profile");
  };

  const handleExploreClick = () => {
    router.push("/discover");
  };

  const opportunities = [
    { icon: "/globe.svg", label: "Research Project" },
    { icon: "/file.svg", label: "Internship" },
    { icon: "/window.svg", label: "Mentoring" },
    { icon: "/globe.svg", label: "Industry Project" },
    { icon: "/window.svg", label: "Networking" },
  ];

  return (
    <Container maxW={containerMaxW} p={0} h="100%">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="80vh"
        textAlign="center"
        px={{ base: 4, md: 6, lg: 8 }}
        py={{ base: 8, md: 12, lg: 16 }}
      >
        <VStack gap={{ base: 6, md: 8 }} maxW="800px">
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
            borderRadius="full"
            overflow="hidden"
            w={{ base: "100px", md: "120px" }}
            h={{ base: "100px", md: "120px" }}
            border="2px solid #2CA9DF"
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Profile"
                width={120}
                height={120}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            ) : userType === "partner" ? (
              <Image
                src="/uni.png"
                alt="Organization Logo"
                width={120}
                height={120}
                style={{ objectFit: "contain", width: "100%", height: "100%" }}
              />
            ) : (
              <Box
                bg="#2CA9DF"
                w="100%"
                h="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="2xl" fontWeight="bold" color="white">
                  {userType?.charAt(0)?.toUpperCase() || "U"}
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
              style={{ borderRadius: "4px" }}
            >
              Go to My Profile
            </Button>

            {userType === "partner" && (
              <Button
                variant="secondary"
                onClick={handleOrgProfileClick}
                style={{ borderRadius: "4px" }}
              >
                Go the Org. Profile
              </Button>
            )}
          </Box>

          <Box w="100%" mt={8}>
            <Text
              fontSize={{ base: "16px", md: "18px" }}
              fontWeight="500"
              mb={4}
              color="#4A5568"
            >
              Explore other Opportunities
            </Text>

            <Flex justifyContent="center" mb={6}>
              <Grid
                templateColumns={{
                  base: "repeat(3, 1fr)",
                  md: "repeat(5, 1fr)",
                }}
                gap={4}
                maxW="600px"
              >
                {opportunities.map((opp, index) => (
                  <GridItem key={index}>
                    <OpportunityCard icon={opp.icon} label={opp.label} />
                  </GridItem>
                ))}
              </Grid>
            </Flex>

            <Button
              variant="primary"
              onClick={handleExploreClick}
              style={{ borderRadius: "4px", width: "200px" }}
            >
              EXPLORE
            </Button>
          </Box>
        </VStack>
      </Box>
    </Container>
  );
}
