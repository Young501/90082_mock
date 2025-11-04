"use client";
import React, { useState, useMemo, useEffect } from "react";
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
} from "@chakra-ui/react";
import {
  useAccessibleOpportunities,
  categorizeOpportunities,
  useOpportunityParticipant,
} from "@/services/shared";
import {
  useUpdateOpportunityParticipant,
  useEnrollInOpportunity,
  useCancelOpportunityEnrollment,
} from "@/services/updateParticipant";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store";
import { Opportunity, ParticipantRecord } from "@/types/opportunities";
import { FieldRenderer } from "@/app/(auth)/onboarding/FieldRenderer";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createPageSchema } from "@/utils/validationSchemas";
import { Question } from "@/types/onboarding";
import { toast } from "react-toastify";
import { formatAnswerForDisplay } from "@/utils/formatAnswer";
import OpportunityCardSkeleton from "./ui/OpportunityCardSkeleton";
import SubscriptionStatusComponent from "./SubscriptionStatus";

// Simple Opportunity Card Component
interface OpportunityCardProps {
  opportunity: Opportunity;
  userType: string;
  type: "enrolled" | "closed";
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  userType,
  type,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalAnswers, setOriginalAnswers] = useState<Record<string, any>>(
    {}
  );
  const [isCancelled, setIsCancelled] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Fetch participant record when expanded (only for enrolled opportunities and not cancelled)
  const {
    data: participantRecord,
    isLoading: isParticipantLoading,
    error: participantError,
  } = useOpportunityParticipant(
    opportunity.id,
    type === "enrolled" && !isCancelled
  );

  // Get subscription status from participant record access field
  const accessInfo = useMemo(() => {
    if (!participantRecord?.access) return null;
    return participantRecord.access;
  }, [participantRecord?.access]);

  const isSubscriptionLoading = false; // No loading since we get data from participant record
  const subscriptionError = null; // No error since we get data from participant record

  // Update mutation
  const updateParticipantMutation = useUpdateOpportunityParticipant();

  // Re-enroll mutation
  const reEnrollMutation = useEnrollInOpportunity();

  // Parse questionnaire from opportunity
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

  // Form setup for editing
  const schema = useMemo(
    () => createPageSchema(questionnaire, true),
    [questionnaire]
  );
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  // Reset form when participant record loads
  useEffect(() => {
    if (participantRecord?.data?.questionnaire_answers) {
      const answers = participantRecord.data.questionnaire_answers;
      reset(answers);
      setOriginalAnswers(answers);
    }
  }, [participantRecord, reset]);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setIsEditMode(false);
    }
  };

  const handleEdit = () => {
    const participantAnswers = participantRecord?.data?.questionnaire_answers;
    if (!isEditMode && participantAnswers) {
      // When entering edit mode, reset form to current participant answers
      // This ensures we start with the latest data, not stale originalAnswers
      reset(participantAnswers);
      setOriginalAnswers(participantAnswers);
    } else {
      // When canceling edit mode, reset form back to original answers
      reset(originalAnswers);
    }
    setIsEditMode(!isEditMode);
  };

  const handleReEnroll = async (data?: any) => {
    try {
      // Re-enrollment no longer requires questionnaire answers
      await reEnrollMutation.mutateAsync({
        opportunityId: opportunity.id,
        // No questionnaire answers needed for re-enrollment
      });

      toast.success("Successfully re-enrolled in opportunity!");

      // Close expanded view after successful re-enrollment
      setIsExpanded(false);
      setIsEditMode(false);

      // Invalidate caches to trigger UI updates
      queryClient.invalidateQueries({
        queryKey: ["accessible-opportunities", user?.id],
      });

      // Invalidate all opportunities to update enrollment status
      queryClient.invalidateQueries({
        queryKey: ["all-opportunities", user?.id],
      });
    } catch (error: any) {
      console.error("Re-enroll failed:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to re-enroll in opportunity";
      toast.error(errorMessage);
    }
  };

  // Check if user has active subscription
  // const hasActiveSubscription = () => {
  //   if (!accessInfo) return false;
  //   const status = subscriptionData.status;
  //   const cancelAtPeriodEnd = subscriptionData.cancel_at_period_end;

  //   // If subscription is set to cancel at period end, it's not considered active for enrollment purposes
  //   if (cancelAtPeriodEnd) return false;

  //   return status === "active" || status === "trialing";
  // };

  const handleCancelEnrollment = () => {
    // Check if user has active subscription
    // if (hasActiveSubscription()) {
    //   toast.error(
    //     "You have an active subscription. Please cancel your subscription first."
    //   );
    //   return;
    // }

    // Open confirmation dialog
    setIsCancelDialogOpen(true);
  };

  const confirmCancelEnrollment = async () => {
    try {
      await updateParticipantMutation.mutateAsync({
        opportunityId: opportunity.id,
        accepted: false,
      });

      toast.success("Successfully cancelled enrollment!");

      // Mark as cancelled to stop fetching participant record
      setIsCancelled(true);

      setIsExpanded(false);
      setIsEditMode(false);

      setIsCancelDialogOpen(false);

      queryClient.invalidateQueries({
        queryKey: ["accessible-opportunities", user?.id],
      });

      // Remove participant record cache for this opportunity
      queryClient.removeQueries({
        queryKey: ["opportunity-participant", opportunity.id, user?.id],
      });
    } catch (error: any) {
      console.error("Cancel enrollment failed:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to cancel enrollment";
      toast.error(errorMessage);
    }
  };

  const handleSave = async (data: any) => {
    if (!participantRecord?.participant_id) {
      toast.error("No participant record found");
      return;
    }

    try {
      // Check if there are any changes
      let hasChanges = false;
      Object.keys(data).forEach((key) => {
        const originalValue = originalAnswers[key];
        const newValue = data[key];
        if (JSON.stringify(originalValue) !== JSON.stringify(newValue)) {
          hasChanges = true;
        }
      });

      if (!hasChanges) {
        toast.info("No changes to save");
        setIsEditMode(false);
        return;
      }

      const updatedParticipant = await updateParticipantMutation.mutateAsync({
        opportunityId: opportunity.id,
        questionnaireAnswers: data,
      });

      queryClient.setQueryData(
        ["opportunity-participant", opportunity.id],
        updatedParticipant
      );

      setOriginalAnswers(
        updatedParticipant?.data?.questionnaire_answers || data
      );

      toast.success("All changes have been saved!");
      setIsEditMode(false);
    } catch (error: any) {
      console.error("Save failed:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        "Failed to save changes";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Box
        borderRadius="12px"
        bg="white"
        border="1px solid #E2E8F0"
        boxShadow="0 1px 3px rgba(0,0,0,0.1)"
        overflow="hidden"
        w="100%"
        maxW="100%"
      >
        {/* Main card content */}
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
              <Text
                fontSize="18px"
                fontWeight="600"
                color="#1F2937"
                mb={2}
                wordBreak="break-word"
              >
                {opportunity.title}
              </Text>
              <Text
                fontSize="14px"
                color="#6B7280"
                mb={3}
                wordBreak="break-word"
              >
                {opportunity.description}
              </Text>
              <HStack gap={4} fontSize="12px" color="#9CA3AF" flexWrap="wrap">
                <Text>
                  Start: {new Date(opportunity.start_date).toLocaleDateString()}
                </Text>
                <Text>
                  End: {new Date(opportunity.end_date).toLocaleDateString()}
                </Text>
              </HStack>
            </Box>
            <Box flexShrink={0}>
              <Button
                size="sm"
                variant="outline"
                colorScheme={userType === "student" ? "red" : "green"}
                onClick={handleExpand}
                minW="fit-content"
              >
                {isExpanded ? "Collapse" : "View Details"}
              </Button>
            </Box>
          </Flex>
        </Box>

        {/* Expanded content */}
        {isExpanded && (
          <Box borderTop="1px solid #E2E8F0" bg="#F8F9FA" p={4}>
            {type === "closed" ? (
              // For cancelled opportunities, show re-enroll option directly
              <VStack gap={4} align="stretch">
                <Alert.Root status="info" mb={4}>
                  <Alert.Indicator />
                  <Alert.Title>
                    You are not currently enrolled in this opportunity
                  </Alert.Title>
                </Alert.Root>

                {/* Re-enroll button - no questionnaire required */}
                <Box>
                  <Button
                    size="md"
                    colorScheme={userType === "student" ? "red" : "green"}
                    onClick={handleReEnroll}
                    loading={reEnrollMutation.isPending}
                    w="full"
                  >
                    Re-enroll in Opportunity
                  </Button>
                </Box>
              </VStack>
            ) : isParticipantLoading ? (
              <VStack gap={4}>
                <Spinner
                  size="md"
                  color={userType === "student" ? "#DC2626" : "#089C3F"}
                />
                <Text fontSize="14px" color="#6B7280">
                  Loading participant details...
                </Text>
              </VStack>
            ) : participantError ? (
              <VStack gap={4} align="stretch">
                {/* Show error message for enrolled opportunities */}
                {type === "enrolled" && (
                  <Alert.Root status="warning">
                    <Alert.Indicator />
                    <Alert.Title>
                      Unable to load participant details
                    </Alert.Title>
                  </Alert.Root>
                )}
              </VStack>
            ) : (
              <VStack gap={4} align="stretch">
                {/* Participant info */}
                {participantRecord && (
                  <Box>
                    <HStack justify="space-between" mb={3}>
                      <Text fontSize="16px" fontWeight="600" color="#1F2937">
                        Participant Information
                      </Text>
                      {type === "enrolled" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme={userType === "student" ? "red" : "green"}
                          onClick={handleEdit}
                        >
                          {isEditMode ? "Cancel" : "Edit"}
                        </Button>
                      )}
                    </HStack>

                    <HStack gap={4} fontSize="14px" color="#6B7280" mb={4}>
                      <Text>
                        Status:{" "}
                        <Text as="span" fontWeight="600" color="#1F2937">
                          {participantRecord.accepted ? "Accepted" : "Pending"}
                        </Text>
                      </Text>
                      <Text>
                        Type:{" "}
                        <Text as="span" fontWeight="600" color="#1F2937">
                          {participantRecord.type || "Unknown"}
                        </Text>
                      </Text>
                      <Text>
                        Email:{" "}
                        <Text as="span" fontWeight="600" color="#1F2937">
                          {participantRecord.email || "Unknown"}
                        </Text>
                      </Text>
                    </HStack>
                  </Box>
                )}

                {/* Subscription Status */}
                {participantRecord?.participant_id && (
                  <Box mb={5}>
                    <Text
                      fontSize="16px"
                      fontWeight="600"
                      color="#1F2937"
                      mb={1}
                    >
                      Subscription Status
                    </Text>
                    {isSubscriptionLoading ? (
                      <HStack gap={2}>
                        <Spinner size="sm" />
                        <Text fontSize="14px" color="#6B7280">
                          Loading subscription status...
                        </Text>
                      </HStack>
                    ) : subscriptionError ? (
                      <Text fontSize="14px" color="#6B7280">
                        No subscription found
                      </Text>
                    ) : accessInfo ? (
                      <SubscriptionStatusComponent
                        accessInfo={accessInfo}
                        opportunityId={opportunity.id}
                        onStatusUpdate={() => {
                          // Refresh accessible opportunities and participant records
                          queryClient.invalidateQueries({
                            queryKey: ["accessible-opportunities", user?.id],
                          });
                          queryClient.invalidateQueries({
                            queryKey: ["opportunity-participant"],
                          });
                        }}
                      />
                    ) : (
                      <Text fontSize="14px" color="#6B7280">
                        No active subscription
                      </Text>
                    )}
                  </Box>
                )}

                {/* Questionnaire - only show if questionnaire exists and user is not organization */}
                {hasQuestionnaire && userType !== "organisation" && (
                  <Box>
                    <Text
                      fontSize="16px"
                      fontWeight="600"
                      color="#1F2937"
                      mb={3}
                    >
                      Questionnaire Answers
                    </Text>

                    {isEditMode ? (
                      <form onSubmit={handleSubmit(handleSave)}>
                        <VStack gap={4} align="stretch">
                          {questionnaire.map((question: Question) => (
                            <FieldRenderer
                              key={question.field}
                              question={question}
                              register={register}
                              control={control}
                              errors={errors}
                            />
                          ))}
                          <HStack gap={2} justify="flex-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setIsEditMode(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              type="submit"
                              colorScheme={
                                userType === "student" ? "red" : "green"
                              }
                              loading={updateParticipantMutation.isPending}
                            >
                              Save Changes
                            </Button>
                          </HStack>
                        </VStack>
                      </form>
                    ) : (
                      <VStack gap={3} align="stretch">
                        {questionnaire.map((question: Question) => {
                          const answer =
                            participantRecord?.data?.questionnaire_answers?.[
                              question.field
                            ];
                          return (
                            <Box
                              key={question.field}
                              p={3}
                              bg="white"
                              borderRadius="8px"
                              border="1px solid #E2E8F0"
                            >
                              <Text
                                fontSize="14px"
                                fontWeight="600"
                                color="#374151"
                                mb={1}
                              >
                                {question.label}
                              </Text>
                              <Text fontSize="14px" color="#6B7280">
                                {formatAnswerForDisplay(question, answer)}
                              </Text>
                            </Box>
                          );
                        })}
                      </VStack>
                    )}
                  </Box>
                )}

                {/* Cancel enrollment button for enrolled opportunities */}
                {type === "enrolled" && (
                  <Box>
                    <Button
                      size="md"
                      variant="outline"
                      colorScheme="red"
                      onClick={handleCancelEnrollment}
                      loading={updateParticipantMutation.isPending}
                      w="full"
                      // disabled={hasActiveSubscription()}
                      // title={
                      //   hasActiveSubscription()
                      //     ? "You have an active subscription. Please cancel your subscription first."
                      //     : ""
                      // }
                    >
                      Cancel Enrollment
                    </Button>
                    {/* {hasActiveSubscription() && (
                      <Text
                        fontSize="12px"
                        color="orange.500"
                        mt={1}
                        textAlign="center"
                      >
                        You have an active subscription. Please cancel your
                        subscription first.
                      </Text>
                    )} */}
                  </Box>
                )}
              </VStack>
            )}
          </Box>
        )}
      </Box>

      {/* Cancel Enrollment Confirmation Dialog */}
      <Dialog.Root
        open={isCancelDialogOpen}
        onOpenChange={(details) => setIsCancelDialogOpen(details.open)}
        placement="top"
        trapFocus={true}
      >
        <Portal>
          <Dialog.Positioner
            zIndex={9999}
            style={{ backdropFilter: "blur(4px)" }}
          >
            <Dialog.Content maxW="400px" zIndex={10000}>
              <Dialog.Header>
                <Dialog.Title fontSize="lg" fontWeight="bold">
                  Cancel Enrolment
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text fontSize="md">
                  Do you really want to cancel your enrolment?
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <HStack gap={3} w="full">
                  <Button
                    bg="red.500"
                    color="white"
                    _hover={{ bg: "red.600" }}
                    onClick={confirmCancelEnrollment}
                    loading={updateParticipantMutation.isPending}
                    flex={1}
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="gray"
                    onClick={() => setIsCancelDialogOpen(false)}
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
    </>
  );
};

interface MyOpportunitiesProps {
  userType: string;
}

const MyOpportunities: React.FC<MyOpportunitiesProps> = ({ userType }) => {
  const [activeSubTab, setActiveSubTab] = useState<number>(0);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Fetch all opportunities
  const {
    data: opportunities,
    isLoading,
    error,
  } = useAccessibleOpportunities();

  // Categorize opportunities
  const categorizedOpportunities = useMemo(() => {
    if (!opportunities) return { enrolled: [], closed: [] };
    return categorizeOpportunities(opportunities);
  }, [opportunities]);

  const opportunityTabs = [
    {
      title: "Enrolled Opportunities",
      icon: "fa-solid fa-circle-check",
      count: categorizedOpportunities.enrolled.length,
    },
    {
      title: "Cancelled Opportunities",
      icon: "fa-solid fa-times-circle",
      count: categorizedOpportunities.closed.length,
    },
  ];

  return (
    <Box w="100%" overflow="hidden">
      {/* Sub-tab navigation */}
      <Flex
        gap={0}
        mb={6}
        borderBottom="2px solid #E2E8F0"
        w="100%"
        overflow="auto"
      >
        {opportunityTabs.map((tab, index) => (
          <Button
            key={index}
            variant="ghost"
            onClick={() => setActiveSubTab(index)}
            borderRadius="0"
            borderBottom={
              activeSubTab === index
                ? `3px solid ${index === 0 ? "#089C3F" : "#DC2626"}`
                : "3px solid transparent"
            }
            color={index === 0 ? "#089C3F" : "#DC2626"}
            fontWeight="600"
            px={{ base: 4, md: 6 }}
            py={3}
            minW="fit-content"
            flexShrink={0}
          >
            <HStack gap={2}>
              <i
                className={tab.icon}
                style={{
                  fontSize: "16px",
                }}
              />
              <Text>{tab.title}</Text>
              {tab.count !== undefined && (
                <Box
                  bg={index === 0 ? "#089C3F" : "#DC2626"}
                  color="white"
                  borderRadius="50%"
                  width="20px"
                  height="20px"
                  fontSize="12px"
                  fontWeight="600"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {tab.count}
                </Box>
              )}
            </HStack>
          </Button>
        ))}
      </Flex>

      {/* Tab content */}
      <Box>
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
          <Box
            p={8}
            borderRadius="12px"
            bg="#F8F9FA"
            border="1px solid #E2E8F0"
          >
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Title>
                Failed to load opportunities. Please try again later.
              </Alert.Title>
            </Alert.Root>
          </Box>
        )}

        {/* Enrolled Opportunities */}
        {!isLoading && !error && activeSubTab === 0 && (
          <Box>
            {categorizedOpportunities.enrolled.length > 0 ? (
              <VStack gap={4} align="stretch">
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
              </VStack>
            ) : (
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
                    style={{
                      fontSize: "48px",
                      color: "#9CA3AF",
                    }}
                  />
                  <Text fontSize="18px" fontWeight="600" color="#374151">
                    Enrolled Opportunities
                  </Text>
                  <Text fontSize="14px" color="#6B7280" maxW="400px">
                    You&apos;re not enrolled in any opportunities yet.
                  </Text>
                </VStack>
              </Box>
            )}
          </Box>
        )}

        {/* Cancelled Opportunities */}
        {!isLoading && !error && activeSubTab === 1 && (
          <Box>
            {categorizedOpportunities.closed.length > 0 ? (
              <VStack gap={4} align="stretch">
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
              </VStack>
            ) : (
              <Box
                p={8}
                borderRadius="12px"
                bg="#F8F9FA"
                border="1px solid #E2E8F0"
                textAlign="center"
              >
                <VStack gap={4}>
                  <i
                    className="fa-solid fa-archive"
                    style={{
                      fontSize: "48px",
                      color: "#9CA3AF",
                    }}
                  />
                  <Text fontSize="18px" fontWeight="600" color="#374151">
                    Cancelled Opportunities
                  </Text>
                  <Text fontSize="14px" color="#6B7280" maxW="400px">
                    No cancelled opportunities.
                  </Text>
                </VStack>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MyOpportunities;
