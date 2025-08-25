"use client";

import {
  Box,
  Container,
  Text,
  VStack,
  Icon,
  useBreakpointValue,
  Avatar,
  HStack,
} from "@chakra-ui/react";
import { Building2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Organisation } from "@/types/shared";
import { getInitials } from "@/utils/getInitials";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";

interface Props {
  organisation: Organisation;
  onConfirm: () => void;
}

export const OrganisationMatchPage = ({ organisation, onConfirm }: Props) => {
  const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });

  return (
    <>
      <PageTitle title={PAGE_TITLES.ORGANISATION_MATCH} />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
        h="100%"
        pt={8}
      >
        <Text
          fontSize={{ base: "24px", md: "32px" }}
          fontWeight="700"
          color="black"
          mb={4}
        >
          We found you might be part of {organisation.name}
        </Text>

        <Text
          fontSize={{ base: "16px", md: "18px" }}
          fontWeight="500"
          color="gray.600"
          mb={8}
          maxW="600px"
        >
          Based on your email domain, we&apos;ve identified a potential match
          with an existing organisation.
        </Text>

        <HStack
          flexDirection={{ base: "column", md: "row" }}
          alignItems="center"
          justifyContent="center"
          gap={6}
          w="100%"
          mb={8}
        >
          <Box borderRadius="full" overflow="hidden" maxW="200px">
            <Avatar.Root
              w={{ base: "120px", md: "150px" }}
              h={{ base: "120px", md: "150px" }}
              borderRadius="full"
              border="6px solid #089C3F"
            >
              <Avatar.Image
                src={organisation.logo_url || undefined}
                alt="organisation logo"
              />
              <Avatar.Fallback
                bg="gray.200"
                color="gray.800"
                fontWeight="bold"
                fontSize={{ base: "32px", md: "40px" }}
              >
                {getInitials(organisation.name, "")}
              </Avatar.Fallback>
            </Avatar.Root>
          </Box>

          <VStack gap={3} align={{ base: "center", md: "start" }}>
            <Text
              fontSize="xl"
              fontWeight="600"
              textAlign={{ base: "center", md: "start" }}
              color="black"
            >
              {organisation.name}
            </Text>

            {organisation.description && (
              <Text fontSize="md" lineHeight="1.4">
                {organisation.description}
              </Text>
            )}

            <VStack align={{ base: "center", md: "start" }} gap={2}>
              {organisation.sector && (
                <Text fontSize="sm">
                  <Text as="span" fontWeight="500">
                    Sector:
                  </Text>{" "}
                  {organisation.sector}
                </Text>
              )}

              {organisation.industry && (
                <Text fontSize="sm">
                  <Text as="span" fontWeight="500">
                    Industry:
                  </Text>{" "}
                  {organisation.industry}
                </Text>
              )}

              {organisation.location && (
                <Text fontSize="sm">
                  <Text as="span" fontWeight="500">
                    Location:
                  </Text>{" "}
                  {organisation.location}
                </Text>
              )}

              {organisation.website && (
                <Text fontSize="sm">
                  <Text as="span" fontWeight="500">
                    Website:
                  </Text>{" "}
                  {organisation.website}
                </Text>
              )}
            </VStack>
          </VStack>
        </HStack>

        <Box w="100%" maxW="400px">
          <Button
            onClick={onConfirm}
            style={{
              borderRadius: "50px",
              width: "100%",
            }}
            bg="#282F68"
            boxShadow="0px 0px 7.83px 7.83px #27306724"
            color="white"
            fontSize={{ base: "14px", md: "16px" }}
            size={{ base: "md", md: "lg" }}
          >
            <CheckCircle size={20} style={{ marginRight: "8px" }} />
            Yes, I&apos;m part of this organisation
          </Button>
        </Box>
      </Box>
    </>
  );
};
