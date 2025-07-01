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
}

export function PartnerCard({ partner }: PartnerCardProps) {
  const getCompanyLogo = () => {
    return partner.logo_url || null;
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
        gap={4}
      >
        <Box
          display="flex"
          flexDirection="row"
          gap={2}
          justifyContent="center"
          w="full"
        >
          <Box flexShrink={0} w="130px" h="130px">
            <Avatar.Root w="130px" h="130px" borderRadius="50%">
              <Avatar.Fallback
                name={partner.company_name || ""}
                bg="blue.500"
                color="white"
                fontWeight="bold"
                w="100%"
                h="100%"
              />
              {getCompanyLogo() && (
                <Avatar.Image src={getCompanyLogo()!} w="130px" h="130px" />
              )}
            </Avatar.Root>
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

              {partner.availability && (
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
                    {partner.availability}
                  </Text>
                </HStack>
              )}
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
        >
          View Full Profile
        </Button>
      </Box>
    </Box>
  );
}
