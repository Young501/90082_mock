"use client";

import type { ComponentType } from "react";
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
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  Building2,
  ClipboardList,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  MessageSquareText,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  mockOpportunities,
  mockOrganisation,
  mockOrganisationMember,
  mockStudentProfile,
  mockUserDetailsByType,
  mockUsersByType,
  setActiveUserType,
  type MockUserType,
} from "@/mocks/mockData";
import { useAuthStore } from "@/store";
import type { UserProfile } from "@/types/shared";

type DemoRoute = {
  step: string;
  title: string;
  description: string;
  href: string;
  role: MockUserType;
  status: "Ready" | "Storyboard" | "Optional";
  segment: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
};

const roleStyles: Record<
  MockUserType,
  { label: string; accent: string; soft: string }
> = {
  student: { label: "Student", accent: "#2AA8E0", soft: "#E7F2FF" },
  organisation: { label: "Organisation", accent: "#3AADA8", soft: "#E9F7F6" },
  coordinator: { label: "Coordinator", accent: "#9B6B1D", soft: "#FFF2D8" },
};

const statusStyles: Record<
  DemoRoute["status"],
  { fg: string; bg: string; border: string }
> = {
  Ready: { fg: "#176E43", bg: "#E8F5EC", border: "#B8DDC5" },
  Storyboard: { fg: "#75530E", bg: "#FFF4D7", border: "#E4C56F" },
  Optional: { fg: "#576069", bg: "#F2F4F4", border: "#D7DDDD" },
};

const demoRoutes: DemoRoute[] = [
  {
    step: "01",
    title: "Student home",
    description: "Profile completion, enrolled opportunities, recent messages.",
    href: "/home/",
    role: "student",
    status: "Ready",
    segment: "Foundation",
    icon: GraduationCap,
  },
  {
    step: "02",
    title: "Discovery search",
    description: "Partner-side student browsing, filters, saved folders.",
    href: "/discover/",
    role: "organisation",
    status: "Ready",
    segment: "Search",
    icon: Search,
  },
  {
    step: "03",
    title: "Student profile",
    description: "The record employers inspect before contacting a student.",
    href: "/profile/",
    role: "student",
    status: "Ready",
    segment: "Profile",
    icon: UserRound,
  },
  {
    step: "04",
    title: "Messaging",
    description: "Threaded conversation between a student and organisation.",
    href: "/messaging/",
    role: "organisation",
    status: "Ready",
    segment: "Comms",
    icon: MessageSquareText,
  },
  {
    step: "05",
    title: "Task 3 messaging workflows",
    description:
      "Guided chat tutorials for mute, block, report, read, edit, delete, and admin messages.",
    href: "/prototype/messaging-task-3/",
    role: "student",
    status: "Ready",
    segment: "Task 3",
    icon: MessageSquareText,
  },
  {
    step: "06",
    title: "Coordinator dashboard",
    description: "University-owned overview of opportunity activity.",
    href: "/dashboard/",
    role: "coordinator",
    status: "Ready",
    segment: "Coord",
    icon: LayoutDashboard,
  },
  {
    step: "07",
    title: "Manage participants",
    description: "Coordinator list view for enrolled students and partners.",
    href: "/dashboard/manage/",
    role: "coordinator",
    status: "Ready",
    segment: "Coord",
    icon: UsersRound,
  },
  {
    step: "08",
    title: "Matching view",
    description: "Storyboard route for the next matching conversation.",
    href: "/dashboard/manage/match/",
    role: "coordinator",
    status: "Storyboard",
    segment: "Match",
    icon: ShieldCheck,
  },
  {
    step: "09",
    title: "Team management",
    description: "Organisation admin view for members and invites.",
    href: "/team/",
    role: "organisation",
    status: "Ready",
    segment: "Admin",
    icon: Building2,
  },
  {
    step: "10",
    title: "Saved folders",
    description: "Same discovery route, seeded with folder-ready data.",
    href: "/discover/",
    role: "organisation",
    status: "Optional",
    segment: "Search",
    icon: FolderOpen,
  },
];

const defaultHrefByRole: Record<MockUserType, string> = {
  student: "/home/",
  organisation: "/home/",
  coordinator: "/dashboard/",
};

function profileForRole(role: MockUserType): UserProfile {
  if (role === "student") return mockStudentProfile as UserProfile;

  return {
    ...mockOrganisationMember,
    organisation: mockOrganisation,
  } as UserProfile;
}

