"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Text,
  VStack,
  Icon,
  useBreakpointValue,
} from "@chakra-ui/react";
import { CheckCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getInitials } from "@/utils/getInitials";

export default function OnboardingSuccessPage() {
  const router = useRouter();
  const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });
  const { getUserType, getProfileImageUrl, getLogoUrl, getUserProfile } =
    useAuthStore();
  const [userType, setUserType] = useState<string | undefined>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const type = getUserType();
    setUserType(type);
    // images arent required for users
    if (type === "student") {
      // images are gotten from the store since images url arent returned on  onboarding submission response
      setImageUrl(getProfileImageUrl());
    } else if (type === "partner") {
      setImageUrl(getLogoUrl() || getProfileImageUrl());
    }
  }, [getUserType, getProfileImageUrl, getLogoUrl]);

  const handleProfileClick = () => {
    router.push("/profile/");
  };

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
        </Text>
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
            <Box
              borderRadius="full"
              overflow="hidden"
              w={{ base: "100px", md: "210px" }}
              h={{ base: "100px", md: "210px" }}
              style={{
                border:
                  userType === "partner"
                    ? "10px solid #089C3F"
                    : "10px solid #DC2626",
              }}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Profile"
                  width={200}
                  height={200}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
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
                  <Text
                    fontSize={{ base: "2xl", md: "4xl" }}
                    fontWeight="bold"
                    color="white"
                  >
                    {(() => {
                      const profile = getUserProfile();
                      const initials = profile
                        ? getInitials(profile.first_name, profile.last_name)
                        : "";
                      return (
                        initials || userType?.charAt(0)?.toUpperCase() || "U"
                      );
                    })()}
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
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
