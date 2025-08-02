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
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getInitials } from "@/utils/getInitials";

export default function OnboardingSuccessPage() {
  const router = useRouter();
  const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });
  const {
    getUserType,
    getLogoUrl,
    getUserFirstName,
    getUserLastName,
    getUserProfilePictureUrl,
    getInviteData,
  } = useAuthStore();
  const [userType, setUserType] = useState<string | undefined>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const type = getUserType();
    setUserType(type);

    const userProfilePicture = getUserProfilePictureUrl();
    const logoUrl = type === "partner" ? getLogoUrl() : null;

    setImageUrl(logoUrl || userProfilePicture);
  }, [getUserType, getUserProfilePictureUrl, getLogoUrl]);

  const handleRouting = () => {
    const { token: inviteToken, opportunityId } = getInviteData();

    if (inviteToken && opportunityId) {
      router.push(`/invite/?token=${inviteToken}&opportunity=${opportunityId}`);
    } else {
      router.push("/discover/");
    }
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
            >
              <Avatar.Root
                w={{ base: "105px", md: "210px" }}
                h={{ base: "105px", md: "210px" }}
                borderRadius="full"
                border={
                  userType === "student"
                    ? "10px solid #DC2626"
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
                  {getInitials(getUserFirstName() || "", getUserLastName() || "")}
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
              <Button
                variant="primary"
                onClick={handleRouting}
                style={{
                  borderRadius: "50px",
                  maxWidth: "372x",
                  width: "100%",
                }}
                bg="#282F68"
                color="white"
              >
                {(() => {
                  const { token: inviteToken, opportunityId } = getInviteData();
                  return inviteToken && opportunityId
                    ? "Discover Opportunities"
                    : "Go to Home";
                })()}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