export default function PrototypePage() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const setUserDetailsV2 = useAuthStore((state) => state.setUserDetailsV2);
  const setUserProfile = useAuthStore((state) => state.setUserProfile);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);
  const setAccessibleOpportunities = useAuthStore(
    (state) => state.setAccessibleOpportunities
  );
  const setCoordinatorOpportunities = useAuthStore(
    (state) => state.setCoordinatorOpportunities
  );
  const logout = useAuthStore((state) => state.logout);

  const mockApiEnabled = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
  const currentRole = currentUser?.userDetailsV2?.user_types?.[0]?.key;

  function enterAs(role: MockUserType, href: string) {
    const user = mockUsersByType[role];

    setActiveUserType(role);
    setAuthData(`mock-token-${role}`, user);
    setUserDetailsV2(mockUserDetailsByType[role]);
    setUserProfile(profileForRole(role));
    setAccessibleOpportunities(mockOpportunities);
    setCoordinatorOpportunities(mockOpportunities);
    setIsAuthenticated(true);
    router.push(href);
  }

  function resetSession() {
    logout();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("uc_mock_user_type");
    }
  }

  return (
    <Box minH="100vh" bg="#F6F7F4" color="#18242B">
      <Container maxW="1180px" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }}>
        <Flex
          align={{ base: "flex-start", lg: "flex-end" }}
          justify="space-between"
          direction={{ base: "column", lg: "row" }}
          gap={5}
          pb={6}
          borderBottom="1px solid"
          borderColor="#C9D2CE"
        >
          <Box maxW="690px">
            <Text fontSize="sm" color="#51605A" fontWeight="700">
              Sprint 1 prototype
            </Text>
            <Heading
              as="h1"
              mt={2}
              fontSize={{ base: "34px", md: "52px" }}
              lineHeight="0.95"
              fontWeight="800"
              letterSpacing="0"
            >
              Review control desk
            </Heading>
            <Text mt={4} color="#485650" fontSize={{ base: "md", md: "lg" }}>
              Seed a persona, open the protected route, and keep the demo order
              visible while the backend is unavailable.
            </Text>
          </Box>

          <Box
            w={{ base: "100%", lg: "300px" }}
            border="1px solid"
            borderColor="#C9D2CE"
            bg="#FFFFFF"
            px={4}
            py={3}
            borderRadius="6px"
          >
            <HStack justify="space-between" align="center">
              <Text color="#51605A" fontSize="sm" fontWeight="700">
                Mock API
              </Text>
              <Badge
                borderRadius="4px"
                px={2}
                py={1}
                bg={mockApiEnabled ? "#E8F5EC" : "#FFF4D7"}
                color={mockApiEnabled ? "#176E43" : "#75530E"}
              >
                {mockApiEnabled ? "Enabled" : "Check env"}
              </Badge>
            </HStack>
            <Text mt={3} color="#2F3B37" fontSize="sm">
              Current session: {currentRole ?? "none"}
            </Text>
            <Button
              mt={3}
              size="sm"
              variant="outline"
              borderColor="#AEB8B3"
              borderRadius="4px"
              color="#24332E"
              onClick={resetSession}
            >
              Clear session
            </Button>
          </Box>
        </Flex>

        <Grid
          mt={6}
          templateColumns={{ base: "1fr", lg: "280px 1fr" }}
          border="1px solid"
          borderColor="#C9D2CE"
          bg="#FFFFFF"
          minH="560px"
        >
          <Box bg="#10272A" color="#F5FBFA" p={{ base: 5, md: 6 }}>
            <HStack gap={3} align="center">
              <ClipboardList size={22} strokeWidth={1.8} />
              <Text fontWeight="800" fontSize="lg">
                Persona entry
              </Text>
            </HStack>
            <Text mt={4} color="#BCD1CD" fontSize="sm" lineHeight="1.6">
              Use these for quick jumps before starting a row-by-row
              walkthrough.
            </Text>

            <Stack mt={7} gap={3}>
              {(Object.keys(roleStyles) as MockUserType[]).map((role) => (
                <Button
                  key={role}
                  justifyContent="space-between"
                  bg="transparent"
                  color="#F5FBFA"
                  border="1px solid"
                  borderColor="rgba(245, 251, 250, 0.24)"
                  borderRadius="4px"
                  h="46px"
                  _hover={{ bg: "rgba(255, 255, 255, 0.08)" }}
                  _focusVisible={{
                    outline: "2px solid #F5FBFA",
                    outlineOffset: "2px",
                  }}
                  onClick={() => enterAs(role, defaultHrefByRole[role])}
                >
                  <Text>{roleStyles[role].label}</Text>
                  <Box
                    w="10px"
                    h="10px"
                    bg={roleStyles[role].accent}
                    borderRadius="50%"
                  />
                </Button>
              ))}
            </Stack>

            <Box mt={8} pt={5} borderTop="1px solid rgba(245, 251, 250, 0.2)">
              <Text color="#BCD1CD" fontSize="xs" fontWeight="700">
                Demo account fallback
              </Text>
              <Stack mt={3} gap={2} color="#E9F2F0" fontSize="sm">
                <Text>student@mock.local</Text>
                <Text>sam@northside.example</Text>
                <Text>coordinator@mock.local</Text>
              </Stack>
            </Box>
          </Box>

          <Box p={{ base: 0, md: 0 }}>
            <Flex
              align={{ base: "flex-start", md: "center" }}
              justify="space-between"
              direction={{ base: "column", md: "row" }}
              gap={3}
              px={{ base: 4, md: 6 }}
              py={5}
              borderBottom="1px solid"
              borderColor="#D9DFDC"
            >
              <Box>
                <Heading
                  as="h2"
                  fontSize={{ base: "22px", md: "26px" }}
                  lineHeight="1.1"
                  fontWeight="800"
                  letterSpacing="0"
                >
                  Run sheet
                </Heading>
                <Text mt={2} color="#64706A" fontSize="sm">
                  Each row opens a prepared frontend state for Sprint 1 review.
                </Text>
              </Box>
              <Link href="/" color="#176E78" fontWeight="700" fontSize="sm">
                Normal entry
              </Link>
            </Flex>

            <Grid
              display={{ base: "none", md: "grid" }}
              templateColumns="56px 1fr 132px 118px 126px"
              px={6}
              py={3}
              color="#64706A"
              fontSize="12px"
              fontWeight="800"
              borderBottom="1px solid"
              borderColor="#D9DFDC"
            >
              <Text>Step</Text>
              <Text>View</Text>
              <Text>Role</Text>
              <Text>Status</Text>
              <Text textAlign="right">Action</Text>
            </Grid>

            <Stack gap={0}>
              {demoRoutes.map((route) => {
                const Icon = route.icon;
                const role = roleStyles[route.role];
                const status = statusStyles[route.status];

                return (
                  <Grid
                    key={`${route.step}-${route.href}-${route.role}`}
                    templateColumns={{
                      base: "1fr",
                      md: "56px 1fr 132px 118px 126px",
                    }}
                    gap={{ base: 3, md: 0 }}
                    alignItems="center"
                    px={{ base: 4, md: 6 }}
                    py={{ base: 4, md: 3 }}
                    borderBottom="1px solid"
                    borderColor="#E3E7E4"
                    _hover={{ bg: "#FAFBF8" }}
                  >
                    <Text color="#64706A" fontWeight="800" fontSize="sm">
                      {route.step}
                    </Text>

                    <HStack align="flex-start" gap={3}>
                      <Box color={role.accent} pt="2px" flex="0 0 auto">
                        <Icon size={18} strokeWidth={1.8} />
                      </Box>
                      <Box>
                        <HStack gap={2} align="center" wrap="wrap">
                          <Text fontWeight="800" color="#18242B">
                            {route.title}
                          </Text>
                          <Text color="#7A8580" fontSize="xs">
                            {route.segment}
                          </Text>
                        </HStack>
                        <Text color="#5A6761" fontSize="sm" mt={1}>
                          {route.description}
                        </Text>
                      </Box>
                    </HStack>

                    <Badge
                      justifySelf={{ base: "flex-start", md: "start" }}
                      borderRadius="4px"
                      px={2}
                      py={1}
                      bg={role.soft}
                      color={role.accent}
                    >
                      {role.label}
                    </Badge>

                    <Badge
                      justifySelf={{ base: "flex-start", md: "start" }}
                      borderRadius="4px"
                      px={2}
                      py={1}
                      bg={status.bg}
                      color={status.fg}
                      border="1px solid"
                      borderColor={status.border}
                    >
                      {route.status}
                    </Badge>

                    <Button
                      justifySelf={{ base: "stretch", md: "end" }}
                      size="sm"
                      bg="#19393C"
                      color="#FFFFFF"
                      borderRadius="4px"
                      _hover={{ bg: "#0F2A2D" }}
                      _focusVisible={{
                        outline: "2px solid #2AA8E0",
                        outlineOffset: "2px",
                      }}
                      onClick={() => enterAs(route.role, route.href)}
                    >
                      Open view
                    </Button>
                  </Grid>
                );
              })}
            </Stack>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
}
