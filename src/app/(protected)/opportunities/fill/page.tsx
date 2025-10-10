"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Box, VStack, Heading, Text, Alert, HStack } from "@chakra-ui/react";
import ProgressTrack from "@/components/ProgressTrack";
import { useSearchParams, useRouter } from "next/navigation";
import { useOpportunityDetail } from "@/services/shared";
import { useAuthStore } from "@/store";
import {
  QuestionnaireForm,
  QuestionnaireFormRef,
} from "@/components/questionnaire/QuestionnaireForm";
import { Button } from "@/components/ui/Button";
import { Loader } from "lucide-react";
import { useQuestionnaireAnswers } from "@/hooks/useQuestionnaireAnswers";
import { Question } from "@/types/onboarding";

export default function OpportunityFillPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const opportunityId = sp.get("id");
  const editField = sp.get("edit");
  const { user } = useAuthStore();

  const [hasValidationError, setHasValidationError] = useState(false);
  const questionnaireRef = useRef<QuestionnaireFormRef>(null);

  const {
    questionnaireAnswers: answers,
    updateAnswers,
    clearAnswers,
  } = useQuestionnaireAnswers(opportunityId);

  const {
    data: opportunity,
    isLoading,
    error,
  } = useOpportunityDetail(opportunityId || "");

  const userType = user?.user_types?.[0] || "student";

  const questions: Question[] = useMemo(() => {
    if (!opportunity?.questionnaire) return [];
    return opportunity.questionnaire[userType] || [];
  }, [userType, opportunity?.questionnaire]);

  const handleAnswersChange = useCallback(
    (newAnswers: Record<string, any>) => {
      updateAnswers(newAnswers);
      if (hasValidationError) {
        setHasValidationError(false);
      }
    },
    [updateAnswers, hasValidationError]
  );

  // Handle scrolling to specific field when edit parameter is present
  useEffect(() => {
    if (editField && questions.length > 0) {
      // Small delay to ensure the form is rendered
      setTimeout(() => {
        const fieldElement = document.querySelector(`[name="${editField}"]`);
        if (fieldElement) {
          fieldElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          // Focus the field if it's focusable
          if (fieldElement instanceof HTMLElement && fieldElement.focus) {
            fieldElement.focus();
          }
        }
      }, 100);
    }
  }, [editField, questions]);

  const handleBack = () => {
    router.push(`/opportunities/start?id=${opportunityId}`);
  };

  const handleNext = async () => {
    if (questionnaireRef.current) {
      const isValid = await questionnaireRef.current.validate();
      if (isValid) {
        router.push(`/opportunities/review?id=${opportunityId}`);
      } else {
        setHasValidationError(true);
      }
    }
  };

  // Use stage-based progress tracking (Fill = Step 2 of 4)
  const currentStep = 2;
  const totalSteps = 4;

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
            The opportunity you&apos;re looking for doesn&apos;t exist or has
            been removed.
          </Alert.Description>
        </Alert.Root>
      </Box>
    );
  }

  return (
    <Box maxW="800px" mx="auto" p={6} pt={{ base: "90px", lg: "140px" }}>
      <VStack gap={6} align="stretch">
        {/* Progress Tracker */}
        <ProgressTrack progressPercent={50} totalSteps={4} />

        {/* Header */}
        <Box>
          <HStack gap={3} mb={4}>
            <Button variant="ghost" onClick={handleBack} size="sm" p={2}>
              ← Back
            </Button>
          </HStack>

          <Heading
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="700"
            color="gray.900"
            mb={2}
          >
            Opportunity Enrollment
          </Heading>
          <Text fontSize="md" color="gray.600" mb={4}>
            Fill out the questionnaire for:{" "}
            <Text as="span" fontWeight="600">
              {opportunity.title}
            </Text>
          </Text>
        </Box>

        <Text fontSize="sm" color="gray.600" mb={4}>
          Required fields are marked with{" "}
          <Text as="span" color="red.500">
            *
          </Text>
        </Text>

        {/* Validation Error */}
        {hasValidationError && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>Please complete all required fields</Alert.Title>
            <Alert.Description>
              Some required fields are missing or incomplete. Please review and
              fill in all required information.
            </Alert.Description>
          </Alert.Root>
        )}

        {/* Questionnaire Form */}
        {questions.length > 0 ? (
          <QuestionnaireForm
            ref={questionnaireRef}
            questions={questions}
            onAnswersChange={handleAnswersChange}
            initialValues={answers}
          />
        ) : (
          <Alert.Root status="info">
            <Alert.Indicator />
            <Alert.Title>No questionnaire available</Alert.Title>
            <Alert.Description>
              There are currently no questionnaire questions for this
              opportunity.
            </Alert.Description>
          </Alert.Root>
        )}

        {/* Navigation Buttons */}
        <HStack gap={4} justify="space-between" pt={6}>
          <Button
            variant="secondary"
            borderRadius="xl"
            h="50px"
            fontSize={"md"}
            w={{ base: "full", md: "150px" }}
            onClick={handleBack}
          >
            ← Back
          </Button>

          <Button
            onClick={handleNext}
            bg="blue.500"
            color="white"
            borderRadius="xl"
            h="50px"
            fontSize={"md"}
            w={{ base: "full", md: "200px" }}
            _hover={{ bg: "blue.600" }}
            disabled={questions.length === 0}
          >
            Review Answers →
          </Button>
        </HStack>

        {/* Auto-save indicator */}
        <Text fontSize="xs" color="gray.500" textAlign="center">
          Your answers are automatically saved as you type
        </Text>
      </VStack>
    </Box>
  );
}
