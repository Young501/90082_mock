"use client";
import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  Box,
  Text,
  Button,
  Flex,
  VStack,
  HStack,
  Spinner,
  Alert,
  Dialog,
  Portal,
  Badge,
  IconButton,
} from "@chakra-ui/react";
import {
  useAccessibleOpportunities,
  categorizeOpportunities,
  useOpportunityParticipant,
} from "@/services/shared";
import {
  useUpdateOpportunityParticipant,
  useEnrollInOpportunity,
} from "@/services/updateParticipant";
import { useCancelSubscription } from "@/services/subscription";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store";
import IconMoreEllipsis from "@/components/Icons/IconMoreEllipsis";

import {
  Opportunity,
  AccessibleOpportunity,
  AccessInfo,
} from "@/types/opportunities";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { MenuPopover } from "@/components/ui/MenuPopover";
import {
  QuestionnaireForm,
  QuestionnaireFormRef,
} from "@/components/questionnaire/QuestionnaireForm";
import { getQuestionnaireSections } from "@/utils/opportunityQuestionnaire";
import { useResolveTaxonomyLabelsToCodes } from "@/hooks/useResolveTaxonomyLabelsToCodes";
import { Question } from "@/types/onboarding";
import { toast } from "react-toastify";
import { formatAnswerForDisplay } from "@/utils/formatAnswer";
import OpportunityCardSkeleton from "./ui/OpportunityCardSkeleton";
import { getSubscriptionStatusDisplay } from "@/utils/subscriptionPermissions";
import { formatDate, formatShortDate } from "@/utils/formatDate";
import { ChevronDown, ChevronUp, MoreVertical, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface OpportunityCardProps {
  opportunity: Opportunity | AccessibleOpportunity;
  userType: string;
  type: "enrolled" | "closed";
}

const OpportunityCard = ({
  opportunity,
  userType,
  type,
}: OpportunityCardProps) => {
  const router = useRouter();
  const accessibleOpportunity = opportunity as AccessibleOpportunity;
  const [isAnswersExpanded, setIsAnswersExpanded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCancelSubscriptionDialogOpen, setIsCancelSubscriptionDialogOpen] =
    useState(false);
  const [isEditEnrollmentOpen, setIsEditEnrollmentOpen] = useState(false);
  const [editAnswers, setEditAnswers] = useState<Record<string, any>>({});
  const editFormRef = useRef<QuestionnaireFormRef>(null);

  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const {
    data: participantRecord,
    isLoading: isParticipantLoading,
    error: participantError,
  } = useOpportunityParticipant(
    opportunity.id,
    type === "enrolled" && !isCancelled
  );

  const getAccessInfo = (): AccessInfo | null => {
    if (participantRecord?.access) return participantRecord.access;
    if (accessibleOpportunity?.access) return accessibleOpportunity.access;
    return null;
  };

  // Update mutation
  const updateParticipantMutation = useUpdateOpportunityParticipant();

  // Re-enroll mutation
  const reEnrollMutation = useEnrollInOpportunity();

  const cancelSubscriptionMutation = useCancelSubscription();

  const questionnaire = useMemo(() => {
    if (!opportunity.questionnaire) return [];

    // Convert questionnaire object to array of questions
    const questions: Question[] = [];
    Object.values(opportunity.questionnaire).forEach((pageQuestions: any) => {
      if (Array.isArray(pageQuestions)) {
        questions.push(...pageQuestions);
      }
    });
    return questions;
  }, [opportunity.questionnaire]);

  // Check if questionnaire itself is empty
  const hasQuestionnaire = useMemo(() => {
    return questionnaire.length > 0;
  }, [questionnaire]);

  // Merge saved answers with questionnaire definitions for display.
  // Iterates the actual saved answer keys so nothing is skipped.
  // If a matching question definition exists it is used for type-aware
  // formatting; otherwise a smart fallback is applied.
  const answersToDisplay = useMemo(() => {
    const saved = participantRecord?.data?.questionnaire_answers;
    if (!saved) return [];

    return Object.entries(saved)
      .filter(
        ([, value]) => value !== null && value !== undefined && value !== ""
      )
      .map(([key, value]) => {
        const question = questionnaire.find((q) => q.field === key);
        const label =
          question?.label ||
          key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        const display = question
          ? formatAnswerForDisplay(question, value)
          : Array.isArray(value)
            ? (value as any[]).join(", ")
            : String(value);
        return { key, label, display };
      });
  }, [questionnaire, participantRecord?.data?.questionnaire_answers]);

  const questionnaireSections = useMemo(
    () => getQuestionnaireSections(opportunity.questionnaire, userType),
    [opportunity.questionnaire, userType]
  );

  const { resolve: resolveTaxonomyLabelsToCodes, isResolving: isResolvingEditAnswers } =
    useResolveTaxonomyLabelsToCodes();

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
      // Fallback: use raw answers; taxonomy fields will attempt label→code normalization
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

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleReEnroll = async (data?: any) => {
    if (questionnaireSections.length > 0) {
      const dest = slug || String(opportunity.id);
      router.push(`/opportunities/fill?opp=${dest}`);
      return;
    }

    try {
      await reEnrollMutation.mutateAsync({
        opportunityId: opportunity.id,
      });

      toast.success("Successfully re-enrolled in opportunity!");

      setIsExpanded(false);

      queryClient.invalidateQueries({
        queryKey: ["accessible-opportunities", user?.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["all-opportunities", user?.id],
      });
    } catch (error: any) {
      // console.error("Re-enroll failed:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to re-enroll in opportunity";
      toast.error(errorMessage);
    }
  };

  const handleCancelEnrollment = () => {
    setIsCancelDialogOpen(true);
  };

  const handleCancelSubscription = () => {
    setIsCancelSubscriptionDialogOpen(true);
  };

  const confirmCancelSubscription = async () => {
    try {
      await cancelSubscriptionMutation.mutateAsync(opportunity.id);

      const accessInfo = getAccessInfo();
      const expiryDate = accessInfo?.subscription?.current_period_end;
      const formattedDate = formatDate(expiryDate || "");

      toast.success(
        `Subscription canceled — access until ${formattedDate || "end of period"}`
      );

      setIsCancelSubscriptionDialogOpen(false);
    } catch (error: any) {
      // console.error("Cancel subscription failed:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to cancel subscription";
      toast.error(errorMessage);
    }
  };

  const confirmCancelEnrollment = async () => {
    try {
      await updateParticipantMutation.mutateAsync({
        opportunityId: opportunity.id,
        accepted: false,
      });

      toast.success("Successfully cancelled enrollment!");
      queryClient.removeQueries({
        queryKey: ["opportunity-participant", opportunity.id],
      });
      queryClient.setQueryData(
        ["opportunity-participant", opportunity.id],
        null
      );

      setIsCancelled(true);
      setIsExpanded(false);
      setIsCancelDialogOpen(false);

      queryClient.invalidateQueries({
        queryKey: ["accessible-opportunities", user?.id],
      });
    } catch (error: any) {
      // console.error("Cancel enrollment failed:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to cancel enrollment";
      toast.error(errorMessage);
    }
  };

  const opportunityIsEnrolled = (opportunity as any)?.is_enrolled === true;
  const isEnrolled = useMemo(
    () =>
      !isCancelled &&
      (participantRecord?.accepted === true || opportunityIsEnrolled),
    [isCancelled, participantRecord?.accepted, opportunityIsEnrolled]
  );
  const enrolledDate =
    (participantRecord?.data as any)?.created_at || opportunity.start_date;
  const slug = "slug" in opportunity && opportunity.slug;

  return (
    <>
      <Box
        borderRadius="12px"
        bg="white"
        border="1px solid #E4E4E7"
        boxShadow="0 1px 3px rgba(0,0,0,0.06)"
        overflow="hidden"
        w="100%"
        maxW="100%"
      >
        {type === "enrolled" ? (
          <Box p={5}>
            <Flex justify="space-between" align="flex-start" gap={3} mb={5}>
              <HStack gap={3} flex={1} minW={0} flexWrap="wrap" align="center">
                <Text
                  fontSize="xl"
                  fontWeight="700"
                  color="#111827"
                  wordBreak="break-word"
                  lineHeight="short"
                >
                  {opportunity.title}
                </Text>
                {/* {(!isParticipantLoading && participantRecord) ( */}
                <Badge
                  bg="transparent"
                  // border="1px solid"
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
                {/* )} */}
              </HStack>
             {questionnaireSections.length > 0 && <MenuPopover
                placement="bottom-end"
                trigger={
                  <IconButton
                    aria-label="More options"
                    variant="ghost"
                    size="sm"
                  >
                    <IconMoreEllipsis color="#9CA3AF" />
                  </IconButton>
                }
              >
                {questionnaireSections.length > 0 && (
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
                {(() => {
                  const accessInfo = getAccessInfo();
                  const canCancel =
                    accessInfo?.subscription?.status === "active" ||
                    accessInfo?.subscription?.status === "trialing";
                  if (
                    canCancel &&
                    !accessInfo?.subscription?.cancel_at_period_end
                  ) {
                    return (
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
                        onClick={handleCancelSubscription}
                      >
                        Cancel Subscription
                      </Box>
                    );
                  }
                  return null;
                })()}
              </MenuPopover>}
            </Flex>

            {/* Metadata row */}
            <HStack gap={8} flexWrap="wrap" mb={5} justify="space-between">
              <Box>
                <Text color="#A1A1AA" fontSize="sm" fontWeight="400" mb={1}>
                  Opportunity Type
                </Text>
                <Text color="#52525B" fontSize="sm" fontWeight="400">
                  {accessibleOpportunity?.visibility_display || "Open Public"}
                </Text>
              </Box>
              <Box>
                <Text color="#A1A1AA" fontSize="sm" fontWeight="400" mb={1}>
                  Enrolled Date
                </Text>
                <Text color="#52525B" fontSize="sm" fontWeight="400">
                  {formatShortDate(enrolledDate)}
                </Text>
              </Box>
              <Box>
                <Text color="#A1A1AA" fontSize="sm" fontWeight="400" mb={1}>
                  Duration
                </Text>
                <Text color="#52525B" fontSize="sm" fontWeight="400">
                  {formatShortDate(opportunity.start_date)} –{" "}
                  {formatShortDate(opportunity.end_date)}
                </Text>
              </Box>
            </HStack>

            {/* Collapsible Enrollment Answers */}
            {(isParticipantLoading ||
              (participantRecord?.data?.questionnaire_answers &&
                Object.keys(participantRecord.data.questionnaire_answers)
                  .length > 0)) && (
              <Box border="1px solid #E5E7EB" borderRadius="12px" mb={5}>
                <Flex
                  align="center"
                  justify="space-between"
                  cursor="pointer"
                  py={3}
                  px={4}
                  borderBottom={
                    isAnswersExpanded ? "1px solid #E5E7EB" : "none"
                  }
                  onClick={() => setIsAnswersExpanded(!isAnswersExpanded)}
                  transition="background 0.15s"
                >
                  <Text fontSize="sm" fontWeight="500" color="#374151">
                    Enrollment Answers
                  </Text>
                  {isAnswersExpanded ? (
                    <ChevronUp size={16} color="#9CA3AF" />
                  ) : (
                    <ChevronDown size={16} color="#9CA3AF" />
                  )}
                </Flex>

                {isAnswersExpanded && (
                  <Box mt={0} py={3} px={4} bg="#FAFAFA">
                    {isParticipantLoading ? (
                      <HStack py={3} justify="center" gap={2}>
                        <Spinner size="sm" color="#9CA3AF" />
                        <Text fontSize="sm" color="#9CA3AF">
                          Loading answers...
                        </Text>
                      </HStack>
                    ) : participantError ? (
                      <Text fontSize="sm" color="#9CA3AF" py={2}>
                        Unable to load enrollment answers.
                      </Text>
                    ) : answersToDisplay.length === 0 ? (
                      <Text fontSize="sm" color="#9CA3AF" py={2}>
                        No answers recorded.
                      </Text>
                    ) : (
                      <VStack align="stretch" gap={4}>
                        {answersToDisplay.map(({ key, label, display }) => (
                          <Box key={key}>
                            <Text fontSize="sm" color="#52525B" mb={1.5}>
                              {label}
                            </Text>
                            <Box
                              px={2.5}
                              py={2}
                              bg="#F4F4F5"
                              borderRadius="4px"
                            >
                              <Text fontSize="sm" color="black">
                                {display}
                              </Text>
                            </Box>
                          </Box>
                        ))}
                      </VStack>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {/* Action buttons */}
            <Flex justify="flex-end" gap={2.5} flexWrap="wrap">
              <ButtonV2
                variant="ghost"
                color="#6B7280"
                bg="#F4F4F5"
                borderRadius="xl"
                h="32px"
                fontSize="xs"
                fontWeight="500"
                px={4}
                isLoading={updateParticipantMutation.isPending}
                onClick={handleCancelEnrollment}
              >
                Unenroll
              </ButtonV2>
              <ButtonV2
                variant="secondary"
                onClick={() => router.push(`/discover/?opp=${slug}`)}
              >
                View Opportunity
              </ButtonV2>
            </Flex>
          </Box>
        ) : (
          <>
            <Box
              p={4}
              _hover={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transform: "translateY(-2px)",
              }}
              transition="all 0.2s ease"
            >
              <Flex justify="space-between" align="start" gap={4}>
                <Box flex={1} minW={0}>
                  <Flex justify="space-between" align="start" gap={4}>
                    <HStack
                      gap={3}
                      flex={1}
                      minW={0}
                      flexWrap="wrap"
                      align="center"
                      mb={{ base: 2, md: 5 }}
                    >
                      <Text
                        fontSize="18px"
                        fontWeight="600"
                        color="#1F2937"
                        wordBreak="break-word"
                      >
                        {opportunity.title}
                      </Text>
                      <Badge
                        bg="transparent"
                        // border="1px solid"
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
                    </HStack>
                    <MenuPopover
                      placement="bottom-end"
                      trigger={
                        <IconButton
                          aria-label="More options"
                          variant="ghost"
                          size="sm"
                        >
                          <IconMoreEllipsis color="#9CA3AF" />
                        </IconButton>
                      }
                    >
                      {isEnrolled ? (
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
                          onClick={handleCancelEnrollment}
                        >
                          Unenroll
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
                          onClick={handleReEnroll}
                        >
                          {reEnrollMutation.isPending
                            ? "Re-enrolling…"
                            : "Re-enroll in Opportunity"}
                        </Box>
                      )}
                    </MenuPopover>
                  </Flex>
                  <Text
                    fontSize="14px"
                    color="#6B7280"
                    mb={3}
                    wordBreak="break-word"
                  >
                    {opportunity.description}
                  </Text>
                  <HStack
                    gap={8}
                    flexWrap="wrap"
                    mb={5}
                    justify="space-between"
                  >
                    <Box>
                      <Text
                        color="#A1A1AA"
                        fontSize="sm"
                        fontWeight="400"
                        mb={1}
                      >
                        Opportunity Type
                      </Text>
                      <Text color="#52525B" fontSize="sm" fontWeight="400">
                        {accessibleOpportunity?.visibility_display ||
                          "Open Public"}
                      </Text>
                    </Box>
                    <Box>
                      <Text
                        color="#A1A1AA"
                        fontSize="sm"
                        fontWeight="400"
                        mb={1}
                      >
                        Enrolled Date
                      </Text>
                      <Text color="#52525B" fontSize="sm" fontWeight="400">
                        {formatShortDate(enrolledDate)}
                      </Text>
                    </Box>
                    <Box>
                      <Text
                        color="#A1A1AA"
                        fontSize="sm"
                        fontWeight="400"
                        mb={1}
                      >
                        Duration
                      </Text>
                      <Text color="#52525B" fontSize="sm" fontWeight="400">
                        {formatShortDate(opportunity.start_date)} –{" "}
                        {formatShortDate(opportunity.end_date)}
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              </Flex>
            </Box>
          </>
        )}
      </Box>

      <Dialog.Root
        open={isCancelDialogOpen}
        onOpenChange={(details) => setIsCancelDialogOpen(details.open)}
        placement="center"
        // trapFocus={true}
      >
        <Portal>
          <Dialog.Positioner
            zIndex={9999}
            style={{ backdropFilter: "blur(4px)" }}
          >
            <Dialog.Content maxW="512px" zIndex={10000}>
              <Dialog.Header>
                <Flex justify="space-between" w="full" align="center">
                  <Dialog.Title fontSize="lg" fontWeight="bold">
                    Unenroll from Opportunity
                  </Dialog.Title>
                  <IconButton
                    aria-label="Close"
                    variant="ghost"
                    onClick={() => setIsCancelDialogOpen(false)}
                  >
                    <X size={16} color="#52525B" />
                  </IconButton>
                </Flex>
              </Dialog.Header>
              <Dialog.Body>
                <Text fontSize="sm" color="#52525B">
                  Unenrolling from this opportunity removes your access to
                  opportunities under this demo
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <HStack gap={3} w="full">
                  <ButtonV2
                    variant="ghost"
                    borderRadius="xl"
                    border="1px solid #E5E7EB"
                    h="40px"
                    color="#27272A"
                    fontSize="sm"
                    fontWeight="500"
                    px={4}
                    _hover={{ bg: "#F9FAFB", textDecoration: "none" }}
                    onClick={() => setIsCancelDialogOpen(false)}
                    flex={1}
                  >
                    Go Back
                  </ButtonV2>
                  <ButtonV2
                    bg="#DC2626"
                    borderRadius="xl"
                    h="40px"
                    fontSize="sm"
                    fontWeight="500"
                    px={4}
                    color="white"
                    onClick={confirmCancelEnrollment}
                    loading={updateParticipantMutation.isPending}
                    flex={1}
                  >
                    Yes, Unenroll
                  </ButtonV2>
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root
        open={isCancelSubscriptionDialogOpen}
        onOpenChange={(details) =>
          setIsCancelSubscriptionDialogOpen(details.open)
        }
        placement="top"
        trapFocus={true}
      >
        <Portal>
          <Dialog.Positioner
            zIndex={9999}
            style={{ backdropFilter: "blur(4px)" }}
          >
            <Dialog.Content maxW="500px" zIndex={10000}>
              <Dialog.Header>
                <Dialog.Title fontSize="lg" fontWeight="bold">
                  Cancel Subscription
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text fontSize="md">
                  Your access to the opportunity will continue until{" "}
                  <Text as="span" fontWeight="bold">
                    {(() => {
                      const accessInfo = getAccessInfo();
                      if (accessInfo?.subscription?.current_period_end) {
                        return new Date(
                          accessInfo.subscription.current_period_end
                        ).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        });
                      }
                      return "the end of your billing period";
                    })()}
                  </Text>
                  .
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <HStack gap={3} w="full">
                  <Button
                    bg="red.500"
                    color="white"
                    _hover={{ bg: "red.600" }}
                    onClick={confirmCancelSubscription}
                    loading={cancelSubscriptionMutation.isPending}
                    flex={1}
                  >
                    Confirm Cancellation
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="gray"
                    onClick={() => setIsCancelSubscriptionDialogOpen(false)}
                    flex={1}
                  >
                    Go Back
                  </Button>
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

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
                {questionnaireSections.length > 0 ? (
                  <QuestionnaireForm
                    ref={editFormRef}
                    sections={questionnaireSections}
                    initialValues={editAnswers}
                    onAnswersChange={handleAnswersChange}
                    props={{
                      p: 0,
                      border: "none",
                    }}
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
    </>
  );
};

interface MyOpportunitiesProps {
  userType: string;
}

const MyOpportunities: React.FC<MyOpportunitiesProps> = ({ userType }) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const {
    data: opportunities,
    isLoading,
    error,
  } = useAccessibleOpportunities();

  const categorizedOpportunities = useMemo(() => {
    if (!opportunities) return { enrolled: [], closed: [] };
    return categorizeOpportunities(opportunities);
  }, [opportunities]);

  return (
    <Box w="100%" overflow="hidden">
      {/* Loading state with skeletons */}
      {isLoading && (
        <VStack gap={4} align="stretch">
          <OpportunityCardSkeleton />
          <OpportunityCardSkeleton />
          <OpportunityCardSkeleton />
        </VStack>
      )}

      {/* Error state */}
      {error && (
        <Box p={8} borderRadius="12px" bg="#F8F9FA" border="1px solid #E2E8F0">
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>
              Failed to load opportunities. Please try again later.
            </Alert.Title>
          </Alert.Root>
        </Box>
      )}

      {!isLoading && !error && (
        <VStack gap={4} align="stretch">
          {categorizedOpportunities.enrolled.length === 0 &&
          categorizedOpportunities.closed.length === 0 ? (
            <Box
              p={8}
              borderRadius="12px"
              bg="#F8F9FA"
              border="1px solid #E2E8F0"
              textAlign="center"
            >
              <VStack gap={4}>
                <i
                  className="fa-solid fa-folder-closed"
                  style={{ fontSize: "48px", color: "#9CA3AF" }}
                />
                <Text fontSize="18px" fontWeight="600" color="#374151">
                  No Opportunities Yet
                </Text>
                <Text fontSize="14px" color="#6B7280" maxW="400px">
                  You&apos;re not enrolled in any opportunities yet.
                </Text>
              </VStack>
            </Box>
          ) : (
            <>
              {categorizedOpportunities.enrolled.map(
                (opportunity: Opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    userType={userType}
                    type="enrolled"
                  />
                )
              )}
              {categorizedOpportunities.closed.map(
                (opportunity: Opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    userType={userType}
                    type="closed"
                  />
                )
              )}
            </>
          )}
        </VStack>
      )}
    </Box>
  );
};

export default MyOpportunities;
