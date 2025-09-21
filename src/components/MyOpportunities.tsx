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
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import { useAllOpportunities, categorizeOpportunities, useOpportunityParticipant } from "@/services/shared";
import { useUpdateOpportunityParticipant, useReEnrollOpportunity, useCancelOpportunityEnrollment } from "@/services/updateParticipant";
import { Opportunity, ParticipantRecord } from "@/types/opportunities";
import { FieldRenderer } from "@/app/(auth)/onboarding/FieldRenderer";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createPageSchema } from "@/utils/validationSchemas";
import { Question } from "@/types/onboarding";
import { toast } from "react-toastify";

// Skeleton component for opportunity cards
const OpportunityCardSkeleton: React.FC = () => (
  <Box
    borderRadius="12px"
    bg="white"
    border="1px solid #E2E8F0"
    boxShadow="0 1px 3px rgba(0,0,0,0.1)"
    overflow="hidden"
  >
    <Box p={4}>
      <Flex justify="space-between" align="start">
        <Box flex={1}>
          <Skeleton height="20px" width="70%" mb={2} />
          <SkeletonText noOfLines={2} mb={3} />
          <HStack gap={4}>
            <Skeleton height="16px" width="120px" />
            <Skeleton height="16px" width="120px" />
          </HStack>
        </Box>
        <Box>
          <Skeleton height="32px" width="100px" />
        </Box>
      </Flex>
    </Box>
  </Box>
);

