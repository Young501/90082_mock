"use client";

import { Opportunity, AccessibleOpportunity } from "@/types/opportunities";
import React from "react";
import { PROFILE_COLORS } from "@/theme/theme";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Link,
  Spinner,
} from "@chakra-ui/react";
import IconMoreEllipsis from "@/components/Icons/IconMoreEllipsis";
import Image from "next/image";
import IconExternalLink from "@/components/Icons/IconExternalLink";
import { MenuPopover } from "@/components/ui/MenuPopover";
import { UnenrollDialog } from "@/components/ui/UnenrollDialog";
import { EditEnrollmentDialog } from "@/components/ui/EditEnrollmentDialog";
import { useEnrollmentActions } from "@/hooks/useEnrollmentActions";
import {
  useSetDefaultOpportunity,
  useClearDefaultOpportunity,
} from "@/services/dashboard";
import { toast } from "react-toastify";

interface OpportunityDescriptionCardProps {
  opportunity: Opportunity | AccessibleOpportunity;
  currentOpportunity?: AccessibleOpportunity | null;
  links?: Array<{ label: string; url: string }>;
  userType?: string;
}

export const OpportunityDescriptionCard = ({
  opportunity,
  currentOpportunity,
  links = [],
  userType,
}: OpportunityDescriptionCardProps) => {
  const accessibleOpportunity =
    currentOpportunity || (opportunity as AccessibleOpportunity);
  const enrollmentStatus =
    accessibleOpportunity?.enrollment_status ||
    (currentOpportunity?.is_enrolled ? "enrolled" : "not_enrolled");
  const visibilityDisplay =
    accessibleOpportunity?.visibility_display || "Public Opportunity";
  const isEnrolled = enrollmentStatus === "enrolled";

  const enrollment = useEnrollmentActions({
    opportunityId: opportunity.id,
    questionnaire: opportunity.questionnaire,
    userType,
    isEnrolled,
  });
  const setDefaultMutation = useSetDefaultOpportunity();
  const clearDefaultMutation = useClearDefaultOpportunity();
  const isDefault = opportunity.is_default ?? false;

  return (
    <>
      <Box
        bg="white"
        borderRadius="12px"
        border="1px solid"
        borderColor="#E4E4E7"
        py={{ base: 4, md: 6 }}
        px={{ base: 4, md: 5 }}
        maxW="100%"
        w="100%"
      >
        <VStack align="flex-start" gap={3}>
          <HStack align="start" justify="space-between" gap={1} w="full">
            <Flex
              align="flex-start"
              justify="space-between"
              gap={{ base: 2, md: 3 }}
              flex="1"
              minW="0"
            >
              <Box
                flexShrink={0}
                w={{ base: "36px", md: "60px" }}
                h={{ base: "36px", md: "60px" }}
                bg="#F4F4F5"
                borderRadius={{ base: "12px", md: "20px" }}
                p={3}
              >
                {opportunity.logo_url ? (
                  <Image
                    src={opportunity.logo_url}
                    alt={opportunity.title}
                    width={36}
                    height={36}
                  />
                ) : (
                  <Image
                    src="/assets/opportunityLogoPlaceholder.svg"
                    alt="Placeholder"
                    width={36}
                    height={36}
                    style={{ objectFit: "contain" }}
                  />
                )}
              </Box>

              <VStack
                align="flex-start"
                gap={{ base: 1, md: 2 }}
                flex="1"
                minW="0"
              >
                <Text
                  fontSize={{ base: "md", md: "2xl" }}
                  fontWeight="semibold"
                  color="black"
                  lineHeight="1.2"
                >
                  {opportunity.title}
                </Text>
                <HStack gap={2} align="center" flexWrap="no-wrap">
                  <Text
                    fontSize={{ base: "xs", md: "md" }}
                    color={
                      userType === "organisation"
                        ? PROFILE_COLORS.organisation
                        : "#1679AB"
                    }
                    fontWeight="500"
                  >
                    {visibilityDisplay} Opportunity
                  </Text>
                  {isDefault && (
                    <Badge
                      bg="#F4F4F5"
                      color="#27272A"
                      fontSize={{ base: "2xs", md: "xs" }}
                      px={2}
                      py={0.5}
                      borderRadius="4px"
                      fontWeight="normal"
                    >
                      Default
                    </Badge>
                  )}
                </HStack>
              </VStack>
            </Flex>

            <HStack gap={2} align="center" flexShrink={0}>
              <Badge
                bg="transparent"
                boxShadow={
                  isEnrolled
                    ? "0px 0px 1px 0px #116932 inset"
                    : "0px 0px 1px 0px #EA580C inset"
                }
                fontSize={{ base: "xs", md: "sm" }}
                px={{ base: "6px", md: 3 }}
                py={{ base: "2px", md: 1 }}
                borderRadius="4px"
                fontWeight="normal"
                color={isEnrolled ? "#116932" : "#EA580C"}
              >
                {isEnrolled ? "Enrolled" : "Pending Enrollment"}
              </Badge>
              {isEnrolled && (
                <MenuPopover
                  placement="bottom-end"
                  trigger={
                    <IconButton aria-label="More options" variant="ghost">
                      <IconMoreEllipsis color="#52525B" />
                    </IconButton>
                  }
                >
                  {enrollment.hasQuestionnaire && (
                    <Box
                      as="button"
                      w="full"
                      textAlign="left"
                      px={3}
                      py={2}
                      fontSize="sm"
                      color="#374151"
                      borderRadius="md"
                      _hover={{ bg: "#F3F4F6" }}
                      onClick={() => {
                        if (!enrollment.isResolvingEditAnswers)
                          enrollment.handleOpenEditEnrollment();
                      }}
                      opacity={enrollment.isResolvingEditAnswers ? 0.6 : 1}
                      cursor={
                        enrollment.isResolvingEditAnswers
                          ? "not-allowed"
                          : "pointer"
                      }
                      pointerEvents={
                        enrollment.isResolvingEditAnswers ? "none" : "auto"
                      }
                    >
                      {enrollment.isResolvingEditAnswers ? (
                        <HStack gap={2}>
                          <Spinner size="sm" />
                          <span>Preparing form...</span>
                        </HStack>
                      ) : (
                        "Edit Enrollment Answers"
                      )}
                    </Box>
                  )}
                  {isDefault ? (
                    <Box
                      as="button"
                      w="full"
                      textAlign="left"
                      px={3}
                      py={2}
                      fontSize="sm"
                      color="#374151"
                      borderRadius="md"
                      _hover={{ bg: "#F3F4F6" }}
                      onClick={() =>
                        clearDefaultMutation.mutate(opportunity.id, {
                          onSuccess: () =>
                            toast.success("Default opportunity cleared"),
                          onError: () =>
                            toast.error("Failed to clear default opportunity"),
                        })
                      }
                      opacity={
                        clearDefaultMutation.isPending ||
                        setDefaultMutation.isPending
                          ? 0.6
                          : 1
                      }
                      cursor={
                        clearDefaultMutation.isPending ||
                        setDefaultMutation.isPending
                          ? "not-allowed"
                          : "pointer"
                      }
                      pointerEvents={
                        clearDefaultMutation.isPending ||
                        setDefaultMutation.isPending
                          ? "none"
                          : "auto"
                      }
                    >
                      {clearDefaultMutation.isPending ? (
                        <HStack gap={2}>
                          <Spinner size="sm" />
                          <span>Clearing...</span>
                        </HStack>
                      ) : (
                        "Clear default"
                      )}
                    </Box>
                  ) : (
                    <Box
                      as="button"
                      w="full"
                      textAlign="left"
                      px={3}
                      py={2}
                      fontSize="sm"
                      color="#374151"
                      borderRadius="md"
                      _hover={{ bg: "#F3F4F6" }}
                      onClick={() =>
                        setDefaultMutation.mutate(opportunity.id, {
                          onSuccess: () =>
                            toast.success("Opportunity set as default"),
                          onError: () =>
                            toast.error("Failed to set opportunity as default"),
                        })
                      }
                      opacity={
                        setDefaultMutation.isPending ||
                        clearDefaultMutation.isPending
                          ? 0.6
                          : 1
                      }
                      cursor={
                        setDefaultMutation.isPending ||
                        clearDefaultMutation.isPending
                          ? "not-allowed"
                          : "pointer"
                      }
                      pointerEvents={
                        setDefaultMutation.isPending ||
                        clearDefaultMutation.isPending
                          ? "none"
                          : "auto"
                      }
                    >
                      {setDefaultMutation.isPending ? (
                        <HStack gap={2}>
                          <Spinner size="sm" />
                          <span>Setting...</span>
                        </HStack>
                      ) : (
                        "Set as default"
                      )}
                    </Box>
                  )}
                  <Box
                    as="button"
                    w="full"
                    textAlign="left"
                    px={3}
                    py={2}
                    fontSize="sm"
                    color="#DC2626"
                    borderRadius="md"
                    _hover={{ bg: "#FEF2F2" }}
                    onClick={enrollment.handleUnenrollClick}
                  >
                    Unenroll from Opportunity
                  </Box>
                </MenuPopover>
              )}
            </HStack>
          </HStack>
          <HStack>
            {opportunity.description && (
              <Text fontSize="sm" color="black" maxW="788px">
                {opportunity.description}
              </Text>
            )}

            {links.length > 0 && (
              <HStack gap={4} flexWrap="wrap">
                {links.map((link, index) => (
                  <Box
                    key={index}
                    display="inline-flex"
                    alignItems="center"
                    gap={{ base: 1, md: 2 }}
                  >
                    <Link
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="#52525B"
                      fontSize={{ base: "xs", md: "sm" }}
                      fontWeight="medium"
                    >
                      {link.label}
                    </Link>
                    <IconExternalLink />
                  </Box>
                ))}
              </HStack>
            )}
          </HStack>
        </VStack>
      </Box>

      <EditEnrollmentDialog
        open={enrollment.isEditEnrollmentOpen}
        onOpenChange={(details) =>
          enrollment.setIsEditEnrollmentOpen(details.open)
        }
        sections={enrollment.questionnaireSections}
        initialValues={enrollment.editAnswers}
        onAnswersChange={enrollment.handleAnswersChange}
        onSave={enrollment.handleSaveEnrollmentAnswers}
        isSaving={enrollment.updateParticipantMutation.isPending}
        formRef={enrollment.editFormRef}
      />

      <UnenrollDialog
        open={enrollment.isUnenrollDialogOpen}
        onOpenChange={(details) =>
          enrollment.setIsUnenrollDialogOpen(details.open)
        }
        onConfirm={enrollment.confirmUnenroll}
        isLoading={enrollment.updateParticipantMutation.isPending}
      />
    </>
  );
};
