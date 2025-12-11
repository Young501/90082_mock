"use client";

import { ReactNode, Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Container, Spinner, Box } from "@chakra-ui/react";
import Header from "@/components/Layouts/Header";
import Footer from "@/components/Layouts/Footer";
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
        <Container
          maxW="1512px"
          px={0}
          style={{ flex: 1 }}
          mt={{
            base: "20px",
            lg: opportunitySlug
              ? isInTrialPeriod(opportunitySlug)
                ? "40px"
                : "0px"
              : "0px",
          }}
        >
          {children}
        </Container>
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
