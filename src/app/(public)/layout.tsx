"use client";

import { Box, Container, useBreakpointValue } from "@chakra-ui/react";
import { ReactNode, Suspense } from "react";
import Footer from "@/components/Layouts/Footer";
import Header from "@/components/Layouts/Header";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: AuthLayoutProps) {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });

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
        <Header />

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
        <Footer />
      </div>
    </Suspense>
  );
}
