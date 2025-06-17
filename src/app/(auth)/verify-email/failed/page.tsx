'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Container, Text, Button, VStack, Icon, Alert, useBreakpointValue } from '@chakra-ui/react';
import { XCircle } from 'lucide-react';

export default function EmailVerifyFailedPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState('');
    const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });

    useEffect(() => {
        const message = searchParams.get('message') || 'Email verification failed. Please try again.';
        setErrorMessage(message);
    }, [searchParams]);

    const handleSignupClick = () => {
        router.push('/signup');
    };

    const handleLoginClick = () => {
        router.push('/login');
    };

    return (
        <Container maxW={containerMaxW} p={0} h="100%">
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="60vh"
                textAlign="center"
                px={{ base: 4, md: 6, lg: 8 }}
                py={{ base: 8, md: 12, lg: 16 }}
            >
                <VStack gap={{ base: 6, md: 8 }}>
                    <Icon
                        as={XCircle}
                        boxSize={{ base: 12, md: 16, lg: 20 }}
                        color="red.500"
                    />

                    <Text
                        fontSize={{ base: "24px", md: "32px", lg: "42px" }}
                        fontWeight="700"
                        color="black"
                        lineHeight="1.21"
                    >
                        Email Verification Failed
                    </Text>

                    <Alert.Root
                        status="error"
                        borderRadius="md"
                        maxWidth={{ base: "100%", md: "500px", lg: "600px" }}
                        bg="red.50"
                        border="1px solid"
                        borderColor="red.200"
                    >
                        <Alert.Indicator />
                        <Alert.Title>
                            <Text
                                fontSize={{ base: "14px", md: "16px" }}
                                color="red.800"
                            >
                                {errorMessage}
                            </Text>
                        </Alert.Title>
                    </Alert.Root>

                    <Text
                        fontSize={{ base: "14px", md: "18px", lg: "20px" }}
                        color="black"
                        maxWidth={{ base: "100%", md: "500px", lg: "600px" }}
                        lineHeight="1.4"
                        px={{ base: 2, md: 0 }}
                    >
                        Don&apos;t worry! You can try registering again or contact our support team if you continue to experience issues.
                    </Text>

                    <VStack gap={{ base: 3, md: 4 }} width="full" maxWidth={{ base: "280px", md: "320px", lg: "400px" }}>
                        <Button
                            w="100%"
                            h={{ base: "45px", md: "50px" }}
                            bg="#002157"
                            color="white"
                            borderRadius="25px"
                            fontSize={{ base: "16px", md: "18px", lg: "20px" }}
                            fontWeight="500"
                            onClick={handleSignupClick}
                            _hover={{ opacity: 0.8 }}
                            _active={{ transform: "scale(0.98)" }}
                            boxShadow="0px 4px 4px 0px rgba(0, 0, 0, 0.25)"
                            transition="all 0.2s ease"
                        >
                            Register Again
                        </Button>

                        <Button
                            w="100%"
                            h={{ base: "45px", md: "50px" }}
                            bg="white"
                            color="#002157"
                            borderRadius="25px"
                            fontSize={{ base: "16px", md: "18px", lg: "20px" }}
                            fontWeight="500"
                            onClick={handleLoginClick}
                            border="2px solid #002157"
                            _hover={{ bg: "gray.50" }}
                            _active={{ transform: "scale(0.98)" }}
                            transition="all 0.2s ease"
                        >
                            Back to Login
                        </Button>
                    </VStack>
                </VStack>
            </Box>
        </Container>
    );
}