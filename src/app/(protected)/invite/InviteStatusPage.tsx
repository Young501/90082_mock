import {
  Box,
  Container,
  Text,
  VStack,
  Icon,
  useBreakpointValue,
} from "@chakra-ui/react";
import { CheckCircle, AlertCircle } from "lucide-react";

interface InviteStatusPageProps {
  type: "success" | "error";
  title: string;
  description: string;
  countdown?: number;
}

export const InviteStatusPage = ({
  type,
  title,
  description,
  countdown,
}: InviteStatusPageProps) => {
  const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });
  const isSuccess = type === "success";
  const StatusIcon = isSuccess ? CheckCircle : AlertCircle;
  const iconColor = isSuccess ? "green.500" : "red.500";
  const titleColor = isSuccess ? "green.600" : "black";

  return (
    <Container maxW={containerMaxW} p={0} h="100%">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        textAlign="center"
        px={{ base: 4, md: 6, lg: 8 }}
        py={{ base: 8, md: 12, lg: 16 }}
      >
        <VStack gap={{ base: 6, md: 8 }}>
          <Icon
            as={StatusIcon}
            boxSize={{ base: 12, md: 16, lg: 20 }}
            color={iconColor}
          />
          <Text
            fontSize={{ base: "24px", md: "32px", lg: "42px" }}
            fontWeight="700"
            color={titleColor}
            lineHeight="1.21"
          >
            {title}
          </Text>
          <Text
            fontSize={{ base: "14px", md: "18px", lg: "20px" }}
            color="black"
            maxWidth={{ base: "100%", md: "500px", lg: "600px" }}
            lineHeight="1.4"
            px={{ base: 2, md: 0 }}
          >
            {description}
          </Text>
          {countdown !== undefined && (
            <Text
              fontSize={{ base: "16px", md: "18px" }}
              color="gray.600"
              fontWeight="500"
            >
              Redirecting to dashboard in {countdown} seconds...
            </Text>
          )}
        </VStack>
      </Box>
    </Container>
  );
};
