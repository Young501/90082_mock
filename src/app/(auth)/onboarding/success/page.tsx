"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Text,
  VStack,
  Icon,
  useBreakpointValue,
  Avatar,
} from "@chakra-ui/react";
import { CheckCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getInitials } from "@/utils/getInitials";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import SuccessBubbles from "@/components/Icons/SuccessBubbles";

export default function OnboardingSuccessPage() {
  const router = useRouter();
  const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });
  const {
    getUserType,
    getLogoUrl,
    getUserFirstName,
    getUserLastName,
    getUserProfilePictureUrl,
  } = useAuthStore();
  const [userType, setUserType] = useState<string | undefined>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const type = getUserType();
    setUserType(type);

    const userProfilePicture = getUserProfilePictureUrl();
    const logoUrl = type === "organisation" ? getLogoUrl() : null;

    setImageUrl(logoUrl || userProfilePicture);
  }, [getUserType, getUserProfilePictureUrl, getLogoUrl]);

  const handleRouting = () => {
    router.push("/home");
  };

  return (
    <>
      <PageTitle title={PAGE_TITLES.ONBOARDING_SUCCESS} />
      <Container maxW={containerMaxW} p={0} h="100%">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
          justifyContent="center"
          h="100%"
        >
          <VStack gap={{ base: 6, md: 8 }} maxW={{ base: "100%", md: "625px" }}>
            <SuccessBubbles />

            <VStack maxW="497px" gap={{ base: 3, md: 4 }}>
              <Text
                fontSize={{ base: "24px", md: "36px" }}
                fontWeight="600"
                color="#18181B"
                lineHeight="1.21"
              >
                Congratulations!
              </Text>
            </VStack>

            <Text
              fontSize={{ base: "sm", md: "md" }}
              fontWeight="500"
              color="#52525B"
              lineHeight="1.4"
            >
              {userType === "student"
                ? "You have successfully completed your Profile"
                : "You have successfully completed your Organisation Profile"}
            </Text>
          </VStack>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            w="100%"
            maxW="1512px"
            mt={10}
          >
            <Box
              w="100%"
              display="flex"
              flexDirection={{ base: "column", md: "row" }}
              alignItems="center"
              justifyContent="center"
              gap={6}
            >
              <Box borderRadius="full" overflow="hidden">
                <Avatar.Root
                  w={{ base: "105px", md: "210px" }}
                  h={{ base: "105px", md: "210px" }}
                  borderRadius="full"
                  border={
                    userType === "student"
                      ? "10px solid #2AA8E0"
                      : "10px solid #089C3F"
                  }
                >
                  <Avatar.Image
                    src={imageUrl || undefined}
                    alt="user profile"
                  />
                  <Avatar.Fallback
                    bg="gray.200"
                    color="gray.800"
                    fontWeight="bold"
                    fontSize={{ base: "24px", md: "48px" }}
                  >
                    {getInitials(
                      getUserFirstName() || "",
                      getUserLastName() || ""
                    )}
                  </Avatar.Fallback>
                </Avatar.Root>
              </Box>

              <Box
                display="flex"
                flexDirection="column"
                gap={4}
                w="100%"
                maxW="400px"
              >
                <ButtonV2
                  variant="primary"
                  onClick={handleRouting}
                  h={{ base: "48px", md: "64px" }}
                  fontSize="md"
                  fontWeight="500"
                  w="100%"
                  px={{ base: 4, md: 7 }}
                  py={{ base: 4, md: 4.5 }}
                >
                  Go to Home
                </ButtonV2>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}
