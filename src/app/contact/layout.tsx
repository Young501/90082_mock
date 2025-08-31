"use client";

import { Box, Container, useBreakpointValue } from "@chakra-ui/react";
import { ReactNode, Suspense } from "react";
import Footer from "@/components/Layouts/Footer";
import Header from "@/components/Layouts/Header";
import { useAuthStore } from "@/store";

interface ContactLayoutProps {
  children: ReactNode;
}

export default function ContactLayout({ children }: ContactLayoutProps) {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });
  const isProtected = useAuthStore((state) => state.isAuthenticated);

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
        <Header isProtected={isProtected} />

        <Box
          flex="1"
          display="flex"
          flexDirection="column"
          mt={{ base: "80px", lg: "126px" }}
          minH="calc(100vh - 305px)"
          overflow="auto"
          overflowX="hidden"
          justifyContent="center"
          pt="0"
          pb="0"
          px={{ base: "16px", md: "48px", lg: "130px" }}
        >
          <Container maxW={containerMaxW} px={0} position="relative">
            {children}
          </Container>
        </Box>
        {!isMobile && <Footer />}
      </div>
    </Suspense>
  );
}
