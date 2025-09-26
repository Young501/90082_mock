"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Spinner,
  Alert,
  Container,
  HStack,
  IconButton,
  Card,
  Flex,
} from "@chakra-ui/react";
import ProgressTrack from "@/components/ProgressTrack";
import { useSearchParams, useRouter } from "next/navigation";
import { useOpportunityDetail, useEnrollInOpportunity } from "@/services/shared";

import { useAuthStore } from "@/store";
import { PageTitle } from "@/components/PageTitle";
import Footer from "@/components/Layouts/Footer";
import { Button } from "@/components/ui/Button";
import { ChevronLeftIcon, EditIcon, Loader } from "lucide-react";
import { toast } from "react-toastify";
import { Question } from "@/types/onboarding";
import { useQuestionnaireAnswers } from "@/hooks/useQuestionnaireAnswers";
import { getErrorStatus, getEnrollmentErrorMessage } from "@/utils/apiErrorHandling";
import { parseQuestionnaireOptions } from "@/utils/questionnaireParser";

export default function OpportunityReviewPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const opportunityId = sp.get("id") || "";
  const { user } = useAuthStore();

  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    questionnaireAnswers: answers,
  } = useQuestionnaireAnswers(opportunityId);
  
  const enrollMutation = useEnrollInOpportunity();

  const {
    data: opportunity,
    isLoading,
    error,
  } = useOpportunityDetail(opportunityId);

  const userType = user?.user_types?.[0] || "student";

  const questions: Question[] = useMemo(() => {
    if (!opportunity?.questionnaire) return [];
    return opportunity.questionnaire[userType] || [];
  }, [userType, opportunity?.questionnaire]);

  const handleBack = () => {
    router.push(`/opportunities/fill?id=${opportunityId}`);
  };

  const handleEdit = (fieldName: string) => {
    // Navigate back to fill page and scroll to the specific field
    router.push(`/opportunities/fill?id=${opportunityId}&edit=${fieldName}`);
  };

  const handleSubmit = async () => {
    if (!user?.email) {
      setSubmitError("User email is required");
      return;
    }

    setSubmitError(null);

    try {
      await enrollMutation.mutateAsync({
        opportunityId,
        data: {
          email: user.email,
          user_type: userType,
          questionnaire_answers: answers,
        },
      });

      // Navigate to success page (complete page will handle clearing answers)
      router.push(`/opportunities/complete?id=${opportunityId}`);
    } catch (error: unknown) {
      console.error("Enrollment error:", error);
      
      // Handle authentication redirect
      const status = getErrorStatus(error);
      if (status === 401) {
        router.push("/login");
        return;
      }
      
      // Set appropriate error message
      setSubmitError(getEnrollmentErrorMessage(error));
    }
  };

  const formatAnswerValue = (value: any, question: Question): string => {
    if (Array.isArray(value)) {
      // For multi-select values, convert each slug to its label
      if (question.options || question.option) {
        const rawOptions = question.options || question.option || [];
        const processedOptions = parseQuestionnaireOptions(rawOptions).map(
          (opt) => ({
            label: opt.label || opt.value,
            value: opt.value,
          })
        );
        
        return value.map((val: string) => {
          const option = processedOptions.find(opt => opt.value === val);
          return option ? option.label : val;
        }).join(", ");
      } else {
        return value.join(", ");
      }
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    
    // For single-select values, convert slug to label
    if (question.options || question.option) {
      const rawOptions = question.options || question.option || [];
      const processedOptions = parseQuestionnaireOptions(rawOptions).map(
        (opt) => ({
          label: opt.label || opt.value,
          value: opt.value,
        })
      );
      
      const option = processedOptions.find(opt => opt.value === value);
      if (option) {
        return option.label;
      }
    }
    
    return String(value || "Not specified");
  };

  // Calculate progress based on answered required questions
  const progressPercentage = useMemo(() => {
    const requiredQuestions = questions.filter(q => q.required);
    if (requiredQuestions.length === 0) return 100;

    const answeredRequired = requiredQuestions.filter(q => {
      const answer = answers[q.field];
      if (Array.isArray(answer)) {
        return answer.length > 0;
      }
      return answer !== undefined && answer !== null && answer !== "";
    });

    return Math.round((answeredRequired.length / requiredQuestions.length) * 100);
  }, [questions, answers]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="60vh"
      >
        <Loader />
      </Box>
    );
  }

  if (error) {
    return (
      <Box maxW="800px" mx="auto" p={6}>
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>Error loading opportunity</Alert.Title>
          <Alert.Description>
            {error?.message || "Failed to load opportunity details"}
          </Alert.Description>
        </Alert.Root>
      </Box>
    );
  }

  if (!opportunity) {
    return (
      <Box maxW="800px" mx="auto" p={6}>
        <Alert.Root status="warning">
          <Alert.Indicator />
          <Alert.Title>Opportunity not found</Alert.Title>
          <Alert.Description>
            The opportunity you&apos;re looking for doesn&apos;t exist or has been removed.
          </Alert.Description>
        </Alert.Root>
      </Box>
    );
  }

  return (
    <Box maxW="800px" mx="auto" p={6} pt={{ base: "90px", lg: "140px" }}>
      <VStack gap={6} align="stretch">
        {/* Progress Tracker */}
        <ProgressTrack progressPercent={75} totalSteps={4} />
        
        {/* Header */}
        <Box>
          <HStack gap={3} mb={4}>
            <Button
              variant="ghost"
              onClick={handleBack}
              size="sm"
              p={2}
            >
              ← Back
            </Button>
          </HStack>

          <Heading
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="700"
            color="gray.900"
            mb={2}
          >
            Review Your Application
          </Heading>
          <Text
            fontSize="md"
            color="gray.600"
            mb={4}
          >
            Please review your answers for: <Text as="span" fontWeight="600">{opportunity.title}</Text>
          </Text>
        </Box>

        {/* Submit Error */}
        {submitError && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>Submission Error</Alert.Title>
            <Alert.Description>{submitError}</Alert.Description>
          </Alert.Root>
        )}

        {/* Answers Review */}
        <Box
          bg="white"
          borderRadius="16px"
          p={{ base: 6, md: 8 }}
          border="1px solid"
          borderColor="gray.200"
          shadow="sm"
        >
          <VStack gap={6} align="stretch">
            <Heading
              fontSize="lg"
              fontWeight="600"
              color="gray.900"
              mb={2}
            >
              Your Answers
            </Heading>

            {questions.map((question) => {
              const answer = answers[question.field];
              const hasAnswer = answer !== undefined && answer !== null && answer !== "";
              
              return (
                <Box
                  key={question.field}
                  p={4}
                  bg="gray.50"
                  borderRadius="12px"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <HStack justify="space-between" align="start" mb={3}>
                    <Box flex={1}>
                      <Text
                        fontSize="sm"
                        fontWeight="600"
                        color="gray.900"
                        mb={1}
                      >
                        {question.label}
                        {question.required && (
                          <Text as="span" color="red.500" ml={1}>
                            *
                          </Text>
                        )}
                      </Text>
                      <Text
                        fontSize="md"
                        color={hasAnswer ? "gray.700" : "gray.500"}
                        fontStyle={hasAnswer ? "normal" : "italic"}
                      >
                        {hasAnswer ? formatAnswerValue(answer, question) : "Not answered"}
                      </Text>
                    </Box>
                    <Button
                      variant="ghost"
                      onClick={() => handleEdit(question.field)}
                      size="sm"
                      p={2}
                      minW="auto"
                    >
                      Edit
                    </Button>
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        </Box>

        {/* Navigation Buttons */}
        <HStack gap={4} justify="space-between" pt={6}>
          <Button
            variant="secondary"
            onClick={handleBack}
          >
            ← Back to Edit
          </Button>

          <Button
            onClick={handleSubmit}
            bg="green.500"
            color="white"
            _hover={{ bg: "green.600" }}
            loading={enrollMutation.isPending}
            disabled={enrollMutation.isPending}
          >
            Submit Application
          </Button>
        </HStack>

        {/* Instructions */}
        <Text fontSize="xs" color="gray.500" textAlign="center">
          By submitting this application, you agree to share your information with the opportunity coordinator.
        </Text>
      </VStack>
    </Box>
  );
}