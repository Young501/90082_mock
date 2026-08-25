"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ArrowLeft, CalendarClock, Mail, ShieldCheck } from "lucide-react";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { PageTitle } from "@/components/PageTitle";
import { CONTACT_EMAIL } from "@/utils/constants";

type CaseKey = "active" | "expired";

type CaseDefinition = {
  key: CaseKey;
  title: string;
  shortTitle: string;
  subject: string;
  sentAt: string;
  dueAt: string;
  accent: string;
  soft: string;
  icon: typeof ShieldCheck;
  body: string;
  buttonLabel: string;
  backendTrace: string[];
};

const caseDefinitions: CaseDefinition[] = [
  {
    key: "active",
    title: "Verification succeeds",
    shortTitle: "Verified",
    subject: "Confirm your UniConnected student status",
    sentAt: "Tue, Aug 25, 2026 at 9:12 AM",
    dueAt: "Respond by Sep 8, 2026",
    accent: "#1679AB",
    soft: "#EAF6FD",
    icon: ShieldCheck,
    body: "Please confirm that you are still an active student. After signing in from this email link, your account will stay active and you can update your profile if needed.",
    buttonLabel: "Verify student status",
    backendTrace: [
      "verification_email: sent for current cycle",
      "verification_token: valid",
      "login_result: authenticated",
      "student_account: remains active",
    ],
  },
  {
    key: "expired",
    title: "Login shows deactivated account",
    shortTitle: "Deactivated",
    subject: "Confirm your UniConnected student status",
    sentAt: "Tue, Aug 25, 2026 at 9:12 AM",
    dueAt: "Respond by Sep 8, 2026",
    accent: "#1679AB",
    soft: "#EAF6FD",
    icon: ShieldCheck,
    body: "Please confirm that you are still an active student. After signing in from this email link, your account will stay active and you can update your profile if needed.",
    buttonLabel: "Verify student status",
    backendTrace: [
      "verification_email: sent for current cycle",
      "verification_token: expired",
      "student_account: deactivated after no response",
      "login_result: contact UniConnected to recover",
    ],
  },
];

const defaultCase = caseDefinitions[0];
const verificationSenderName = "UniConnected Student Support";
const verificationRecipientName = "Mia Chen";
const verificationRecipientEmail = "student@mock.local";

function getCaseDefinition(key: string | null): CaseDefinition {
  return caseDefinitions.find((item) => item.key === key) ?? defaultCase;
}

