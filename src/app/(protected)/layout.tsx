"use client";

import { ReactNode, Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Container, Spinner, Box } from "@chakra-ui/react";
import Header from "@/components/Layouts/Header";
import Footer from "@/components/Layouts/Footer";
import Sidebar from "@/components/Layouts/Sidebar";
import { isInTrialPeriod } from "@/utils/subscriptionPermissions";
import { useSearchParams } from "next/navigation";

function LayoutContent({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const opportunitySlug = searchParams.get("opp");
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
          display="flex"
          flex={1}
          w="100%"
          maxW="1512px"
          mx="auto"
          alignSelf="stretch"
          gap={6}
          px={{ base: 4, lg: 6 }}
          py={{ base: 4, lg: 6 }}
          mt={{
            base: "20px",
            lg: opportunitySlug
              ? isInTrialPeriod(opportunitySlug)
                ? "40px"
                : "0px"
              : "0px",
          }}
        >
          {/* <Box
            display={{ base: "none", md: "block" }}
            flexShrink={0}
            w="280px"
            alignSelf="stretch"
          >
            <Sidebar isProtected={true} />
          </Box> */}
          <Container maxW="100%" px={0} flex={1} style={{ minWidth: 0 }}>
            {children}
          </Container>
        </Box>
        <Footer />
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
