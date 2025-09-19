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
} from "@chakra-ui/react";
import { useAllOpportunities, categorizeOpportunities, useOpportunityParticipant } from "@/services/shared";
import { Opportunity, ParticipantRecord } from "@/types/opportunities";
import { FieldRenderer } from "@/app/(auth)/onboarding/FieldRenderer";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createPageSchema } from "@/utils/validationSchemas";
import { Question } from "@/types/onboarding";

// Simple Opportunity Card Component
interface OpportunityCardProps {
  opportunity: Opportunity;
  userType: string;
  type: "enrolled" | "closed";
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, userType, type }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fetch participant record when expanded
  const { 
    data: participantRecord, 
    isLoading: isParticipantLoading, 
    error: participantError 
  } = useOpportunityParticipant(opportunity.id);
  
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
  
  const handleSave = async (data: any) => {
    // TODO: Implement save functionality
    console.log("Save questionnaire answers:", data);
    setIsEditMode(false);
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
              {isExpanded ? "Collapse" : (type === "enrolled" ? "View Details" : "Re-enroll")}
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
            <Alert.Root status="warning">
              <Alert.Indicator />
              <Alert.Title>
                {type === "enrolled" 
                  ? "Unable to load participant details" 
                  : "No participant record found"}
              </Alert.Title>
            </Alert.Root>
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
      title: "Closed Opportunities", 
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
                  borderRadius="full"
                  px={2}
                  py={1}
                  fontSize="12px"
                  fontWeight="600"
                  minW="20px"
                  textAlign="center"
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
        {/* Loading state */}
        {isLoading && (
          <Box
            p={8}
            borderRadius="12px"
            bg="#F8F9FA"
            border="1px solid #E2E8F0"
            textAlign="center"
          >
            <VStack gap={4}>
              <Spinner size="lg" color={userType === "student" ? "#DC2626" : "#089C3F"} />
              <Text fontSize="16px" color="#6B7280">
                Loading opportunities...
              </Text>
            </VStack>
          </Box>
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
                    You are currently enrolled in the following opportunities. 
                    Click on any opportunity to view details or cancel enrollment.
                  </Text>
                  <Text fontSize="12px" color="#9CA3AF" fontStyle="italic">
                    No enrolled opportunities found
                  </Text>
                </VStack>
              </Box>
            )}
          </Box>
        )}

        {/* Closed Opportunities */}
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
                    Closed Opportunities
                  </Text>
                  <Text fontSize="14px" color="#6B7280" maxW="400px">
                    These are opportunities you were previously enrolled in but are no longer active. 
                    You can re-enroll in some of these opportunities.
                  </Text>
                  <Text fontSize="12px" color="#9CA3AF" fontStyle="italic">
                    No closed opportunities found
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
