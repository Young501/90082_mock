import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  Avatar,
  Button,
  Heading,
} from "@chakra-ui/react";
import { PartnerProfile } from "@/types/discovery";
import Image from "next/image";

interface PartnerCardProps {
  partner: PartnerProfile;
  maxW?: string;
  profilePictureUrl?: string | null;
}

export function PartnerCard({
  partner,
  maxW,
  profilePictureUrl,
}: PartnerCardProps) {
  const getCompanyLogo = () => {
    if (profilePictureUrl) {
      return profilePictureUrl;
    } else {
      return partner.logo_url || "/assets/imgplaceholder.png";
    }
  };

  return (
    <Box
      bg="#D1D1D1"
      borderRadius="2xl"
      border="1px solid"
      borderColor="gray.200"
      boxShadow="0px 3.37px 6.74px 3.37px rgba(0, 0, 0, 0.25)"
      overflow="hidden"
      position="relative"
      borderTopRightRadius="20px"
      w="100%"
      maxW={maxW}
    >
      <Box position="absolute" top={4} right={4} zIndex={1}>
        <Box
          w={6}
          h={6}
          bg="transparent"
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
        >
          <Image
            width={20}
            height={20}
            src="/assets/addicon.svg"
            alt="add"
            objectFit="contain"
          />
        </Box>
      </Box>

      <Box
        px="20px"
        py="40px"
        bg="white"
        borderTopRightRadius="150px"
        display="flex"
        flexDirection="column"
        boxShadow="0px 3.37px 6.74px 3.37px rgba(0, 0, 0, 0.25)"
        w="full"
        h="full"
      >
        <Box display="flex" flexDirection="column" gap={4} flex="1">
          <Box
            display="flex"
            flexDirection="row"
            gap={2}
            justifyContent="center"
            w="full"
          >
            <Box display="flex" flexDirection="column" gap={6}>
              <Box flexShrink={0} w="130px" h="130px">
                <Avatar.Root
                  w="130px"
                  h="130px"
                  borderRadius="50%"
                  border="4px solid"
                  borderColor="#22C45E"
                >
                  <Avatar.Fallback
                    name={partner.company_name || ""}
                    bg="blue.500"
                    color="white"
                    fontWeight="bold"
                    w="100%"
                    h="100%"
                  />
                  {getCompanyLogo() && (
                    <Avatar.Image src={getCompanyLogo()!} w="124px" h="124px" />
                  )}
                </Avatar.Root>
              </Box>

              <Box
                bg="#22C45E"
                color="white"
                borderRadius="2xl"
                py={2}
                px={4}
                fontSize="12px"
                fontWeight="400"
                w="100%"
                display="flex"
                justifyContent="center"
              >
                open to contact
              </Box>
            </Box>

            <Box display="flex" flexDirection="column" gap={3} w="full">
              <Heading
                fontSize="20px"
                textTransform="capitalize"
                fontWeight="bold"
                color="#000000"
              >
                {partner.company_name || ""}
              </Heading>

              <Box display="flex" flexDirection="column" gap={2}>
                {partner.location && (
                  <HStack gap={2} align="center">
                    <Box
                      w="16px"
                      h="16px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Image
                        width={12}
                        height={12}
                        src="/assets/locationIcon.svg"
                        alt="location"
                        objectFit="contain"
                      />
                    </Box>
                    <Text fontSize="sm" color="gray.600">
                      {partner.location || ""}
                    </Text>
                  </HStack>
                )}

                {partner.email && (
                  <HStack gap={2} align="center">
                    <Box
                      w="16px"
                      h="16px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Image
                        width={12}
                        height={12}
                        src="/assets/emailicon.svg"
                        alt="email"
                        objectFit="contain"
                      />
                    </Box>
                    <Text fontSize="sm" color="gray.600">
                      {partner.email || ""}
                    </Text>
                  </HStack>
                )}

                {partner.sector && (
                  <HStack gap={2} align="center">
                    <Box
                      w="16px"
                      h="16px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Image
                        width={12}
                        height={12}
                        src="/assets/calenderIcon.svg"
                        alt="calendar"
                        objectFit="contain"
                      />
                    </Box>
                    <Text fontSize="sm" color="gray.600">
                      {partner.sector}
                    </Text>
                  </HStack>
                )}

                {partner.industry && (
                  <HStack gap={2} align="center">
                    <Box
                      w="16px"
                      h="16px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Image
                        width={12}
                        height={12}
                        src="/assets/calenderIcon.svg"
                        alt="calendar"
                        objectFit="contain"
                      />
                    </Box>
                    <Text fontSize="sm" color="gray.600">
                      {partner.industry}
                    </Text>
                  </HStack>
                )}

                <HStack gap={2} align="start">
                  <Box
                    w="16px"
                    h="16px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Image
                      width={12}
                      height={12}
                      src="/assets/calenderIcon.svg"
                      alt="progress"
                      objectFit="contain"
                    />
                  </Box>
                  <Text fontSize="sm" color="gray.600">
                    Available Immediately
                  </Text>
                </HStack>
              </Box>
            </Box>
          </Box>
        </Box>

        <Button
          w="full"
          bg="#22C45E"
          color="white"
          borderRadius="xl"
          py={6}
          fontSize="14px"
          fontWeight="bold"
          mt={4}
        >
          View Full Profile
        </Button>
      </Box>
    </Box>
  );
}
