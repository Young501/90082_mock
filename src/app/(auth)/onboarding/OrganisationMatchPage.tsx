"use client";

import { Box, Text, VStack, Avatar, HStack } from "@chakra-ui/react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Organisation } from "@/types/shared";
import { getInitials } from "@/utils/getInitials";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { Tooltip } from "@/components/ui/tooltip";
import { useRef } from "react";

interface Props {
  organisation: Organisation;
  onConfirm: () => void;
}

export const OrganisationMatchPage = ({ organisation, onConfirm }: Props) => {
  const DescriptionText = (
    <Text
      maxW="600px"
      fontSize={{ base: "16px", md: "20px" }}
      textAlign={{ base: "center", lg: "start" }}
      style={{
        display: "-webkit-box",
        WebkitLineClamp: 4,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        textOverflow: "ellipsis",
        wordBreak: "break-word",
      }}
    >
      {organisation.description}
    </Text>
  );

  return (
    <>
      <PageTitle title={PAGE_TITLES.ORGANISATION_MATCH} />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
        h="100%"
        py={8}
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
          fontSize={{ base: "18px", md: "20px" }}
          fontWeight="500"
          color="gray.600"
          mb={8}
          maxW="600px"
        >
          Based on your email domain, we&apos;ve identified a potential match
          with an existing organisation.
        </Text>

        <HStack
          flexDirection={{ base: "column", lg: "row" }}
          alignItems="center"
          justifyContent="center"
          gap={6}
          w="100%"
          mb={8}
        >
          <Box borderRadius="full" w="100%" overflow="hidden" maxW="220px">
            <Avatar.Root
              w={{ base: "105px", md: "210px" }}
              h={{ base: "105px", md: "210px" }}
              maxW={{ base: "105px", md: "210px" }}
              maxH={{ base: "105px", md: "210px" }}
              borderRadius="full"
              border={{ base: "6px solid #089C3F", md: "10px solid #089C3F" }}
            >
              <Avatar.Image
                src={organisation.logo_url || undefined}
                alt="organisation logo"
              />
              <Avatar.Fallback
                bg="gray.200"
                color="gray.800"
                fontWeight="bold"
                fontSize={{ base: "24px", md: "48px" }}
              >
                {getInitials(organisation.name, "")}
              </Avatar.Fallback>
            </Avatar.Root>
          </Box>

          <VStack gap={3} align={{ base: "center", lg: "start" }} maxW="600px">
            <Text
              fontSize="xl"
              fontWeight="600"
              textAlign={{ base: "center", lg: "start" }}
              color="black"
            >
              {organisation.name}
            </Text>

            {organisation.description && (
              <Tooltip
                contentContainerStyles={{
                  backgroundColor: "white",
                  borderRadius: "10px",
                  padding: "10px",
                  boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #0000001A",
                }}
                minWidth={{ base: "300px", md: "500px" }}
                TextStyles={{
                  fontSize: "14px",
                  color: "black",
                  fontWeight: "500",
                  lineHeight: "1.5",
                }}
                showArrow
                positioning={{ placement: "top", offset: { mainAxis: 8 } }}
                content={organisation.description}
              >
                {DescriptionText}
              </Tooltip>
            )}

            <VStack align={{ base: "center", lg: "start" }} gap={2}>
              {organisation.sector && (
                <Text fontSize={{ base: "16px", md: "20px" }}>
                  <Text as="span" fontWeight="500">
                    Sector:
                  </Text>{" "}
                  {organisation.sector}
                </Text>
              )}

              {organisation.industry && (
                <Text fontSize={{ base: "16px", md: "20px" }}>
                  <Text as="span" fontWeight="500">
                    Industry:
                  </Text>{" "}
                  {organisation.industry}
                </Text>
              )}

              {organisation.location && (
                <Text fontSize={{ base: "16px", md: "20px" }}>
                  <Text as="span" fontWeight="500">
                    Location:
                  </Text>{" "}
                  {organisation.location}
                </Text>
              )}

              {organisation.website && (
                <Text fontSize={{ base: "16px", md: "20px" }}>
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
            fontSize={{ base: "16px", md: "20px" }}
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