// Simple Opportunity Card Component
interface OpportunityCardProps {
  opportunity: Opportunity;
  userType: string;
  type: "enrolled" | "closed";
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, userType, type }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalAnswers, setOriginalAnswers] = useState<Record<string, any>>({});
  
  // Fetch participant record when expanded
  const { 
    data: participantRecord, 
    isLoading: isParticipantLoading, 
    error: participantError 
  } = useOpportunityParticipant(opportunity.id);
  
  // Update mutation
  const updateParticipantMutation = useUpdateOpportunityParticipant();
  
  // Re-enroll mutation
  const reEnrollMutation = useReEnrollOpportunity();
  
  // Cancel enrollment mutation
  const cancelEnrollmentMutation = useCancelOpportunityEnrollment();
  
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
  
  // Form setup for editing
  const schema = useMemo(() => createPageSchema(questionnaire, true), [questionnaire]);
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
    if (participantRecord?.questionnaire_answers) {
      reset(participantRecord.questionnaire_answers);
      setOriginalAnswers(participantRecord.questionnaire_answers);
    }
  }, [participantRecord, reset]);
  
  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setIsEditMode(false);
    }
  };
  
  const handleEdit = () => {
    setIsEditMode(!isEditMode);
  };
  
  const handleReEnroll = async (data?: any) => {
    try {
      // Get form values from parameter or current form state
      const questionnaireAnswers = data || getValues();
      
      await reEnrollMutation.mutateAsync({
        opportunityId: opportunity.id,
        questionnaireAnswers: Object.keys(questionnaireAnswers).length > 0 ? questionnaireAnswers : undefined
      });
      
      toast.success("Successfully re-enrolled in opportunity!");
      
      // Close expanded view after successful re-enrollment
      setIsExpanded(false);
      setIsEditMode(false);
      
    } catch (error: any) {
      console.error("Re-enroll failed:", error);
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.detail || 
                          error?.response?.data?.message ||
                          "Failed to re-enroll in opportunity";
      toast.error(errorMessage);
    }
  };
  
  const handleCancelEnrollment = async () => {
    try {
      await cancelEnrollmentMutation.mutateAsync({
        opportunityId: opportunity.id
      });
      
      toast.success("Successfully cancelled enrollment!");
      
      // Close expanded view after successful cancellation
      setIsExpanded(false);
      setIsEditMode(false);
      
    } catch (error: any) {
      console.error("Cancel enrollment failed:", error);
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.detail || 
                          error?.response?.data?.message ||
                          "Failed to cancel enrollment";
      toast.error(errorMessage);
    }
  };
  
  const handleSave = async (data: any) => {
    if (!participantRecord?.id) {
      toast.error("No participant record found");
      return;
    }
    
    try {
      // Find only changed fields
      const changedFields: Record<string, any> = {};
      Object.keys(data).forEach(key => {
        const originalValue = originalAnswers[key];
        const newValue = data[key];
        
        // Deep comparison for arrays and objects
        if (JSON.stringify(originalValue) !== JSON.stringify(newValue)) {
          changedFields[key] = newValue;
        }
      });
      
      if (Object.keys(changedFields).length === 0) {
        toast.info("No changes to save");
        setIsEditMode(false);
        return;
      }
      
      await updateParticipantMutation.mutateAsync({
        opportunityId: opportunity.id,
        participantId: participantRecord.id,
        questionnaireAnswers: changedFields
      });
      
      toast.success("Saved.");
      setIsEditMode(false);
      
    } catch (error: any) {
      console.error("Save failed:", error);
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.detail || 
                          "Failed to save changes";
      toast.error(errorMessage);
    }
  };
  
  return (
    <Box
      borderRadius="12px"
      bg="white"
      border="1px solid #E2E8F0"
      boxShadow="0 1px 3px rgba(0,0,0,0.1)"
      overflow="hidden"
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
        <Flex justify="space-between" align="start">
          <Box flex={1}>
            <Text fontSize="18px" fontWeight="600" color="#1F2937" mb={2}>
              {opportunity.title}
            </Text>
            <Text fontSize="14px" color="#6B7280" mb={3}>
              {opportunity.description}
            </Text>
            <HStack gap={4} fontSize="12px" color="#9CA3AF">
              <Text>Start: {new Date(opportunity.start_date).toLocaleDateString()}</Text>
              <Text>End: {new Date(opportunity.end_date).toLocaleDateString()}</Text>
            </HStack>
          </Box>
          <Box>
            <Button
              size="sm"
              variant="outline"
              colorScheme={userType === "student" ? "red" : "green"}
              onClick={handleExpand}
            >
              {isExpanded ? "Collapse" : (type === "enrolled" ? "View Details" : "View Details")}
            </Button>
          </Box>
        </Flex>
      </Box>
      
      {/* Expanded content */}
      {isExpanded && (
        <Box
          borderTop="1px solid #E2E8F0"
          bg="#F8F9FA"
          p={4}
        >
          {isParticipantLoading ? (
            <VStack gap={4}>
              <Spinner size="md" color={userType === "student" ? "#DC2626" : "#089C3F"} />
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
              
              {/* For closed opportunities, show re-enroll option even without participant record */}
              {type === "closed" && (
                <Box>
                  <Alert.Root status="info" mb={4}>
                    <Alert.Indicator />
                    <Alert.Title>
                      You are not currently enrolled in this opportunity
                    </Alert.Title>
                  </Alert.Root>
                  
                  {/* Show questionnaire for re-enrollment if available */}
                  {questionnaire.length > 0 && (
                    <Box mb={4}>
                      <Text fontSize="16px" fontWeight="600" color="#1F2937" mb={3}>
                        Complete Questionnaire to Re-enroll
                      </Text>
                      
                      {isEditMode ? (
                        <form onSubmit={handleSubmit(handleReEnroll)}>
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
                                colorScheme={userType === "student" ? "red" : "green"}
                                loading={reEnrollMutation.isPending}
                              >
                                Re-enroll with Answers
                              </Button>
                            </HStack>
                          </VStack>
                        </form>
                      ) : (
                        <VStack gap={3} align="stretch">
                          {questionnaire.map((question: Question) => (
                            <Box key={question.field} p={3} bg="white" borderRadius="8px" border="1px solid #E2E8F0">
                              <Text fontSize="14px" fontWeight="600" color="#374151" mb={1}>
                                {question.label}
                              </Text>
                              <Text fontSize="14px" color="#6B7280">
                                No answer provided
                              </Text>
                            </Box>
                          ))}
                        </VStack>
                      )}
                    </Box>
                  )}
                  
                  {/* Re-enroll button */}
                  <Box>
                    <Button
                      size="md"
                      colorScheme={userType === "student" ? "red" : "green"}
                      onClick={questionnaire.length > 0 ? () => setIsEditMode(true) : handleReEnroll}
                      loading={reEnrollMutation.isPending}
                      w="full"
                    >
                      {questionnaire.length > 0 ? "Complete Questionnaire & Re-enroll" : "Re-enroll in Opportunity"}
                    </Button>
                  </Box>
                </Box>
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
                    <Text>Status: <Text as="span" fontWeight="600" color="#1F2937">
                      {participantRecord.status_display || participantRecord.status || "Active"}
                    </Text></Text>
                    <Text>Enrolled: <Text as="span" fontWeight="600" color="#1F2937">
                      {participantRecord.invited_time 
                        ? new Date(participantRecord.invited_time).toLocaleDateString()
                        : participantRecord.enrolled_at 
                          ? new Date(participantRecord.enrolled_at).toLocaleDateString()
                          : "Unknown"
                      }
                    </Text></Text>
                  </HStack>
                </Box>
              )}
              
              {/* Questionnaire */}
              {questionnaire.length > 0 && (
                <Box>
                  <Text fontSize="16px" fontWeight="600" color="#1F2937" mb={3}>
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
                            colorScheme={userType === "student" ? "red" : "green"}
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
                        const answer = participantRecord?.questionnaire_answers?.[question.field];
                        return (
                          <Box key={question.field} p={3} bg="white" borderRadius="8px" border="1px solid #E2E8F0">
                            <Text fontSize="14px" fontWeight="600" color="#374151" mb={1}>
                              {question.label}
                            </Text>
                            <Text fontSize="14px" color="#6B7280">
                              {answer !== undefined && answer !== null 
                                ? (Array.isArray(answer) ? answer.join(", ") : String(answer))
                                : "No answer provided"
                              }
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
                    loading={cancelEnrollmentMutation.isPending}
                    w="full"
                  >
                    Cancel Enrollment
                  </Button>
                </Box>
              )}
            </VStack>
          )}
        </Box>
      )}
    </Box>
  );
};

