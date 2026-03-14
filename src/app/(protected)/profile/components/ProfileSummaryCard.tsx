"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Text,
  Flex,
  Avatar,
  IconButton,
  VStack,
  HStack,
  Separator,
} from "@chakra-ui/react";
import { Copy, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { MenuPopover } from "@/components/ui/MenuPopover";
import { FullProfileCard } from "@/app/(protected)/discover/cards/FullProfileCard";
import {
  useAccessibleOpportunities,
  categorizeOpportunities,
} from "@/services/shared";
import { useAuthStore } from "@/store";
import type { AccessibleOpportunity } from "@/types/opportunities";

export interface ProfileSummaryCardProps {
  profilePictureUrl?: string | null;
  fullName: string;
  userId?: string;
  email?: string;
  university?: string;
  course?: string;
  yearOfStudy?: string;
  userType?: string;
  profileId?: string;
}

function safeString(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value === "string") return value.trim() || undefined;
  if (typeof value === "number") return String(value);
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    if (typeof obj.label === "string") return obj.label.trim() || undefined;
    if (typeof obj.name === "string") return obj.name.trim() || undefined;
  }
  return undefined;
}

export function ProfileSummaryCard({
  profilePictureUrl,
  fullName,
  userId,
  email,
  university,
  course,
  yearOfStudy,
  userType,
  profileId,
}: ProfileSummaryCardProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<{
    id: number;
    title: string;
    slug?: string;
  } | null>(null);

  const { data: opportunities } = useAccessibleOpportunities();
  const { userProfile } = useAuthStore();

  const opportunityList = useMemo(() => {
    if (!opportunities) return [];
    const { enrolled, closed } = categorizeOpportunities(opportunities);
    // filter out opportunities that don't have access
    return [
      ...enrolled.filter((o) => "access" in o && o.access?.has_access),
      ...closed,
    ] as AccessibleOpportunity[];
  }, [opportunities]);


  const handleSelectOpportunity = (opp: {
    id: number;
    title: string;
    slug?: string;
  }) => {
    setSelectedOpportunity(opp);
    setPopoverOpen(false);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedOpportunity(null);
  };

  const profileType = userType === "organisation" ? "organisation" : "student";
  const effectiveProfileId =
    profileId ??
    (userType === "organisation"
      ? (
          userProfile as { organisation?: { id?: number } }
        )?.organisation?.id?.toString()
      : ((userProfile as { id?: number })?.id?.toString() ??
        (userProfile as { id?: string })?.id));
  const canPreview =
    userType &&
    profileType &&
    effectiveProfileId &&
    (userType === "student" || userType === "organisation");

  const triggerButton = (
    <ButtonV2
      position="absolute"
      right={{ base: 4, md: 6 }}
      top={{ base: 4, md: 6 }}
      icon={<ChevronDown size={16} style={{ marginLeft: 4 }} />}
      variant="secondary"
      h="44px"
      iconPosition="end"
    >
      Preview Profile
    </ButtonV2>
  );

  return (
    <>
      <Box
        w="100%"
        bg="white"
        borderRadius="12px"
        border="1px solid"
        borderColor="#E4E4E7"
        p={{ base: "16px", md: "24px" }}
        position="relative"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ base: "flex-start", md: "flex-start" }}
          justify="space-between"
          gap={6}
        >
          <Avatar.Root
            w="60px"
            h="60px"
            borderRadius="full"
            border="2px solid"
            borderColor="#D6EDFB"
          >
            {profilePictureUrl && (
              <Avatar.Image src={profilePictureUrl} alt={fullName} />
            )}
            <Avatar.Fallback
              name={fullName}
              bg="#F4F4F5"
              color="#71717A"
              fontWeight="600"
              fontSize="xl"
            />
          </Avatar.Root>
          <VStack flex={1} align="stretch" gap={1}>
            <Text fontSize="xl" fontWeight="bold" color="#000000">
              {fullName || "—"}
            </Text>
            <VStack align="stretch" gap={2}>
              {safeString(userId) && (
                <HStack align="center" gap={2}>
                  <Text fontSize="sm" color="#71717A">
                    User ID: {safeString(userId)}
                  </Text>
                  <IconButton
                    aria-label="Copy User ID"
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      const id = safeString(userId);
                      if (id) {
                        navigator.clipboard.writeText(id);
                        toast.success("User ID copied to clipboard");
                      }
                    }}
                  >
                    <Copy size={14} color="#71717A" />
                  </IconButton>
                </HStack>
              )}
              {safeString(email) && (
                <Text fontSize="sm" color="#71717A">
                  {safeString(email)}
                </Text>
              )}
            </VStack>
            {(safeString(university) ||
              safeString(course) ||
              safeString(yearOfStudy)) && (
              <Flex
                mt={4}
                gap={{ base: 6, md: 8, lg: 10 }}
                flexWrap="wrap"
                align="center"
              >
                {safeString(university) && (
                  <VStack align="stretch" gap={1}>
                    <Text fontSize="sm" color="#A1A1AA">
                      University
                    </Text>
                    <Text fontSize="md" color="#52525B">
                      {safeString(university)}
                    </Text>
                  </VStack>
                )}
                {safeString(university) &&
                  (safeString(course) || safeString(yearOfStudy)) && (
                    <Separator orientation="vertical" minH="49px" />
                  )}
                {safeString(course) && (
                  <VStack align="stretch" gap={1}>
                    <Text fontSize="sm" color="#A1A1AA">
                      Course
                    </Text>
                    <Text fontSize="md" color="#52525B">
                      {safeString(course)}
                    </Text>
                  </VStack>
                )}
                {safeString(course) && safeString(yearOfStudy) && (
                  <Separator orientation="vertical" minH="49px" />
                )}
                {safeString(yearOfStudy) && (
                  <VStack align="stretch" gap={1}>
                    <Text fontSize="sm" color="#A1A1AA">
                      Year of Study
                    </Text>
                    <Text fontSize="md" color="#52525B">
                      {safeString(yearOfStudy)}
                    </Text>
                  </VStack>
                )}
              </Flex>
            )}
          </VStack>

          {canPreview && (
            <MenuPopover
              trigger={triggerButton}
              open={popoverOpen}
              onOpenChange={setPopoverOpen}
              placement="bottom-end"
              minW="240px"
              maxW="320px"
            >
              <VStack align="stretch" gap={0} py={1}>
                {opportunityList.length === 0 ? (
                  <Box
                    px={4}
                    py={3}
                    fontSize="sm"
                    color="#18181B"
                    cursor="pointer"
                    display="flex"
                    alignItems="center"
                    gap={3}
                    _hover={{ bg: "#F4F4F5" }}
                    onClick={() => {
                      setPopoverOpen(false);
                      setSelectedOpportunity(null);
                      setDrawerOpen(true);
                    }}
                  >
                    <Box
                      w="16px"
                      h="16px"
                      borderRadius="full"
                      border="2px solid"
                      borderColor="profile.500"
                      bg="profile.500"
                      flexShrink={0}
                      position="relative"
                    >
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        w="6px"
                        h="6px"
                        borderRadius="full"
                        bg="white"
                      />
                    </Box>
                    <Text flex={1}>Default</Text>
                    <Box
                      px={2}
                      py={0.5}
                      borderRadius="md"
                      bg="#F4F4F5"
                      fontSize="xs"
                      color="#71717A"
                      fontWeight="500"
                    >
                      Default
                    </Box>
                  </Box>
                ) : (
                  (() => {
                    const defaultIndex = opportunityList.findIndex(
                      (o) =>
                        "access" in o &&
                        o.access?.has_access &&
                        o.enrollment_status === "enrolled"
                    );
                    return opportunityList.map((opp, index) => {
                      const isEnrolledWithAccess =
                        "access" in opp &&
                        opp.access?.has_access &&
                        opp.enrollment_status === "enrolled";
                      const isDefault =
                        isEnrolledWithAccess && index === defaultIndex;
                    const isSelected =
                      selectedOpportunity?.id === opp.id ||
                      (!selectedOpportunity && isDefault);
                    return (
                      <Box
                        key={opp.id}
                        as="button"
                        w="full"
                        textAlign="left"
                        px={4}
                        py={3}
                        fontSize="sm"
                        color="#18181B"
                        display="flex"
                        alignItems="center"
                        gap={3}
                        _hover={{ bg: "#F4F4F5" }}
                        onClick={() =>
                          handleSelectOpportunity({
                            id: opp.id,
                            title: opp.title,
                            slug: opp.slug,
                          })
                        }
                      >
                        <Box
                          w="16px"
                          h="16px"
                          borderRadius="full"
                          border="2px solid"
                          borderColor={isSelected ? "profile.500" : "#D4D4D8"}
                          bg={isSelected ? "profile.500" : "white"}
                          flexShrink={0}
                          position="relative"
                        >
                          {isSelected && (
                            <Box
                              position="absolute"
                              top="50%"
                              left="50%"
                              transform="translate(-50%, -50%)"
                              w="6px"
                              h="6px"
                              borderRadius="full"
                              bg="white"
                            />
                          )}
                        </Box>
                        <Text flex={1} truncate>
                          {opp.title}
                        </Text>
                        {isDefault && (
                          <Box
                            px={2}
                            py={0.5}
                            borderRadius="md"
                            bg="#F4F4F5"
                            fontSize="xs"
                            color="#71717A"
                            fontWeight="500"
                          >
                            Default
                          </Box>
                        )}
                      </Box>
                    );
                    });
                  })()
                )}
              </VStack>
            </MenuPopover>
          )}
        </Flex>
      </Box>

      {drawerOpen && effectiveProfileId && (
        <FullProfileCard
          profileId={effectiveProfileId}
          profileType={profileType}
          onClose={handleCloseDrawer}
          opportunityId={
            selectedOpportunity?.id ? String(selectedOpportunity.id) : undefined
          }
          opportunitySlug={selectedOpportunity?.slug}
          isPreview
        />
      )}
    </>
  );
}
