import {
  Box,
  Container,
  Text,
  VStack,
  Spinner,
  useBreakpointValue,
} from "@chakra-ui/react";

export const LoadingState = () => {
  const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });

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
          <Spinner size="xl" color="blue.500" borderWidth="4px" />
          <Text
            fontSize={{ base: "24px", md: "32px", lg: "42px" }}
            fontWeight="700"
            color="black"
          >
            Loading Invitation
          </Text>
          <Text
            fontSize={{ base: "14px", md: "18px", lg: "20px" }}
            color="black"
            maxWidth={{ base: "100%", md: "500px", lg: "600px" }}
            lineHeight="1.4"
            px={{ base: 2, md: 0 }}
          >
            Please wait while we load your invitation details...
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};