interface MyOpportunitiesProps {
  userType: string;
}

const MyOpportunities: React.FC<MyOpportunitiesProps> = ({ userType }) => {
  const [activeSubTab, setActiveSubTab] = useState<number>(0);
  
  // Fetch all opportunities
  const { 
    data: opportunities, 
    isLoading, 
    error 
  } = useAllOpportunities();
  
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
    <Box w="100%">
      {/* Sub-tab navigation */}
      <Flex
        gap={0}
        mb={6}
        borderBottom="2px solid #E2E8F0"
        w="fit-content"
      >
        {opportunityTabs.map((tab, index) => (
          <Button
            key={index}
            variant="ghost"
            onClick={() => setActiveSubTab(index)}
            borderRadius="0"
            borderBottom={
              activeSubTab === index
                ? `3px solid ${userType === "student" ? "#DC2626" : "#089C3F"}`
                : "3px solid transparent"
            }
            color={
              activeSubTab === index
                ? userType === "student" ? "#DC2626" : "#089C3F"
                : "#666666"
            }
            fontWeight="600"
            px={6}
            py={3}
            _hover={{
              color: userType === "student" ? "#DC2626" : "#089C3F",
            }}
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
                           bg={userType === "student" ? "#DC2626" : "#089C3F"}
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
                {categorizedOpportunities.enrolled.map((opportunity: Opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    userType={userType}
                    type="enrolled"
                  />
                ))}
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
                             You're not enrolled in any opportunities yet.
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
                {categorizedOpportunities.closed.map((opportunity: Opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    userType={userType}
                    type="closed"
                  />
                ))}
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
