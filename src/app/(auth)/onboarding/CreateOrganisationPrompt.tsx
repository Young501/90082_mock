"use client";

import { Box, Text, VStack, Avatar, HStack } from "@chakra-ui/react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { getInitials } from "@/utils/getInitials";

interface CreateOrganisationPromptProps {
  onContinue: () => void;
}

export const CreateOrganisationPrompt = ({
  onContinue,
}: CreateOrganisationPromptProps) => {
  const { getTempOrganisationUser } = useAuthStore();

  const handleCreateOrganisation = () => {
    onContinue();
  };

  const profilePictureUrl =
    getTempOrganisationUser()?.profile_picture_url || null;

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="space-between"
        textAlign="center"
        gap={{ base: 8, md: 40 }}
        h="100%"
        maxW="1512px"
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
        >
          <Text
            fontSize={{ base: "18px", md: "32px" }}
            fontWeight="700"
            color="black"
          >
            Congratulations!
          </Text>
          <Text
            fontSize={{ base: "18px", md: "32px" }}
            fontWeight="700"
            color="black"
          >
            You have successfully completed your Industry Partner Profile
          </Text>
        </Box>

        <HStack
          flexDirection={{ base: "column", md: "row" }}
          alignItems="center"
          w="100%"
          justifyContent="center"
          maxW="1280px"
        >
          <Box borderRadius="full" w="100%" overflow="hidden" maxW="300px">
            <Avatar.Root
              w={{ base: "105px", md: "210px" }}
              h={{ base: "105px", md: "210px" }}
              borderRadius="full"
              border="10px solid #089C3F"
            >
              <Avatar.Image src={profilePictureUrl || ""} alt="user profile" />
              <Avatar.Fallback
                bg="gray.200"
                color="gray.800"
                fontWeight="bold"
                fontSize={{ base: "24px", md: "48px" }}
              >
                {getInitials(
                  getTempOrganisationUser()?.first_name || "",
                  getTempOrganisationUser()?.last_name || ""
                )}
              </Avatar.Fallback>
            </Avatar.Root>
          </Box>

          <VStack
            gap={{ base: 4, md: 8 }}
            w="100%"
            maxW="707px"
            alignItems="center"
            justifyContent="center"
          >
            <Text
              fontSize={{ base: "18px", md: "27px" }}
              fontWeight="700"
              color="black"
            >
              Your Organisation does not have a profile yet, do you want to
              create a profile for your organisation?
            </Text>
            <Button
              onClick={handleCreateOrganisation}
              style={{
                borderRadius: "50px",
                width: "100%",
              }}
              bg="#282F68"
              boxShadow="0px 0px 7.83px 7.83px #27306724"
              color="white"
              fontSize={{ base: "16px", md: "20px" }}
              size={{ base: "md", md: "lg" }}
              maxW="624px"
            >
              Create Organisation Profile
            </Button>
          </VStack>
        </HStack>
      </Box>
    </>
  );
};
