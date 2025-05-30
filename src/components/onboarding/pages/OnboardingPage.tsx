'use client';

import { Progress, Box, Button, Heading, Text } from '@chakra-ui/react';
import { useOnboarding } from '@/components/onboarding/contexts/OnboardingContext';
import { FieldRenderer } from '../fields/FieldRenderer';

type Props = {
  userType: string;
};

export const OnboardingPage = ({userType} : Props) => {
    const {
        pages,
        currentPageId,
        answers,
        setAnswer,
        goToNextPage,
        goToPreviousPage,
        validateCurrentPage,
        submitAnswers
    } = useOnboarding();

    const page = pages.find(p => p.id === currentPageId);
    const currentPageIndex = pages.findIndex(p => p.id === currentPageId);
    const progressPercent = pages.length > 0 ? ((currentPageIndex + 1) / pages.length) * 100 : 0;
    const handleSubmit = async () => {
        const res = await submitAnswers(userType);
        res ? alert('Done, U can check your profile through django admin now') : alert('Failed')
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

            {page.questions.map(question => (
                <FieldRenderer
                    key={question.field}
                    question={question}
                    value={answers[question.field]}
                    onChange={value => setAnswer(question.field, value)}
                />
            ))}

            <Box mt={6} display="flex" justifyContent="space-between">
                {page.id !== 1 && (
                    <Button onClick={goToPreviousPage}>
                        Previous
                    </Button>
                )}
                
                {!page.follow_by ? (
                    <Button colorScheme="blue" onClick={async () => {
                        if (validateCurrentPage()) {await handleSubmit();}
                    }}>
                        Submit
                    </Button>
                ) : (
                    <Button colorScheme="blue" onClick={() => {
                        if (validateCurrentPage()) {goToNextPage();}
                    }}>
                        Next
                    </Button>
                )}
            </Box>
        </Box>
    );
};
