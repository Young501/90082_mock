"use client";

import { useRouter } from "next/navigation";
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
import {
  ArrowRight,
  CheckCircle2,
  Handshake,
  Home,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type PrototypeTask = {
  task: string;
  title: string;
  description: string;
  href: string;
  accent: string;
  soft: string;
  icon: LucideIcon;
  workflows: string[];
};

const prototypeTasks: PrototypeTask[] = [
  {
    task: "Task 3",
    title: "In-App Messaging Improvements",
    description:
      "Conversation management and moderation prototype built on the current messaging UI.",
    href: "/prototype/messaging-task-3/",
    accent: "#1679AB",
    soft: "#EAF6FD",
    icon: MessageSquareText,
    workflows: [
      "Mute, block, read / unread",
      "Report message moderation flow",
      "Edit, delete, and admin notice",
    ],
  },
  {
    task: "Task 4",
    title: "Self-Reported Opportunity Matches",
    description:
      "User-reported match workflow from opportunity profile to messaging confirmation.",
    href: "/prototype/opportunity-match-task-4/",
    accent: "#176E78",
    soft: "#E9F7F6",
    icon: Handshake,
    workflows: [
      "I matched request from opportunity view",
      "Confirm / reject system message",
      "Hide profile opt-in after confirmation",
    ],
  },
  {
    task: "Task 6",
    title: "Periodic Student Account Verification",
    description:
      "Student verification email workflow using the current login page for valid and deactivated accounts.",
    href: "/prototype/student-verification-task-6/",
    accent: "#1679AB",
    soft: "#EAF6FD",
    icon: ShieldCheck,
    workflows: [
      "Email link to current login page",
      "Verified student success prompt",
      "Deactivated account recovery message",
    ],
  },
  {
    task: "Task 8",
    title: "Improve Student and Organisation Home Pages",
    description:
      "Smart recommendations, pending actions, and organisation team members added to the current home dashboard.",
    href: "/prototype/home-task-8/",
    accent: "#1F7F7B",
    soft: "#E9F7F6",
    icon: Home,
    workflows: [
      "Student home pending actions",
      "Rules-based smart recommendations",
      "Organisation home team members",
    ],
  },
];

export default function PrototypePage() {
  const router = useRouter();

  return (
    <Box minH="100vh" bg="#F6F8F8" color="#18181B">
      <Container maxW="1060px" px={{ base: 4, md: 6 }} py={{ base: 7, md: 10 }}>
        <Stack gap={6}>
          <Flex
            align={{ base: "flex-start", md: "flex-end" }}
            justify="space-between"
            gap={4}
            direction={{ base: "column", md: "row" }}
            pb={5}
            borderBottomWidth="1px"
            borderColor="#D9DFDC"
          >
            <Box maxW="680px">
              <Text color="#64706A" fontSize="sm" fontWeight="800">
                Sprint prototype index
              </Text>
              <Heading
                as="h1"
                mt={2}
                fontSize={{ base: "34px", md: "48px" }}
                lineHeight="1"
                letterSpacing="0"
              >
                Task walkthroughs
              </Heading>
              <Text mt={4} color="#52525B" fontSize={{ base: "md", md: "lg" }}>
                Use this page as the clean demo entry. Only the active Sprint
                prototypes are listed here.
              </Text>
            </Box>

            <Badge
              bg="#E8F5EC"
              color="#176E43"
              border="1px solid"
              borderColor="#B8DDC5"
              borderRadius="md"
              px={3}
              py={1.5}
              fontSize="sm"
            >
              4 prototypes ready
            </Badge>
          </Flex>

          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={4}>
            {prototypeTasks.map((item) => {
              const Icon = item.icon;

              return (
                <Box
                  key={item.task}
                  bg="white"
                  borderWidth="1px"
                  borderColor="#E4E4E7"
                  borderRadius="xl"
                  p={{ base: 5, md: 6 }}
                  minH="320px"
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  transition="border-color 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease"
                  _hover={{
                    borderColor: item.accent,
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.07)",
                  }}
                >
                  <Stack gap={5}>
                    <HStack justify="space-between" align="flex-start">
                      <Box
                        w="44px"
                        h="44px"
                        borderRadius="10px"
                        bg={item.soft}
                        color={item.accent}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <Icon size={22} strokeWidth={1.8} />
                      </Box>
                      <Badge
                        bg="#F4F4F5"
                        color="#52525B"
                        borderRadius="md"
                        px={2}
                        py={1}
                      >
                        {item.task}
                      </Badge>
                    </HStack>

                    <Box>
                      <Heading as="h2" fontSize="24px" letterSpacing="0">
                        {item.title}
                      </Heading>
                      <Text mt={3} color="#52525B" lineHeight="1.6">
                        {item.description}
                      </Text>
                    </Box>

                    <Stack gap={2}>
                      {item.workflows.map((workflow) => (
                        <HStack key={workflow} gap={2} color="#374151">
                          <CheckCircle2 size={15} color={item.accent} />
                          <Text fontSize="sm">{workflow}</Text>
                        </HStack>
                      ))}
                    </Stack>
                  </Stack>

                  <Button
                    mt={6}
                    alignSelf="flex-start"
                    bg="#18393C"
                    color="white"
                    borderRadius="lg"
                    px={4}
                    _hover={{ bg: "#10272A" }}
                    onClick={() => router.push(item.href)}
                  >
                    <HStack gap={2}>
                      <Text>Open prototype</Text>
                      <ArrowRight size={16} />
                    </HStack>
                  </Button>
                </Box>
              );
            })}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
