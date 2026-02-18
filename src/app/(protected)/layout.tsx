"use client";

import { ReactNode, Suspense, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Container, Spinner, Box, useBreakpointValue } from "@chakra-ui/react";
import Header from "@/components/Layouts/Header";
import Footer from "@/components/Layouts/Footer";
import { isInTrialPeriod } from "@/utils/subscriptionPermissions";
import { usePathname, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Layouts/Sidebar";
import { useProfile } from "@/hooks/useProfile";
import { useAuthStore } from "@/store/authStore";
import { useAccessibleOpportunities } from "@/services/shared";

function LayoutContent({ children }: { children: ReactNode }) {
  const userType = useAuthStore((s) => s.getUserType()) ?? "";
  const setAccessibleOpportunities = useAuthStore(
    (s) => s.setAccessibleOpportunities
  );
  useProfile(userType === "coordinator" ? "" : userType);
  const { data: accessibleOpportunities } = useAccessibleOpportunities();

  useEffect(() => {
    if (accessibleOpportunities) {
      setAccessibleOpportunities(accessibleOpportunities);
    }
  }, [accessibleOpportunities, setAccessibleOpportunities]);
  const searchParams = useSearchParams();
  const opportunitySlug = searchParams.get("opp");
  const isMobile = useBreakpointValue({ base: true, lg: false });

  const pathname = usePathname();
  const isOnboardingPage = pathname?.startsWith("/onboarding") ?? false;

  return (
    <ProtectedRoute>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          width: "100%",
          height: "100%",
          backgroundColor: "#FAFAFA",
        }}
      >
        <Header isProtected={true} isOnboardingPage={isOnboardingPage} />
        <Box
          h="100%"
          // h={{ base: "calc(100vh - 58px)", lg: "calc(100vh - 76px)" }}
        >
          <Box
            display="flex"
            flex={1}
            w="100%"
            maxW="1440px"
            mx="auto"
            mt={`${isMobile ? "58px" : "76px"}`}
            gap={6}
            py={{ base: 4, lg: 10 }}
            px={{ base: 4, lg: 14 }}
            h="100%"
            // px={{ base: 4, lg: 6 }}
            // py={{ base: 4, lg: 6 }}
            // mt={{
            //   base: "20px",
            //   lg: opportunitySlug
            //     ? isInTrialPeriod(opportunitySlug)
            //       ? "40px"
            //       : "0px"
            //     : "0px",
            // }}
          >
            <Box
              display={{ base: "none", xl: "block" }}
              flexShrink={0}
              w="300px"
            >
              <Sidebar isProtected={true} />
            </Box>
            <Container
              maxW="100%"
              px={0}
              flex={1}
              style={{ minWidth: 0 }}
              h="100%"
            >
              {children}
            </Container>
          </Box>
        </Box>

        {/* <Footer /> */}
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
