"use client";

import { ReactNode, Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Container, Spinner, Box, useBreakpointValue } from "@chakra-ui/react";
import Header from "@/components/Layouts/Header";
import Footer from "@/components/Layouts/Footer";
import { isInTrialPeriod } from "@/utils/subscriptionPermissions";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Layouts/Sidebar";

function LayoutContent({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const opportunitySlug = searchParams.get("opp");
  const isMobile = useBreakpointValue({ base: true, lg: false });
  return (
    <ProtectedRoute>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          width: "100%",
        }}
      >
        <Header isProtected={true} />
        <Box
          bg="#FAFAFA"
          h={{ base: "calc(100vh - 58px)", lg: "calc(100vh - 76px)" }}
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
              display={{ base: "none", lg: "block" }}
              flexShrink={0}
              w="300px"
            >
              <Sidebar isProtected={true} />
            </Box>
            <Container maxW="100%" px={0} flex={1} style={{ minWidth: 0 }}>
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
