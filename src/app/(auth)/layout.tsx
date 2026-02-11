"use client";

import { Container, useBreakpointValue, Box } from "@chakra-ui/react";
import { ReactNode, Suspense } from "react";
import Footer from "@/components/Layouts/Footer";
import Header from "@/components/Layouts/Header";
import { usePathname } from "next/navigation";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: AuthLayoutProps) {
  const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const pathname = usePathname();
  const isOnboardingPage = pathname?.startsWith("/onboarding") ?? false;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          width: "100%",
        }}
      >
        <Header isOnboardingPage={isOnboardingPage} />

        <Box
          display="flex"
          flex={1}
          w="100%"
          maxW="1440px"
          mx="auto"
          mt={`${isMobile ? "0" : "76px"}`}
          gap={6}
          py={20}
          px={{ base: 4, lg: 14 }}
          h="100%"
        >
          <Container maxW={containerMaxW} px={0} position="relative">
            {children}
          </Container>
        </Box>
        {!isOnboardingPage && <Footer />}
      </div>
    </Suspense>
  );
}
