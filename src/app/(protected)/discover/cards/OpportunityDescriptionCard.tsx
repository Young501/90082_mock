"use client";

import { Opportunity, AccessibleOpportunity } from "@/types/opportunities";
import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Link,
  Dialog,
  Portal,
  Spinner,
} from "@chakra-ui/react";
import IconMoreEllipsis from "@/components/Icons/IconMoreEllipsis";
import Image from "next/image";
import IconExternalLink from "@/components/Icons/IconExternalLink";
import { MenuPopover } from "@/components/ui/MenuPopover";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { UnenrollDialog } from "@/components/ui/UnenrollDialog";
import {
  QuestionnaireForm,
  QuestionnaireFormRef,
} from "@/components/questionnaire/QuestionnaireForm";
import { getQuestionnaireSections } from "@/utils/opportunityQuestionnaire";
import { useResolveTaxonomyLabelsToCodes } from "@/hooks/useResolveTaxonomyLabelsToCodes";
import { useOpportunityParticipant } from "@/services/shared";
import { useUpdateOpportunityParticipant } from "@/services/updateParticipant";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store";
import { toast } from "react-toastify";
import { X } from "lucide-react";

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
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const accessibleOpportunity =
    currentOpportunity || (opportunity as AccessibleOpportunity);
  const enrollmentStatus =
    accessibleOpportunity?.enrollment_status ||
    (currentOpportunity?.is_enrolled ? "enrolled" : "not_enrolled");
  const visibilityDisplay =
    accessibleOpportunity?.visibility_display || "Public Opportunity";
  const isEnrolled = enrollmentStatus === "enrolled";

  const [isEditEnrollmentOpen, setIsEditEnrollmentOpen] = useState(false);
  const [isUnenrollDialogOpen, setIsUnenrollDialogOpen] = useState(false);
  const [editAnswers, setEditAnswers] = useState<Record<string, any>>({});
  const editFormRef = useRef<QuestionnaireFormRef>(null);

  const { data: participantRecord } = useOpportunityParticipant(
    opportunity.id,
    isEnrolled
  );
  const updateParticipantMutation = useUpdateOpportunityParticipant();
  const { resolve: resolveTaxonomyLabelsToCodes, isResolving: isResolvingEditAnswers } =
    useResolveTaxonomyLabelsToCodes();

  const questionnaireSections = useMemo(
    () => getQuestionnaireSections(opportunity.questionnaire, userType),
    [opportunity.questionnaire, userType]
  );
  const hasQuestionnaire = questionnaireSections.length > 0;

  const handleAnswersChange = useCallback((values: Record<string, any>) => {
    setEditAnswers(values);
  }, []);

  const handleOpenEditEnrollment = useCallback(async () => {
    const rawAnswers =
      participantRecord?.data?.questionnaire_answers ?? {};
    try {
      const resolved = await resolveTaxonomyLabelsToCodes(
        questionnaireSections,
        rawAnswers,
        null
      );
      setEditAnswers(resolved);
    } catch {
      setEditAnswers(rawAnswers);
    }
    setIsEditEnrollmentOpen(true);
  }, [
    participantRecord?.data?.questionnaire_answers,
    questionnaireSections,
    resolveTaxonomyLabelsToCodes,
  ]);

  const handleSaveEnrollmentAnswers = async () => {
    if (!editFormRef.current) return;
    const isValid = await editFormRef.current.validate();
    if (!isValid) return;

    const data = editFormRef.current.getValues();
    try {
      const updated = await updateParticipantMutation.mutateAsync({
        opportunityId: opportunity.id,
        questionnaireAnswers: data,
      });
      queryClient.setQueryData(
        ["opportunity-participant", opportunity.id],
        updated
      );
      toast.success("Enrollment answers saved!");
      setIsEditEnrollmentOpen(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Failed to save answers";
      toast.error(msg);
    }
  };

  const handleUnenrollClick = () => setIsUnenrollDialogOpen(true);

  const confirmUnenroll = async () => {
    try {
      await updateParticipantMutation.mutateAsync({
        opportunityId: opportunity.id,
        accepted: false,
      });
      toast.success("Successfully unenrolled from opportunity!");
      queryClient.removeQueries({
        queryKey: ["opportunity-participant", opportunity.id],
      });
      queryClient.setQueryData(
        ["opportunity-participant", opportunity.id],
        null
      );
      setIsUnenrollDialogOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["accessible-opportunities", user?.id],
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Failed to unenroll";
      toast.error(msg);
    }
  };

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
                    color="#1679AB"
                    fontWeight="500"
                  >
                    {visibilityDisplay} Opportunity
                  </Text>
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
                <MenuPopover placement="bottom-end" trigger={
                  <IconButton aria-label="More options" variant="ghost">
                    <IconMoreEllipsis color="#52525B" />
                  </IconButton>
                }>
                  {hasQuestionnaire && (
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
                        if (!isResolvingEditAnswers) handleOpenEditEnrollment();
                      }}
                      opacity={isResolvingEditAnswers ? 0.6 : 1}
                      cursor={isResolvingEditAnswers ? "not-allowed" : "pointer"}
                      pointerEvents={isResolvingEditAnswers ? "none" : "auto"}
                    >
                      {isResolvingEditAnswers ? (
                        <HStack gap={2}>
                          <Spinner size="sm" />
                          <span>Preparing form...</span>
                        </HStack>
                      ) : (
                        "Edit Enrollment Answers"
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
                    onClick={handleUnenrollClick}
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

      {/* Edit Enrollment Answers dialog */}
      <Dialog.Root
        open={isEditEnrollmentOpen}
        onOpenChange={(details) => setIsEditEnrollmentOpen(details.open)}
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" style={{ zIndex: 10000 }} />
          <Dialog.Positioner zIndex={10000}>
            <Dialog.Content
              maxW="682px"
              maxH="90vh"
              overflow="hidden"
              display="flex"
              flexDirection="column"
              zIndex={10000}
            >
              <Dialog.Header borderBottom="1px solid #E5E7EB" pb={4}>
                <Flex justify="space-between" align="center" w="full">
                  <Dialog.Title fontSize="2xl" fontWeight="600" color="#111827">
                    Edit Enrollment Answers
                  </Dialog.Title>
                  <IconButton
                    aria-label="Close"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditEnrollmentOpen(false)}
                  >
                    <X size={16} color="#6B7280" />
                  </IconButton>
                </Flex>
              </Dialog.Header>

              <Dialog.Body overflowY="auto" py={4}>
                {hasQuestionnaire ? (
                  <QuestionnaireForm
                    ref={editFormRef}
                    sections={questionnaireSections}
                    initialValues={editAnswers}
                    onAnswersChange={handleAnswersChange}
                    props={{ p: 0, border: "none" }}
                  />
                ) : (
                  <Text fontSize="sm" color="#6B7280" textAlign="center" py={6}>
                    No questionnaire available for this opportunity.
                  </Text>
                )}
              </Dialog.Body>

              <Dialog.Footer borderTop="1px solid #E5E7EB" pt={4}>
                <HStack gap={3} w="full" justify="flex-end">
                  <ButtonV2
                    variant="ghost"
                    color="#6B7280"
                    border="1px solid #E5E7EB"
                    borderRadius="xl"
                    h="44px"
                    fontSize="sm"
                    px={4}
                    onClick={() => setIsEditEnrollmentOpen(false)}
                  >
                    Cancel
                  </ButtonV2>
                  <ButtonV2
                    variant="secondary"
                    h="44px"
                    fontSize="sm"
                    px={5}
                    isLoading={updateParticipantMutation.isPending}
                    onClick={handleSaveEnrollmentAnswers}
                  >
                    Save an Update
                  </ButtonV2>
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <UnenrollDialog
        open={isUnenrollDialogOpen}
        onOpenChange={(details) => setIsUnenrollDialogOpen(details.open)}
        onConfirm={confirmUnenroll}
        isLoading={updateParticipantMutation.isPending}
      />
    </>
  );
};
