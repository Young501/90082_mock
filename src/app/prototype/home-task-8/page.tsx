"use client";

import { Suspense, type ReactNode, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Button, Container, HStack, Text } from "@chakra-ui/react";
import { Building2, GraduationCap } from "lucide-react";
import { PageTitle } from "@/components/PageTitle";
import { HomepageDashboard } from "@/app/(protected)/dashboard/components/HomepageDashboard";
import type { HomepageStats, HomepageOpportunity } from "@/types/homepage";
import {
  mockConversations,
  mockOpportunities,
  mockOrganisation,
  mockOrganisationMember,
  mockOrganisationMembers,
  mockStudentProfile,
  mockUniversity,
  mockUserDetailsByType,
  mockUsersByType,
  setActiveUserType,
} from "@/mocks/mockData";
import Header from "@/components/Layouts/Header";
import Sidebar from "@/components/Layouts/Sidebar";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import type { UserProfile } from "@/types/shared";

type ViewKey = "student" | "organisation";

const homepageOpportunities = mockOpportunities.map((opportunity) => ({
  ...opportunity,
  visibility: opportunity.visibility_display === "Public" ? 1 : 2,
})) as HomepageOpportunity[];

const task8StudentData: HomepageStats = {
  user_type: "student",
  profile: {
    logo_url: mockUniversity.logo_url,
    name: "Mia Chen",
    profile_picture_url: null,
    course_name: "Master of Teaching",
    course_progression: "PG Year 2",
    skills: ["Lesson planning", "Tutoring", "Data analysis"],
    completion_items: [
      { key: "profile", label: "Profile", completed: true },
      { key: "resume", label: "Resume", completed: true },
      {
        key: "availability",
        label: "Availability preferences",
        completed: false,
      },
    ],
  },
  opportunities: homepageOpportunities,
  recent_messages: mockConversations,
  pending_actions: [
    {
      id: "student-match-confirm",
      title: "Confirm a match request",
      description:
        "Northside Learning Collective has sent a match request for MTSI 2027.",
      action_label: "Review",
      href: "/prototype/opportunity-match-task-4/?case=confirm",
      category: "match",
      priority: "high",
      meta: "MTSI 2027 Teaching Placement",
    },
    {
      id: "student-admin-unread",
      title: "Read an admin notice",
      description:
        "UniConnected Admin posted an unread reminder in your placement chat.",
      action_label: "Open",
      href: "/prototype/messaging-task-3/?case=admin",
      category: "message",
      priority: "medium",
      meta: "1 unread admin message",
    },
    {
      id: "student-profile",
      title: "Update availability",
      description:
        "Add your teaching days so recommendations can prioritise suitable organisations.",
      action_label: "Update",
      href: "/profile/",
      category: "profile",
      priority: "low",
    },
  ],
  smart_recommendations: [
    {
      id: "student-rec-org",
      title: "Northside Learning Collective",
      description:
        "A strong placement fit for mathematics and science teaching support.",
      reason:
        "Recommended from course area, location, availability, and recent conversation activity.",
      action_label: "View",
      href: "/prototype/opportunity-match-task-4/",
      kind: "match",
      score: "92% Match",
    },
    {
      id: "student-rec-opportunity",
      title: "Entrepreneurship Internship Opportunity",
      description:
        "Good secondary option if you want classroom-adjacent project work.",
      reason:
        "Recommended because you listed data analysis and tutoring in your profile.",
      action_label: "Explore",
      href: "/discover/?opp=eio",
      kind: "opportunity",
      score: "New",
    },
  ],
};

const task8OrganisationData: HomepageStats = {
  user_type: "organisation",
  profile: {
    logo_url: mockOrganisation.logo_url ?? null,
    organisation_name: mockOrganisation.name,
    abn: mockOrganisation.abn_acn,
    completion_items: [
      { key: "profile", label: "Organisation profile", completed: true },
      { key: "team", label: "Team", completed: true },
      { key: "opportunity", label: "Opportunity access", completed: true },
    ],
  },
  opportunities: homepageOpportunities,
  recent_messages: mockConversations,
  team_members: mockOrganisationMembers.map((member) => ({
    id: member.id,
    full_name: member.full_name ?? "",
    email: member.email ?? "",
    role: member.platform_role,
    job_title: member.job_title,
    profile_picture_url: member.profile_picture_url,
    member_since: member.member_since,
  })),
  pending_actions: [
    {
      id: "org-match-confirm",
      title: "Respond to Mia Chen",
      description:
        "A student has self-reported a match and is waiting for your confirmation.",
      action_label: "Confirm",
      href: "/prototype/opportunity-match-task-4/?case=confirm",
      category: "match",
      priority: "high",
      meta: "MTSI 2027 Teaching Placement",
    },
    {
      id: "org-admin-unread",
      title: "Unread admin message",
      description:
        "UniConnected Admin sent a placement process reminder to your group chat.",
      action_label: "Open",
      href: "/prototype/messaging-task-3/?case=admin",
      category: "message",
      priority: "medium",
      meta: "1 unread admin message",
    },
    {
      id: "org-team",
      title: "Check team access",
      description:
        "Review which colleagues can manage messages and opportunity matches.",
      action_label: "View team",
      href: "/team/",
      category: "team",
      priority: "low",
    },
  ],
  smart_recommendations: [
    {
      id: "org-rec-student-mia",
      title: "Mia Chen",
      description:
        "Master of Teaching student available Monday and Thursday next term.",
      reason:
        "Recommended from subject fit, distance, availability, and active placement conversation.",
      action_label: "View",
      href: "/discover/?opp=mtsi-2027",
      kind: "profile",
      score: "94% Match",
    },
    {
      id: "org-rec-student-riley",
      title: "Riley Morgan",
      description: "STEM workshop support candidate with Friday availability.",
      reason:
        "Recommended because your team shortlisted similar profiles this week.",
      action_label: "View",
      href: "/discover/?opp=mtsi-2027",
      kind: "profile",
      score: "88% Match",
    },
  ],
};

