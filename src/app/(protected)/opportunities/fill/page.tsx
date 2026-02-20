"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Alert,
  HStack,
  Stack,
  Spinner,
} from "@chakra-ui/react";
import ProgressTrack from "@/components/ProgressTrack";
import { useSearchParams, useRouter } from "next/navigation";
import { useOpportunityDetail } from "@/services/shared";
import { useAuthStore } from "@/store";
import {
  QuestionnaireForm,
  QuestionnaireFormRef,
} from "@/components/questionnaire/QuestionnaireForm";
import { Loader } from "lucide-react";
import { useQuestionnaireAnswers } from "@/hooks/useQuestionnaireAnswers";
import { Question } from "@/types/onboarding";
import { findOpportunityByIdOrSlug } from "@/utils/findOpportunity";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import {
  QuestionnaireSection,
  getQuestionnaireSections,
} from "@/utils/opportunityQuestionnaire";

function OpportunityFillContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const opportunitySlug = sp.get("opp") || "";
  const { accessibleOpportunities } = useAuthStore();

  const currentOpportunity = findOpportunityByIdOrSlug(
    accessibleOpportunities,
    opportunitySlug
  );

  const opportunityId = currentOpportunity?.id;

  const editField = sp.get("edit");
  const { user } = useAuthStore();

  const [hasValidationError, setHasValidationError] = useState(false);
  const questionnaireRef = useRef<QuestionnaireFormRef>(null);

  const {
    questionnaireAnswers: answers,
    updateAnswers,
    clearAnswers,
  } = useQuestionnaireAnswers(opportunityId?.toString() || "");

  const {
    data: opportunity,
    isLoading,
    error,
  } = useOpportunityDetail(opportunityId?.toString() || "");

  const userType = user?.user_types?.[0] || "student";

  const sections: QuestionnaireSection[] = useMemo(
    () => getQuestionnaireSections(opportunity?.questionnaire, userType),
    [opportunity?.questionnaire, userType]
  );

  const allQuestions: Question[] = useMemo(() => {
    return sections.flatMap((section) => section.questions);
  }, [sections]);

  const handleAnswersChange = useCallback(
    (newAnswers: Record<string, any>) => {
      updateAnswers(newAnswers);
      if (hasValidationError) {
        setHasValidationError(false);
      }
    },
    [updateAnswers, hasValidationError]
  );

  useEffect(() => {
    if (editField && allQuestions.length > 0) {
      setTimeout(() => {
        const fieldElement = document.querySelector(`[name="${editField}"]`);
        if (fieldElement) {
          fieldElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          if (fieldElement instanceof HTMLElement && fieldElement.focus) {
            fieldElement.focus();
          }
        }
      }, 100);
    }
  }, [editField, allQuestions]);

  const handleBack = () => {
    router.push(`/discover?opp=${opportunitySlug}`);
  };

  const handleNext = async () => {
    if (questionnaireRef.current) {
      const isValid = await questionnaireRef.current.validate();
      if (isValid) {
        router.push(`/opportunities/review?opp=${opportunitySlug}`);
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
    <Box mx="auto">
      <VStack gap={6} align="stretch">
        <Box>
          <Heading fontSize="2xl" fontWeight="600" color="#18181B" mb={1}>
            Opportunity Enrollment Questions
          </Heading>
          <Text fontSize="lg" color="#52525B">
            Fill out the questionnaire for:{" "}
            <Text as="span">{opportunity.title}</Text>
          </Text>
        </Box>

        <Text fontSize="sm" color="gray.600">
          Required fields are marked with{" "}
          <Text as="span" color="red.500">
            *
          </Text>
        </Text>

        {/* Validation Error */}
        {hasValidationError && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Please complete all required fields</Alert.Title>
              <Alert.Description>
                Some required fields are missing or incomplete. Please review
                and fill in all required information.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}

        {sections.length > 0 ? (
          <QuestionnaireForm
            ref={questionnaireRef}
            sections={sections}
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

        <HStack
          justify="flex-end"
          align="flex-end"
          w="100%"
          pt={6}
          pb={4}
          alignSelf="flex-end"
          gap={4}
        >
          <ButtonV2
            variant="ghost"
            borderRadius="xl"
            border="1px solid #D6EDFB"
            color="#1679AB"
            h="48px"
            fontSize={"md"}
            px={5}
            py={4}
            w="fit-content"
            onClick={handleBack}
          >
            Back
          </ButtonV2>

          <ButtonV2
            onClick={handleNext}
            variant="primary"
            h="48px"
            maxW="246px"
            fontSize={"md"}
            w="100%"
            disabled={sections.length === 0}
          >
            Review Answers
          </ButtonV2>
        </HStack>
      </VStack>
    </Box>
  );
}

export default function OpportunityFillPage() {
  return (
    <Suspense
      fallback={
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minH="60vh"
        >
          <Spinner size="xl" />
        </Box>
      }
    >
      <OpportunityFillContent />
    </Suspense>
  );
}
