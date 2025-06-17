'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Container, Text, VStack, useBreakpointValue } from '@chakra-ui/react';

export default function EmailSentPage() {
    const searchParams = useSearchParams();
    const [userEmail, setUserEmail] = useState('');
    const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });

    useEffect(() => {
        const email = searchParams.get('email') || 'your email';
        setUserEmail(email);
    }, [searchParams]);

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
                    <Text
                        fontSize={{ base: "28px", md: "38px", lg: "48px" }}
                        fontWeight="700"
                        color="black"
                        lineHeight="1.21"
                        maxWidth={{ base: "100%", md: "600px", lg: "800px" }}
                    >
                        We sent verification to your email
                    </Text>

                    <VStack gap={{ base: 2, md: 3 }}>
                        <Text
                            fontSize={{ base: "16px", md: "20px", lg: "24px" }}
                            color="black"
                            lineHeight="1.4"
                        >
                            Verify your email at <Text as="span" fontWeight="600">{userEmail}</Text>
                        </Text>

                        <Text
                            fontSize={{ base: "16px", md: "20px", lg: "24px" }}
                            color="black"
                            lineHeight="1.4"
                        >
                            to continue creating an account
                        </Text>
                    </VStack>
                </VStack>
            </Box>
        </Container>
    );
}