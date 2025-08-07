import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  Avatar,
  Heading,
} from "@chakra-ui/react";
import { PartnerProfile } from "@/types/discovery";
import Image from "next/image";
import { FullProfileCard } from "./FullProfileCard";
import { AddToFolderModal } from "@/app/(protected)/folders/modals/AddToFolderModal";
import { DeleteModal } from "../../folders/modals/DeleteModal";
import { Button } from "@/components/ui/Button";

interface PartnerCardProps {
  partner: PartnerProfile;
  maxW?: string;
  profilePictureUrl?: string | null;
  isInFolder?: boolean;
  onRemoveFromFolder?: () => void;
  disableViewFullProfile?: boolean;
  disableAddToFolder?: boolean;
}

export function PartnerCard({
  partner,
  maxW,
  profilePictureUrl,
  isInFolder = false,
  onRemoveFromFolder,
  disableViewFullProfile = false,
  disableAddToFolder = false,
}: PartnerCardProps) {
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [showAddToFolderModal, setShowAddToFolderModal] = useState(false);
  const [clickBackground, setClickBackground] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const getCompanyLogo = () => {
    if (partner.logo_url) {
      return partner.logo_url;
    } else {
      return partner.profile_picture_url;
    }
  };

  const handleViewFullProfile = () => {
    if (partner.id && !disableViewFullProfile) {
      setShowFullProfile(true);
    }
  };

  const handleAddToFolder = () => {
    setClickBackground(true);
    if (partner.id) {
      if (isInFolder && onRemoveFromFolder) {
        setDeleteModal(true);
      } else {
        setShowAddToFolderModal(true);
      }
    } else {
      setClickBackground(false);
    }
  };

  return (
    <>
      <Box
        bg={clickBackground ? "#2CA9DF" : "#D1D1D1"}
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
            bg={clickBackground ? "#2CA9DF" : "transparent"}
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            // _focus={{
            //   outline: "none",
            //   bg: "#2CA9DF",
            // }}
            onClick={disableAddToFolder ? undefined : handleAddToFolder}
          >
            {isInFolder ? (
              <i
                className="fa-solid fa-trash"
                style={{ color: "#DC2626", fontSize: "20px" }}
              />
            ) : (
              <Image
                width={20}
                height={20}
                src="/assets/addicon.svg"
                alt="add"
                objectFit="contain"
              />
            )}
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
                <Avatar.Root
                  w="130px"
                  h="130px"
                  borderRadius="full"
                  border="6px solid #22C45E"
                >
                  <Avatar.Fallback
                    name={partner.first_name + " " + partner.last_name}
                    bg="gray.200"
                    color="gray.800"
                    fontWeight="bold"
                    fontSize="2xl"
                  />
                  {getCompanyLogo() && (
                    <Avatar.Image src={getCompanyLogo() || ""} />
                  )}
                </Avatar.Root>

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
            variant="partner"
            w="full"
            py={6}
            mt={4}
            onClick={handleViewFullProfile}
            disabled={!partner.id || disableViewFullProfile}
          >
            View Full Profile
          </Button>
        </Box>
      </Box>

      {showFullProfile && partner.id && (
        <FullProfileCard
          profileId={partner.id.toString()}
          profileType="partner"
          onClose={() => setShowFullProfile(false)}
        />
      )}

      {showAddToFolderModal && partner.id && !isInFolder && (
        <AddToFolderModal
          isOpen={showAddToFolderModal}
          onClose={() => setShowAddToFolderModal(false)}
          userId={partner.id.toString()}
          userName={partner.company_name || "Partner"}
          onAddToFolder={() => setClickBackground(true)}
          onResetBackground={() => setClickBackground(false)}
        />
      )}

      {deleteModal && (
        <DeleteModal
          isOpen={deleteModal}
          onClose={() => setDeleteModal(false)}
          onDelete={() => onRemoveFromFolder?.()}
          InFolder={true}
          onResetBackground={() => setClickBackground(false)}
        />
      )}
    </>
  );
}
