'use client';

import { Progress, Box, Button, Heading, Text } from '@chakra-ui/react';
import { useOnboarding } from '@/app/onboarding/OnboardingContext';
import { FieldRenderer } from './FieldRenderer';
import { submitOnboardingAnswers } from './utils';
import { useRouter } from 'next/navigation';

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
    validateCurrentPage
  } = useOnboarding();
  const router = useRouter();


  const page = pages.find(p => p.id === currentPageId);
  const currentPageIndex = pages.findIndex(p => p.id === currentPageId);
  const progressPercent = pages.length > 0 ? ((currentPageIndex + 1) / pages.length) * 100 : 0;

  const handleValidation = () => {
    const validation = validateCurrentPage();

    if (!validation.isValid) {
      const missingLabels = validation.missingFields.map(f => '• ' + f.label).join('\n');
      const errorMsg = `Please fill all required fields:\n\n${missingLabels}`;
      alert(errorMsg);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (handleValidation()) {
      goToNextPage();
    }
  };

  const handleSubmit = async () => {
    if (!handleValidation()) return;

    const result = await submitOnboardingAnswers(answers, userType, token!);

    if (result.success) {
      alert('Congrats! Your profile is ready!')
      console.log('Done, you can check your profile through Django admin now');
    } else {
      const errorMsg = `Submission failed: ${result.error || 'Unknown error'}`;
      alert(errorMsg);
      console.error(errorMsg);
    }
    router.push('/home');
  };

  if (!page) return <Text>No onboarding page found.</Text>;

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

      <Heading size="md" mb={4}>
        {page.guide}
      </Heading>

      {page.questions.map((question) => (
        <FieldRenderer
          key={question.field}
          question={question}
          value={answers[question.field]}
          onChange={(value) => {
            // console.log(`[DEBUG] Field: ${question.field}, Value:`
            // , value, 'Type:', typeof value);
            setAnswer(question.field, value);
          }}
        />
      ))}

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
          >
            Submit
          </Button>
        ) : (
          <Button colorScheme="blue" onClick={handleNext}>
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
};
