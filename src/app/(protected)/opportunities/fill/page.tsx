"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Spinner,
  Alert,
  Container,
  Progress,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useOpportunityDetail } from "@/services/shared";
import { useAuthStore } from "@/store";
import { PageTitle } from "@/components/PageTitle";
import Footer from "@/components/Layouts/Footer";
import { QuestionnaireForm, QuestionnaireFormRef } from "@/app/(public)/invite/QuestionnaireForm";
import { Button } from "@/components/ui";
import { ChevronLeftIcon } from "lucide-react";
import { useQuestionnaireAnswers } from "@/hooks/useQuestionnaireAnswers";

export default function OpportunityFillPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const opportunityId = sp.get("id");
  const { user } = useAuthStore();
  const formRef = useRef<QuestionnaireFormRef>(null);

  const [isValidating, setIsValidating] = useState(false);

  const {
    data: opportunity,
    isLoading,
    error,
  } = useOpportunityDetail(opportunityId || "");

  const { questionnaireAnswers, updateAnswers } = useQuestionnaireAnswers(opportunityId);

  const userType = user?.user_types?.[0];
  const questions = useMemo(
    () =>
      userType && opportunity?.questionnaire?.[userType]
        ? opportunity.questionnaire[userType]
        : [],
    [opportunity, userType]
  );

  useEffect(() => {
    if (!opportunityId) {
      router.push("/discover");
    }
  }, [opportunityId, router]);

  const handleAnswersChange = (answers: Record<string, any>) => {
    updateAnswers(answers);
  };

  const handleBack = () => {
    router.push(`/opportunities/start?id=${opportunityId}`);
  };

  const handleNext = async () => {
    if (!formRef.current) return;

    setIsValidating(true);
    try {
      const isValid = await formRef.current.validate();
      if (isValid) {
        router.push(`/opportunities/review?id=${opportunityId}`);
      }
    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setIsValidating(false);
    }
  };

  if (!opportunityId) {
    return null;
  }

  if (isLoading) {
    return (
      <Container maxW="4xl" py={8}>
        <VStack gap={8} align="center">
          <Spinner size="xl" color="blue.500" />
          <Text>Loading questionnaire...</Text>
        </VStack>
      </Container>
    );
  }

  if (error || !opportunity) {
    return (
      <Container maxW="4xl" py={8}>
        <Alert.Root status="error" borderRadius="lg">
          <Alert.Indicator />
          <Alert.Title>Failed to load opportunity details. Please try again.</Alert.Title>
        </Alert.Root>
      </Container>
    );
  }

  const hasQuestionnaire = questions.length > 0;

  if (!hasQuestionnaire) {
    // If no questionnaire, redirect to review to submit directly
    router.push(`/opportunities/review?id=${opportunityId}`);
    return null;
  }

  const answeredQuestions = Object.keys(questionnaireAnswers).filter(
    key => questionnaireAnswers[key] !== "" && 
           questionnaireAnswers[key] !== null && 
           questionnaireAnswers[key] !== undefined &&
           !(Array.isArray(questionnaireAnswers[key]) && questionnaireAnswers[key].length === 0)
  ).length;

  const progressPercent = questions.length > 0 ? (answeredQuestions / questions.length) * 100 : 0;

  return (
    <>
      <PageTitle title="Complete Questionnaire" />
      <Container maxW="4xl" py={8}>
        <VStack gap={8} align="stretch">
          {/* Header */}
          <Box>
            <HStack mb={4}>
              <IconButton
                aria-label="Go back"
                onClick={handleBack}
                variant="ghost"
                size="lg"
              >
                <ChevronLeftIcon size={20} />
              </IconButton>
              <Text fontSize="md" color="gray.600">
                Back
              </Text>
            </HStack>

            <Heading
              as="h1"
              size="xl"
              mb={2}
              color="gray.800"
              fontWeight="600"
            >
              {opportunity.title}
            </Heading>
            
            <Text fontSize="lg" color="gray.600" mb={6}>
              Complete the questionnaire to enroll in this opportunity
            </Text>

            {/* Progress */}
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" color="gray.600">
                  Progress
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {answeredQuestions} of {questions.length} questions
                </Text>
              </HStack>
              <Progress.Root
                value={progressPercent}
                colorPalette="blue"
                borderRadius="full"
                size="sm"
              >
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            </Box>
          </Box>

          {/* Questionnaire Form */}
          <QuestionnaireForm
            ref={formRef}
            questions={questions}
            onAnswersChange={handleAnswersChange}
          />

          {/* Actions */}
          <HStack justify="space-between" pt={4}>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleBack}
              minW="120px"
            >
              Back
            </Button>
            
            <Button
              colorScheme="blue"
              size="lg"
              onClick={handleNext}
              isLoading={isValidating}
              loadingText="Validating..."
              minW="120px"
            >
              Review
            </Button>
          </HStack>
        </VStack>
      </Container>
      <Footer />
    </>
  );
}