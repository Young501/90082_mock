"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Dialog,
  Portal,
} from "@chakra-ui/react";
import ProgressTrack from "@/components/ProgressTrack";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useOpportunityDetail,
  useAccessibleOpportunities,
} from "@/services/shared";
import { useEnrollInOpportunity } from "@/services/updateParticipant";
import { useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/store";
import { PageTitle } from "@/components/PageTitle";
import Footer from "@/components/Layouts/Footer";
import { Button } from "@/components/ui/Button";
import { ChevronLeftIcon, EditIcon, Loader } from "lucide-react";
import { toast } from "react-toastify";
import { Question } from "@/types/onboarding";
import { useQuestionnaireAnswers } from "@/hooks/useQuestionnaireAnswers";
import {
  getErrorStatus,
  getEnrollmentErrorMessage,
} from "@/utils/apiErrorHandling";
import { parseQuestionnaireOptions } from "@/utils/questionnaireParser";
import { findOpportunityByIdOrSlug } from "@/utils/findOpportunity";
import { useTaxonomyLabels } from "@/hooks/useTaxonomyLabels";
import { formatAnswerForDisplay } from "@/utils/formatAnswer";
import { PenLine } from "lucide-react";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { Tag } from "@chakra-ui/react";
import SuccessBubbles from "@/components/Icons/SuccessBubbles";
import {
  QuestionnaireSection,
  getQuestionnaireSections,
} from "@/utils/opportunityQuestionnaire";

export default function OpportunityReviewPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const opportunitySlug = sp.get("opp") || "";
  const { accessibleOpportunities } = useAuthStore();

  const currentOpportunity = findOpportunityByIdOrSlug(
    accessibleOpportunities,
    opportunitySlug
  );

  const opportunityId = currentOpportunity?.id;

  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { questionnaireAnswers: answers, clearAnswers } =
    useQuestionnaireAnswers(opportunityId?.toString() || "");

  const enrollMutation = useEnrollInOpportunity();

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

  const handleBack = () => {
    router.push(`/opportunities/fill/?opp=${opportunitySlug}`);
  };

  const handleEdit = (fieldName: string) => {
    router.push(
      `/opportunities/fill/?opp=${opportunitySlug}&edit=${fieldName}`
    );
  };

  const goToOpportunity = useCallback(() => {
    router.push(`/discover/?opp=${opportunitySlug}`);
  }, [router, opportunitySlug]);

  useEffect(() => {
    if (!showSuccessDialog) {
      return;
    }
    const timeoutId = setTimeout(() => {
      goToOpportunity();
    }, 5000);
    return () => clearTimeout(timeoutId);
  }, [showSuccessDialog, goToOpportunity]);

  const handleSubmit = async () => {
    if (!user?.email) {
      setSubmitError("User email is required");
      return;
    }

    setSubmitError(null);

    try {
      await enrollMutation.mutateAsync({
        opportunityId: opportunityId?.toString() || "",
        questionnaireAnswers: answers,
      });

      const accessibleOpportunities = queryClient.getQueryData([
        "accessible-opportunities",
        user?.id,
      ]) as any[];

      if (accessibleOpportunities) {
        const currentOpportunity = findOpportunityByIdOrSlug(
          accessibleOpportunities,
          opportunityId?.toString() || ""
        );
      }

      clearAnswers();
      setShowSuccessDialog(true);
    } catch (error: unknown) {
      console.error("Enrollment error:", error);

      const status = getErrorStatus(error);
      if (status === 401) {
        router.push("/login/");
        return;
      }

      setSubmitError(getEnrollmentErrorMessage(error));
    }
  };

  function TaxonomyLabelsDisplay({
    question,
    value,
  }: {
    question: Question;
    value: string | string[];
  }) {
    const labels = useTaxonomyLabels(
      question,
      value,
      answers,
      user?.university
    );
    if (labels.length === 0) return <Text color="#A1A1AA">—</Text>;
    return (
      <Flex wrap="wrap" gap={2}>
        {labels.map((label, i) => (
          <Tag.Root
            key={`${question.field}-${i}`}
            variant="subtle"
            borderRadius="md"
            px={2}
            py="4px"
            h="26px"
            bg="#F4F4F5"
            boxShadow="0px 0px 1px 0px #27272A inset"
          >
            <Tag.Label fontSize="sm" lineHeight="unset" color="#27272A">
              {label}
            </Tag.Label>
          </Tag.Root>
        ))}
      </Flex>
    );
  }

  const renderFieldValue = (question: Question, value: any) => {
    const isEmpty =
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);
    if (isEmpty) {
      return <Text color="#A1A1AA">—</Text>;
    }

    if (
      question.type === "taxonomy-multiselect" ||
      question.type === "taxonomy-select"
    ) {
      return <TaxonomyLabelsDisplay question={question} value={value} />;
    }

    if (question.type === "textarea") {
      const display = formatAnswerForDisplay(question, value);
      return (
        <Text fontSize="sm" color="#3F3F46">
          {display}
        </Text>
      );
    }

    const display = formatAnswerForDisplay(question, value);
    return (
      <Text fontSize="sm" color="#3F3F46">
        {display}
      </Text>
    );
  };

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
        {/* Header */}
        <Box>
          <Heading fontSize="2xl" fontWeight="600" color="#18181B">
            Review Your Enrollment
          </Heading>
          <Text fontSize="lg" color="#52525B">
            Please review your answers for:{" "}
            <Text as="span">{opportunity.title}</Text>
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

        <VStack align="stretch" gap={6}>
          {sections.map((section) => {
            const sectionQuestions = section.questions.filter(
              (q) => q.type !== "display"
            );
            if (sectionQuestions.length === 0) return null;

            return (
              <Box
                key={section.id}
                borderRadius="12px"
                border="1px solid"
                borderColor="#E4E4E7"
              >
                <Flex
                  justify="space-between"
                  align="center"
                  p={4}
                  borderBottom="1px solid"
                  borderColor="#E4E4E7"
                >
                  <HStack gap={2}>
                    {section.title_icon && (
                      <Text fontSize="lg">
                        <i className={section.title_icon} />
                      </Text>
                    )}
                    <Heading fontSize="md" fontWeight="400" color="black">
                      {section.title}
                    </Heading>
                  </HStack>
                  <ButtonV2
                    size="sm"
                    borderRadius="xl"
                    variant="ghost"
                    border="1px solid"
                    borderColor="#D6EDFB"
                    px={4}
                    py={3}
                    fontSize="sm"
                    color="#1679AB"
                    onClick={() => handleEdit(sectionQuestions[0].field)}
                  >
                    <PenLine
                      size={14}
                      style={{ marginRight: 6 }}
                      color="#1679AB"
                    />
                    Edit
                  </ButtonV2>
                </Flex>

                <Box
                  display="grid"
                  gridTemplateColumns={{
                    base: "1fr",
                    md: "repeat(auto-fill, minmax(200px, 1fr))",
                  }}
                  gap={4}
                  p={4}
                  bg="#FAFAFA"
                >
                  {sectionQuestions.map((question) => {
                    const value = answers[question.field];
                    const isSingle = sectionQuestions.length === 1;
                    const isFullWidth =
                      isSingle || question.type === "textarea";

                    return (
                      <Box
                        key={question.field}
                        gridColumn={isFullWidth ? "1 / -1" : undefined}
                      >
                        <Text
                          fontSize="xs"
                          fontWeight="500"
                          color="#71717A"
                          mb={1}
                          textTransform="uppercase"
                          letterSpacing="wider"
                        >
                          {question.filter_label || question.label}
                        </Text>
                        {renderFieldValue(question, value)}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </VStack>

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
            onClick={handleSubmit}
            variant="primary"
            h="48px"
            maxW="246px"
            fontSize={"md"}
            w="100%"
            disabled={sections.length === 0}
          >
            Submit
          </ButtonV2>
        </HStack>
      </VStack>
      {showSuccessDialog && (
        <Dialog.Root
          open={showSuccessDialog}
          onOpenChange={(details) => {
            if (!details.open) {
              goToOpportunity();
            }
          }}
          placement="center"
          trapFocus={true}
        >
          <Portal>
            <Dialog.Backdrop bg="blackAlpha.600" style={{ zIndex: 10000 }} />
            <Dialog.Positioner zIndex={10000}>
              <Dialog.Content
                bg="white"
                borderRadius="24px"
                w="90%"
                maxW="682px"
                p={{ base: 4, md: 8 }}
                boxShadow="0px 4px 6px -4px #0000001A, 0px 10px 15px -3px #0000001A"
              >
                <VStack gap={6} align="center" textAlign="center">
                  <SuccessBubbles />

                  <VStack gap={{ base: 3, md: 4 }} maxW="500px">
                    <Heading fontSize="4xl" fontWeight="700" color="#18181B">
                      You&apos;re enrolled!
                    </Heading>
                    <Text fontSize="sm" color="#52525B">
                      You have successfully enrolled in this opportunity. You
                      are now visible to organisations and can start receiving
                      updates and messages.
                    </Text>
                    <Text fontSize="sm" color="#6B7280">
                      You will be redirected back to opportunities shortly.
                    </Text>
                    <ButtonV2
                      onClick={goToOpportunity}
                      variant="primary"
                      h="48px"
                      maxW="260px"
                      w="100%"
                      fontSize="md"
                    >
                      Explore opportunity
                    </ButtonV2>
                  </VStack>
                </VStack>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      )}
    </Box>
  );
}
