import React from "react";
import { Box, Heading, Text, VStack, Link } from "@chakra-ui/react";

const Contact = () => {
  return (
    <Box
      bg="white"
      shadow="lg"
      w="100%"
      mx="auto"
      maxW="600px"
      borderRadius="lg"
      p={{ base: 4, lg: 8 }}
    >
      <Heading as="h1" size="2xl" color="gray.900" mb={8} textAlign="center">
        We&apos;d love to hear from you!
      </Heading>

      <VStack gap={8} align="stretch" w="100%">
        <Box>
          <Heading as="h2" size="lg" color="gray.800" mb={4}>
            Technical Support & Issues
          </Heading>
          <Text color="gray.600" lineHeight="relaxed">
            If you experience any problems with our website or platform, please
            email us at{" "}
            <Link
              href="mailto:contactus@uniconnected.com"
              color="blue.600"
              _hover={{ color: "blue.800" }}
              textDecoration="underline"
            >
              contactus@uniconnected.com
            </Link>
            .
          </Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" color="gray.800" mb={4}>
            General Inquiries
          </Heading>
          <Text color="gray.600" lineHeight="relaxed">
            Have a question about UniConnected or want to know more about how we
            can support you? Reach out anytime at{" "}
            <Link
              href="mailto:contactus@uniconnected.com"
              color="blue.600"
              _hover={{ color: "blue.800" }}
              textDecoration="underline"
            >
              contactus@uniconnected.com
            </Link>
            .
          </Text>
        </Box>

        <Box>
          <Text color="gray.600" textAlign="center" fontWeight="medium">
            We&apos;ll do our best to respond within 1–2 business days.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default Contact;
