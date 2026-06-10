"use client";

import { ReactNode, Suspense, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Spinner, Box } from "@chakra-ui/react";
import Header from "@/components/Layouts/Header";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Layouts/Sidebar";
import { useProfile } from "@/hooks/useProfile";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import {
  useAccessibleOpportunities,
  useCoordinatorOpportunities,
  useUserMeV2,
} from "@/services/shared";
import type { AccessibleOpportunity } from "@/types/opportunities";
import { useConversationsList } from "@/services/messaging";
import type { UserDetailsV2 } from "@/types/user";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";

function LayoutContent({ children }: { children: ReactNode }) {
  const userType = useAuthStore((s) => s.getUserType()) ?? "";
  const setAccessibleOpportunities = useAuthStore(
    (s) => s.setAccessibleOpportunities
  );
  const setUserDetailsV2 = useAuthStore((s) => s.setUserDetailsV2);

  const isCoordinator = userType === "coordinator";
  const setCoordinatorOpportunities = useAuthStore(
    (s) => s.setCoordinatorOpportunities
  );

  const { data: userDetailsV2Data } = useUserMeV2();
  useProfile(userType);
  const { data: accessibleOpportunities } =
    useAccessibleOpportunities(!isCoordinator);
  const { data: coordinatorOpportunitiesData } =
    useCoordinatorOpportunities(isCoordinator);

  useEffect(() => {
    if (userDetailsV2Data) {
      setUserDetailsV2(userDetailsV2Data as UserDetailsV2);
    }
  }, [userDetailsV2Data, setUserDetailsV2]);

  useEffect(() => {
    if (accessibleOpportunities) {
      setAccessibleOpportunities(accessibleOpportunities);
    }
  }, [accessibleOpportunities, setAccessibleOpportunities]);

  useEffect(() => {
    if (coordinatorOpportunitiesData) {
      setCoordinatorOpportunities(
        coordinatorOpportunitiesData as AccessibleOpportunity[]
      );
    }
  }, [coordinatorOpportunitiesData, setCoordinatorOpportunities]);

  const setUnreadCount = useUIStore((s) => s.setUnreadCount);
  const { data: conversations } = useConversationsList({
    archived: false,
    page_size: 50,
  });

  useEffect(() => {
    if (conversations) {
      const total = conversations.reduce(
        (sum, c) => sum + (c.unreadCount ?? 0),
        0
      );
      setUnreadCount(total);
    }
  }, [conversations, setUnreadCount]);

  const isCollapsed = useUIStore((s) => s.isSidebarCollapsed);

  const pathname = usePathname();
  const isOnboardingPage = pathname?.startsWith("/onboarding") ?? false;

  useNotificationSocket();

  return (
    <ProtectedRoute>
      <div
        style={{
          minHeight: "100vh",
          position: "relative",
          width: "100%",
          backgroundColor: "#FAFAFA",
        }}
      >
        <Header isProtected={true} isOnboardingPage={isOnboardingPage} />

        {/* Fixed sidebar — desktop only */}
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

        {/* Main content — offset by sidebar width */}
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
      </div>
    </ProtectedRoute>
  );
}

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spinner size="xl" />
        </div>
      }
    >
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}
