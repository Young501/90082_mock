'use client';

import { Progress, Box, Button, Heading, Text } from '@chakra-ui/react';
import { Alert } from '@chakra-ui/react';
import { useOnboarding } from '@/app/onboarding/OnboardingContext';
import { FieldRenderer } from './FieldRenderer';
import { submitOnboardingAnswers } from './utils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {
  userType: string;
  token: string;
};

export const OnboardingSteps = ({ userType, token }: Props) => {
  const {
    pages,
    currentPageId,
    answers,
    setAnswer,
    goToNextPage,
    goToPreviousPage,
    validateCurrentPage,
    hasAttemptedValidation,
    setHasAttemptedValidation,
    fieldErrors,
    setFieldErrors,
    validateField,
    getAllQuestionsFromPage,
    getAllQuestionsRecursively,
  } = useOnboarding();

  const router = useRouter();
  const [showValidationMessage, setShowValidationMessage] = useState(false);

  const page = pages.find(p => p.id === currentPageId);
  const currentPageIndex = pages.findIndex(p => p.id === currentPageId);
  const progressPercent = pages.length > 0 ? ((currentPageIndex + 1) / pages.length) * 100 : 0;

  const performValidation = () => {
    if (!page) return { isValid: true, hasErrors: false };

    setHasAttemptedValidation(true);

    const allQuestions = getAllQuestionsFromPage(page);

    let hasErrors = false;
    const newFieldErrors: { [field: string]: string[] } = {};

    allQuestions.forEach(question => {
      const errors = validateField(question.field, answers[question.field], question);
      newFieldErrors[question.field] = errors;
      if (errors.length > 0) {
        hasErrors = true;
      }
    });

    setFieldErrors(newFieldErrors);

    const validation = validateCurrentPage();
    return {
      isValid: validation.isValid && !hasErrors,
      hasErrors: hasErrors || !validation.isValid
    };
  };

  const handleNext = () => {
    const { isValid, hasErrors } = performValidation();

    if (!isValid || hasErrors) {
      setShowValidationMessage(true);
      return;
    }

    setShowValidationMessage(false);
    goToNextPage();
  };

  const handleSubmit = async () => {
    const { isValid, hasErrors } = performValidation();

    if (!isValid || hasErrors) {
      setShowValidationMessage(true);
      return;
    }

    const allQuestions = pages.flatMap(page =>
      getAllQuestionsRecursively(page.questions)
    );

    const result = await submitOnboardingAnswers(answers, userType, token!, allQuestions);

    if (result.success) {
      alert('Congrats! Your profile is ready!')
      console.log('Done, you can check your profile through Django admin now');
      router.push('/home');
    } else {
      const errorMsg = `Submission failed: ${result.error || 'Unknown error'}`;
      alert(errorMsg);
      console.error(errorMsg);
    }
  };

  if (!page) return <Text>No onboarding page found.</Text>;

  const hasFieldErrors = Object.values(fieldErrors).some(errors => errors.length > 0);

  return (
    <Box p={6}>
      <Box mb={6}>
        <Text fontSize="sm" mb={1}>Progress: {Math.round(progressPercent)}%</Text>
        <Progress.Root value={progressPercent} max={100}>
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      </Box>

      <Text fontSize="sm" color="gray.600" mb={4}>
        Required fields are marked with <Text as="span" color="red">*</Text>
      </Text>

      <Heading size="md" mb={4}>
        {page.guide}
      </Heading>

      {page.questions.map((question) => (
        <FieldRenderer
          key={question.field}
          question={question}
          value={answers[question.field]}
          onChange={(value) => setAnswer(question.field, value)}
          allAnswers={answers}
          onAnswerChange={setAnswer}
        />
      ))}

      {(showValidationMessage && (hasAttemptedValidation && hasFieldErrors)) && (
        <Alert.Root status="error" mb={4}>
          <Alert.Indicator />
          <Alert.Title>Please complete all required information as indicated</Alert.Title>
        </Alert.Root>
      )}

      <Box mt={6} display="flex" justifyContent="space-between">
        {page.id !== 1 && (
          <Button onClick={goToPreviousPage}>
            Previous
          </Button>
        )}

        {!page.follow_by ? (
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            disabled={hasAttemptedValidation && hasFieldErrors}
          >
            Submit
          </Button>
        ) : (
          <Button
            colorScheme="blue"
            onClick={handleNext}
            disabled={hasAttemptedValidation && hasFieldErrors}
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
};