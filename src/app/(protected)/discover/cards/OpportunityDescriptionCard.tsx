"use client";

import { Opportunity, AccessibleOpportunity } from "@/types/opportunities";
import React, { useState } from "react";
import { PROFILE_COLORS } from "@/theme/theme";
import {
  Avatar,
  Box,
  Button,
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
import { MenuPopover } from "@/components/ui/MenuPopover";
import { UnenrollDialog } from "@/components/ui/UnenrollDialog";
import { HideFromPeersDialog } from "@/components/ui/HideFromPeersDialog";
import { EditEnrollmentDialog } from "@/components/ui/EditEnrollmentDialog";
import { useEnrollmentActions } from "@/hooks/useEnrollmentActions";
import {
  useSetDefaultOpportunity,
  useClearDefaultOpportunity,
} from "@/services/dashboard";
import { toast } from "react-toastify";
import { ExternalLink, Mail, MessageCircle, EyeOff } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { ContactPage } from "@/components/ContactPage";
import { useAuthStore } from "@/store";

interface OpportunityDescriptionCardProps {
  opportunity: Opportunity | AccessibleOpportunity;
  currentOpportunity?: AccessibleOpportunity | null;
  userType?: string;
}

export const OpportunityDescriptionCard = ({
  opportunity,
  currentOpportunity,
  userType,
}: OpportunityDescriptionCardProps) => {
  const [showContact, setShowContact] = useState(false);
  const accessibleOpportunity =
    currentOpportunity || (opportunity as AccessibleOpportunity);
  const enrollmentStatus =
    accessibleOpportunity?.enrollment_status ||
    (currentOpportunity?.is_enrolled ? "enrolled" : "not_enrolled");
  const visibilityDisplay =
    accessibleOpportunity?.visibility_display || "Public Opportunity";
  const isEnrolled = enrollmentStatus === "enrolled";
  const coordinator = accessibleOpportunity?.coordinator ?? null;
  const showCoordinator = !!coordinator;

  const { user } = useAuthStore();
  // Org questionnaires resolve "dynamic" taxonomy fields against the
  // opportunity's university, not the (university-less) organisation user
  const university =
    userType === "organisation" ? opportunity.university : user?.university;

  const enrollment = useEnrollmentActions({
    opportunityId: opportunity.id,
    questionnaire: opportunity.questionnaire,
    userType,
    isEnrolled,
    isHidden: currentOpportunity?.is_hidden ?? false,
    university,
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
              gap={{ base: 2, md: 4 }}
              flex="1"
              minW="0"
            >
              <Box
                flexShrink={0}
                w={{ base: "52px", md: "80px" }}
                h={{ base: "52px", md: "80px" }}
              >
                {opportunity.logo_url ? (
                  <Image
                    src={opportunity.logo_url}
                    alt={opportunity.title}
                    width={80}
                    height={80}
                  />
                ) : (
                  <Image
                    src="/assets/opportunityLogoPlaceholder.svg"
                    alt="Placeholder"
                    width={80}
                    height={80}
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
                  {enrollment.isHidden && (
                    <Tooltip
                      content="Your profile is hidden from other participants in this opportunity"
                      showArrow
                    >
                      <Badge
                        bg="#FEF2F2"
                        color="#EF4444"
                        fontSize={{ base: "2xs", md: "xs" }}
                        px={2}
                        py={0.5}
                        borderRadius="4px"
                        fontWeight="normal"
                        display="flex"
                        alignItems="center"
                        gap={1}
                      >
                        <EyeOff size={10} />
                        Hidden
                      </Badge>
                    </Tooltip>
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
                    color="#374151"
                    borderRadius="md"
                    _hover={{ bg: "#F3F4F6" }}
                    onClick={enrollment.handleHideClick}
                  >
                    {enrollment.isHidden
                      ? "Show profile to peers"
                      : "Hide profile from peers"}
                  </Box>
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
          </HStack>

          {(Array.isArray(opportunity.links) && opportunity.links.length > 0) ||
          showCoordinator ? (
            <Flex
              w="100%"
              align={{ base: "flex-start", md: "center" }}
              justify="space-between"
              gap={4}
              flexDirection={{ base: "column", md: "row" }}
            >
              <Flex flexWrap="wrap" gap={4} align="center" rowGap={1.5}>
                {Array.isArray(opportunity.links) &&
                  opportunity.links.map((link, index) => {
                    const href = link.url?.trim() ?? "";
                    const label = link.label?.trim() ?? href;
                    if (!href) return null;
                    const isHttp =
                      href.startsWith("https://") || href.startsWith("http://");
                    const isMailto = href.startsWith("mailto:");
                    return (
                      <Link
                        key={`${href}-${index}`}
                        href={href}
                        fontSize="sm"
                        color="#52525B"
                        fontWeight="medium"
                        _hover={{ textDecoration: "underline" }}
                        {...(isHttp
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : isMailto
                            ? { target: "_self" }
                            : {})}
                      >
                        <HStack gap={2} align="center">
                          {label}
                          {isHttp && (
                            <ExternalLink
                              size={12}
                              strokeWidth={3}
                              color="#71717A"
                              aria-hidden
                            />
                          )}
                          {isMailto && (
                            <Mail
                              size={12}
                              strokeWidth={3}
                              color="#71717A"
                              aria-hidden
                            />
                          )}
                        </HStack>
                      </Link>
                    );
                  })}
              </Flex>
              {showCoordinator && coordinator && (
                <HStack
                  gap={2}
                  px={3}
                  py={1.5}
                  borderRadius="10px"
                  border="1px solid"
                  borderColor="#E4E4E7"
                  bg="#FAFAFA"
                  flexShrink={0}
                  align="center"
                >
                  <Avatar.Root size="xs">
                    {coordinator.profile_picture_url ? (
                      <Avatar.Image
                        src={coordinator.profile_picture_url}
                        alt={`${coordinator.first_name} ${coordinator.last_name}`}
                      />
                    ) : null}
                    <Avatar.Fallback
                      name={`${coordinator.first_name} ${coordinator.last_name}`}
                    />
                  </Avatar.Root>
                  <VStack align="flex-start" gap={0}>
                    <Text fontSize="xs" fontWeight="semibold" color="#27272A">
                      {coordinator.first_name} {coordinator.last_name}
                    </Text>
                    <Text fontSize="xs" color="#71717A">
                      Coordinator
                    </Text>
                  </VStack>
                  <Button
                    size="xs"
                    variant="outline"
                    borderColor="#3AADA8"
                    color="#3AADA8"
                    _hover={{ bg: "#F0FAFA" }}
                    borderRadius="lg"
                    onClick={() => setShowContact(true)}
                  >
                    <MessageCircle size={12} />
                    Contact
                  </Button>
                </HStack>
              )}
            </Flex>
          ) : null}
        </VStack>
      </Box>

      {showCoordinator && coordinator && showContact && (
        <ContactPage
          recipientId={coordinator.id}
          recipientName={`${coordinator.first_name} ${coordinator.last_name}`}
          profileType="student"
          acceptedOpportunityId={String(opportunity.id)}
          onBack={() => setShowContact(false)}
        />
      )}

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
        university={university}
      />

      <UnenrollDialog
        open={enrollment.isUnenrollDialogOpen}
        onOpenChange={(details) =>
          enrollment.setIsUnenrollDialogOpen(details.open)
        }
        onConfirm={enrollment.confirmUnenroll}
        isLoading={enrollment.updateParticipantMutation.isPending}
      />

      <HideFromPeersDialog
        open={enrollment.isHideDialogOpen}
        onOpenChange={(details) => enrollment.setIsHideDialogOpen(details.open)}
        onConfirm={enrollment.confirmToggleHidden}
        isLoading={enrollment.updateParticipantMutation.isPending}
        isHidden={enrollment.isHidden}
      />
    </>
  );
};