function getView(searchValue: string | null): ViewKey {
  return searchValue === "organisation" ? "organisation" : "student";
}

function profileForView(view: ViewKey): UserProfile {
  if (view === "student") return mockStudentProfile as UserProfile;

  return {
    ...mockOrganisationMember,
    organisation: mockOrganisation,
  } as UserProfile;
}

function Task8ViewSwitch({
  view,
  onSelect,
}: {
  view: ViewKey;
  onSelect: (view: ViewKey) => void;
}) {
  return (
    <HStack
      gap={1}
      display={{ base: "none", md: "flex" }}
      bg="#F4F4F5"
      border="1px solid #E4E4E7"
      borderRadius="lg"
      p={1}
    >
      <Button
        h="34px"
        px={3}
        borderRadius="md"
        bg={view === "student" ? "#18393C" : "transparent"}
        color={view === "student" ? "white" : "#52525B"}
        _hover={{ bg: view === "student" ? "#10272A" : "white" }}
        onClick={() => onSelect("student")}
      >
        <HStack gap={2}>
          <GraduationCap size={15} />
          <Text>Student home</Text>
        </HStack>
      </Button>
      <Button
        h="34px"
        px={3}
        borderRadius="md"
        bg={view === "organisation" ? "#18393C" : "transparent"}
        color={view === "organisation" ? "white" : "#52525B"}
        _hover={{ bg: view === "organisation" ? "#10272A" : "white" }}
        onClick={() => onSelect("organisation")}
      >
        <HStack gap={2}>
          <Building2 size={15} />
          <Text>Organisation home</Text>
        </HStack>
      </Button>
    </HStack>
  );
}

function Task8PrototypeShell({
  children,
  view,
  onSelectView,
}: {
  children: ReactNode;
  view: ViewKey;
  onSelectView: (view: ViewKey) => void;
}) {
  const isCollapsed = useUIStore((state) => state.isSidebarCollapsed);

  return (
    <Box minH="100vh" bg="#FAFAFA" position="relative" w="100%">
      <Header isProtected={true} />
      <Box
        position="fixed"
        top={{ base: "12px", lg: "20px" }}
        right={{ base: "88px", lg: "168px" }}
        zIndex={5001}
      >
        <Task8ViewSwitch view={view} onSelect={onSelectView} />
      </Box>

      <Box
        display={{ base: "none", lg: "block" }}
        position="fixed"
        top={{ base: "58px", lg: "76px" }}
        left={0}
        bottom={0}
        w={isCollapsed ? "0px" : "300px"}
        overflowX="hidden"
        borderRight={isCollapsed ? "none" : "1px solid"}
        borderColor="gray.200"
        bg="white"
        zIndex={4999}
        transition="width 0.3s ease"
      >
        <Box minW="300px" h="100%">
          <Sidebar isProtected={true} />
        </Box>
      </Box>

      <Box
        ml={{ base: 0, lg: isCollapsed ? 0 : "300px" }}
        mt={{ base: "58px", lg: "76px" }}
        py={{ base: 4, lg: 10 }}
        px={{ base: 4, lg: 14 }}
        transition="margin-left 0.3s ease"
        minH="100vh"
      >
        {children}
      </Box>
    </Box>
  );
}

function HomeTask8Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = getView(searchParams.get("view"));
  const data =
    view === "organisation" ? task8OrganisationData : task8StudentData;
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const setUserDetailsV2 = useAuthStore((state) => state.setUserDetailsV2);
  const setUserProfile = useAuthStore((state) => state.setUserProfile);
  const setAccessibleOpportunities = useAuthStore(
    (state) => state.setAccessibleOpportunities
  );
  const setCoordinatorOpportunities = useAuthStore(
    (state) => state.setCoordinatorOpportunities
  );
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);
  const setUnreadCount = useUIStore((state) => state.setUnreadCount);

  useEffect(() => {
    setActiveUserType(view);
    setAuthData(`mock-token-${view}`, mockUsersByType[view]);
    setUserDetailsV2(mockUserDetailsByType[view]);
    setUserProfile(profileForView(view));
    setAccessibleOpportunities(mockOpportunities);
    setCoordinatorOpportunities(mockOpportunities);
    setIsAuthenticated(true);
    setUnreadCount(2);
  }, [
    setAccessibleOpportunities,
    setAuthData,
    setCoordinatorOpportunities,
    setIsAuthenticated,
    setUnreadCount,
    setUserDetailsV2,
    setUserProfile,
    view,
  ]);

  function selectView(nextView: ViewKey) {
    router.push(`/prototype/home-task-8/?view=${nextView}`, { scroll: false });
  }

  return (
    <Task8PrototypeShell view={view} onSelectView={selectView}>
      <Box color="#18181B">
        <PageTitle title="Task 8 Home Page Improvements Prototype" />
        <Container maxW="1512px" px={0} py={0}>
          <HomepageDashboard data={data} teamMembersPlacement="floating" />
        </Container>
      </Box>
    </Task8PrototypeShell>
  );
}

export default function HomeTask8Page() {
  return (
    <Suspense fallback={null}>
      <HomeTask8Content />
    </Suspense>
  );
}