function StudentVerificationTask6Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseDefinition = getCaseDefinition(searchParams.get("case"));
  const Icon = caseDefinition.icon;

  function selectCase(key: CaseKey) {
    router.push(`/prototype/student-verification-task-6/?case=${key}`, {
      scroll: false,
    });
  }

  function openLoginFromEmail() {
    router.push(
      `/login/?prototype=student-verification&case=${caseDefinition.key}`
    );
  }

  return (
    <Box minH="100vh" bg="#F6F8F8" color="#18181B">
      <PageTitle title="Task 6 Student Verification Prototype" />
      <Container maxW="1180px" py={{ base: 5, md: 8 }} px={{ base: 4, md: 6 }}>
        <Stack gap={5}>
          <Flex
            justify="space-between"
            align={{ base: "flex-start", lg: "center" }}
            direction={{ base: "column", lg: "row" }}
            gap={4}
          >
            <HStack gap={3} align="center">
              <Button
                variant="outline"
                borderColor="#D4D4D8"
                bg="white"
                borderRadius="md"
                h="38px"
                onClick={() => router.push("/prototype/")}
              >
                <HStack gap={2}>
                  <ArrowLeft size={16} />
                  <Text>Prototype</Text>
                </HStack>
              </Button>
              <Box>
                <Text fontSize="sm" color="#71717A" fontWeight="700">
                  Task 6 prototype on current email + login flow
                </Text>
                <Heading
                  as="h1"
                  fontSize={{ base: "28px", md: "36px" }}
                  lineHeight="1.05"
                  letterSpacing="0"
                >
                  Periodic student account verification
                </Heading>
              </Box>
            </HStack>

            <HStack gap={2} wrap="wrap">
              {caseDefinitions.map((item) => (
                <Button
                  key={item.key}
                  size="sm"
                  h="38px"
                  borderRadius="md"
                  bg={item.key === caseDefinition.key ? "#18393C" : "white"}
                  color={item.key === caseDefinition.key ? "white" : "#18181B"}
                  borderWidth="1px"
                  borderColor={
                    item.key === caseDefinition.key ? "#18393C" : "#D4D4D8"
                  }
                  _hover={{
                    bg: item.key === caseDefinition.key ? "#10272A" : "#F8FAFC",
                  }}
                  onClick={() => selectCase(item.key)}
                >
                  {item.shortTitle}
                </Button>
              ))}
            </HStack>
          </Flex>

          <Grid
            templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 320px" }}
            gap={4}
          >
            <Box
              bg="white"
              borderWidth="1px"
              borderColor="#E4E4E7"
              borderRadius="xl"
              overflow="hidden"
            >
              <Flex
                justify="space-between"
                align={{ base: "flex-start", md: "center" }}
                gap={3}
                direction={{ base: "column", md: "row" }}
                px={{ base: 5, md: 6 }}
                py={5}
                borderBottomWidth="1px"
                borderColor="#E4E4E7"
                bg="white"
              >
                <HStack gap={3}>
                  <Box
                    w="44px"
                    h="44px"
                    borderRadius="12px"
                    bg={caseDefinition.soft}
                    color={caseDefinition.accent}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Icon size={21} strokeWidth={1.8} />
                  </Box>
                  <Box>
                    <Heading as="h2" fontSize="22px">
                      {caseDefinition.title}
                    </Heading>
                    <Text mt={1} color="#71717A" fontSize="sm">
                      Email preview opens the current UniConnected login page
                    </Text>
                  </Box>
                </HStack>
                <Badge
                  bg={caseDefinition.key === "active" ? "#E8F5EC" : "#F4F4F5"}
                  color={
                    caseDefinition.key === "active" ? "#176E43" : "#3F3F46"
                  }
                  borderRadius="md"
                  px={2}
                  py={1}
                >
                  {caseDefinition.key === "active"
                    ? "Login result: verified"
                    : "Login result: deactivated"}
                </Badge>
              </Flex>

              <Box bg="#FAFBFC" p={{ base: 4, md: 6 }}>
                <Box
                  maxW="740px"
                  mx="auto"
                  borderWidth="1px"
                  borderColor="#D9DFDC"
                  borderRadius="2xl"
                  overflow="hidden"
                  bg="white"
                  boxShadow="0 12px 32px rgba(15, 23, 42, 0.06)"
                >
                  <Flex
                    align="center"
                    justify="space-between"
                    px={4}
                    py={2.5}
                    bg="#F4F4F5"
                    borderBottomWidth="1px"
                    borderColor="#E4E4E7"
                  >
                    <HStack gap={2} color="#71717A">
                      <Mail size={15} />
                      <Text fontSize="sm" fontWeight="700">
                        Inbox
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="#71717A">
                      Student verification email
                    </Text>
                  </Flex>

                  <Box px={{ base: 4, md: 5 }} py={4}>
                    <Stack gap={3}>
                      <Text fontWeight="800" fontSize="18px" lineHeight="1.35">
                        {caseDefinition.subject}
                      </Text>
                      <Flex justify="space-between" align="flex-start" gap={4}>
                        <HStack align="flex-start" gap={3} minW={0}>
                          <Box
                            w="38px"
                            h="38px"
                            borderRadius="full"
                            bg="#E7F4F6"
                            color="#1679AB"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontWeight="900"
                            flexShrink={0}
                          >
                            UC
                          </Box>
                          <Box minW={0}>
                            <Text fontWeight="800" lineHeight="1.3">
                              {verificationSenderName}
                            </Text>
                            <Text color="#71717A" fontSize="sm">
                              {CONTACT_EMAIL}
                            </Text>
                            <Text mt={1.5} color="#71717A" fontSize="sm">
                              to {verificationRecipientName} &lt;
                              {verificationRecipientEmail}&gt;
                            </Text>
                          </Box>
                        </HStack>
                        <Text
                          color="#71717A"
                          fontSize="sm"
                          textAlign="right"
                          flexShrink={0}
                        >
                          {caseDefinition.sentAt}
                        </Text>
                      </Flex>
                      <HStack gap={2} color="#52525B" fontSize="sm" pt={1}>
                        <CalendarClock size={15} />
                        <Text>{caseDefinition.dueAt}</Text>
                      </HStack>
                    </Stack>
                  </Box>

                  <Stack
                    gap={4}
                    px={{ base: 5, md: 7 }}
                    py={{ base: 6, md: 7 }}
                  >
                    <HStack gap={2} color={caseDefinition.accent}>
                      <Icon size={18} />
                      <Text fontSize="sm" fontWeight="800">
                        UniConnected student check-in
                      </Text>
                    </HStack>

                    <Heading as="h3" fontSize={{ base: "24px", md: "30px" }}>
                      Confirm you are still studying
                    </Heading>

                    <Text color="#52525B" lineHeight="1.65">
                      Hi {verificationRecipientName},
                    </Text>
                    <Text color="#52525B" lineHeight="1.65">
                      {caseDefinition.body}
                    </Text>

                    <ButtonV2
                      variant="primary"
                      alignSelf="center"
                      w="100%"
                      maxW="360px"
                      h="46px"
                      mt={3}
                      onClick={openLoginFromEmail}
                    >
                      {caseDefinition.buttonLabel}
                    </ButtonV2>

                    <Box
                      mt={2}
                      pt={4}
                      borderTopWidth="1px"
                      borderColor="#E4E4E7"
                    >
                      <Text color="#52525B" lineHeight="1.65">
                        Kind regards,
                      </Text>
                      <Text mt={1} color="#18181B" fontWeight="700">
                        {verificationSenderName}
                      </Text>
                      <Text mt={1} color="#71717A" fontSize="sm">
                        {CONTACT_EMAIL}
                      </Text>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Box>

            <Stack gap={4}>
              <Box
                bg="white"
                borderWidth="1px"
                borderColor="#E4E4E7"
                borderRadius="xl"
                overflow="hidden"
              >
                <Box
                  px={4}
                  py={3.5}
                  borderBottomWidth="1px"
                  borderColor="#E4E4E7"
                  bg="#FAFBFC"
                >
                  <Text fontWeight="800">Demo path</Text>
                  <Text mt={0.5} fontSize="sm" color="#71717A">
                    What to click during the walkthrough
                  </Text>
                </Box>
                <Stack gap={3.5} p={4}>
                  {[
                    "Student receives verification email",
                    "Student clicks email button",
                    "Current login page handles the link",
                    caseDefinition.key === "active"
                      ? "Success modal asks whether to update profile"
                      : "Deactivated modal shows recovery contact",
                  ].map((item, index) => (
                    <HStack key={item} align="flex-start" gap={3}>
                      <Box
                        w="24px"
                        h="24px"
                        borderRadius="full"
                        bg={caseDefinition.soft}
                        color={caseDefinition.accent}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                        fontSize="12px"
                        fontWeight="800"
                      >
                        {index + 1}
                      </Box>
                      <Text fontSize="sm" color="#374151">
                        {item}
                      </Text>
                    </HStack>
                  ))}
                </Stack>
              </Box>

              <Box
                bg="white"
                borderWidth="1px"
                borderColor="#E4E4E7"
                borderRadius="xl"
                overflow="hidden"
              >
                <Box
                  px={4}
                  py={3.5}
                  borderBottomWidth="1px"
                  borderColor="#E4E4E7"
                  bg="#FAFBFC"
                >
                  <Text fontWeight="800">Backend trace</Text>
                  <Text mt={0.5} fontSize="sm" color="#71717A">
                    Prototype state behind the UI
                  </Text>
                </Box>
                <Stack gap={2} p={4}>
                  {caseDefinition.backendTrace.map((item) => (
                    <Box
                      key={item}
                      borderWidth="1px"
                      borderColor={
                        item.includes("expired") || item.includes("deactivated")
                          ? "#D4D4D8"
                          : "#E4E4E7"
                      }
                      bg={
                        item.includes("expired") || item.includes("deactivated")
                          ? "#F4F4F5"
                          : "#FAFBFC"
                      }
                      borderRadius="md"
                      px={3}
                      py={2}
                    >
                      <Text fontSize="xs" color="#374151" fontWeight="700">
                        {item}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}

export default function StudentVerificationTask6Page() {
  return (
    <Suspense fallback={null}>
      <StudentVerificationTask6Content />
    </Suspense>
  );
}
