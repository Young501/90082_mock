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
import { useSearchParams, useRouter } from "next/navigation";
import { useOpportunityDetail, useOpportunityEnrollment } from "@/services/shared";
import { useAuthStore } from "@/store";
import { PageTitle } from "@/components/PageTitle";
import Footer from "@/components/Layouts/Footer";
import { Button } from "@/components/ui";
import { ChevronLeftIcon, EditIcon } from "lucide-react";
import { toast } from "react-toastify";
import { Question } from "@/types/onboarding";
import { useQuestionnaireAnswers } from "@/hooks/useQuestionnaireAnswers";

export default function OpportunityReviewPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const opportunityId = sp.get("id");
  const { user } = useAuthStore();

  const {
    data: opportunity,
    isLoading,
    error,
  } = useOpportunityDetail(opportunityId || "");

  const enrollmentMutation = useOpportunityEnrollment();
  const { questionnaireAnswers, clearAnswers } = useQuestionnaireAnswers(opportunityId);

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

  const handleBack = () => {
    if (questions.length > 0) {
      router.push(`/opportunities/fill?id=${opportunityId}`);
    } else {
      router.push(`/opportunities/start?id=${opportunityId}`);
    }
  };

  const handleEdit = () => {
    router.push(`/opportunities/fill?id=${opportunityId}`);
  };

  const handleSubmit = async () => {
    if (!opportunityId || !user?.email || !userType) return;

    try {
      await enrollmentMutation.mutateAsync({
        opportunityId,
        email: user.email,
        userType,
        questionnaireAnswers,
      });

      // Clear stored answers on success
      clearAnswers();

      // Show success and redirect
      toast.success("Successfully enrolled in opportunity!");
      router.push(`/opportunities/complete?id=${opportunityId}`);
    } catch (error: any) {
      console.error("Submission error:", error);
      
      if (error?.response?.status === 409) {
        toast.info("You're already enrolled in this opportunity!");
        router.push(`/discover?id=${opportunityId}`);
      } else if (error?.response?.status === 403) {
        toast.error("Private invite required. Please check your invitation.");
      } else if (error?.response?.status === 401) {
        toast.error("Please log in to continue.");
        router.push("/login");
      } else if (error?.response?.status === 400) {
        toast.error("Please check your form responses and try again.");
      } else {
        toast.error("Failed to submit. Please try again.");
      }
    }
  };

  const formatAnswer = (question: any, answer: any) => {
    if (answer === null || answer === undefined || answer === "") {
      return "Not answered";
    }

    if (Array.isArray(answer)) {
      if (answer.length === 0) return "Not answered";
      return answer.join(", ");
    }

    if (typeof answer === "boolean") {
      return answer ? "Yes" : "No";
    }

    return String(answer);
  };

  if (!opportunityId) {
    return null;
  }

  if (isLoading) {
    return (
      <Container maxW="4xl" py={8}>
        <VStack gap={8} align="center">
          <Spinner size="xl" color="blue.500" />
          <Text>Loading opportunity details...</Text>
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

  return (
    <>
      <PageTitle title="Review Application" />
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
              Review Your Application
            </Heading>
            
            <Text fontSize="lg" color="gray.600" mb={6}>
              {opportunity.title}
            </Text>
          </Box>

          {/* Summary */}
          {hasQuestionnaire ? (
            <Card.Root>
              <Card.Header>
                <Flex justify="space-between" align="center">
                  <Heading as="h2" size="lg" color="gray.800">
                    Your Responses
                  </Heading>
                  <IconButton
                    aria-label="Edit responses"
                    onClick={handleEdit}
                    variant="ghost"
                    size="sm"
                  >
                    <EditIcon size={16} />
                  </IconButton>
                </Flex>
              </Card.Header>
              <Card.Body>
                <VStack gap={6} align="stretch">
                  {questions.map((question: Question, index: number) => (
                    <Box key={question.field}>
                      <Text fontSize="sm" color="gray.600" mb={1}>
                        Question {index + 1}
                      </Text>
                      <Text fontSize="md" fontWeight="600" mb={2} color="gray.800">
                        {question.label}
                      </Text>
                      <Text fontSize="md" color="gray.700">
                        {formatAnswer(question, questionnaireAnswers[question.field])}
                      </Text>
                      {index < questions.length - 1 && (
                        <Box borderBottom="1px solid" borderColor="gray.100" mt={4} />
                      )}
                    </Box>
                  ))}
                </VStack>
              </Card.Body>
            </Card.Root>
          ) : (
            <Card.Root>
              <Card.Body>
                <VStack gap={4} textAlign="center">
                  <Heading as="h2" size="lg" color="gray.800">
                    Ready to Enroll
                  </Heading>
                  <Text fontSize="md" color="gray.600">
                    You&apos;re about to enroll in {opportunity.title}. 
                    Click submit to complete your enrollment.
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>
          )}

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
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              loading={enrollmentMutation.isPending}
              minW="120px"
            >
              {enrollmentMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </HStack>
        </VStack>
      </Container>
      <Footer />
    </>
  );
}