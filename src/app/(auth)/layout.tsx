"use client";

import { Container, useBreakpointValue, Box } from "@chakra-ui/react";
import { ReactNode } from "react";
import Footer from "@/components/Layouts/Footer";
import Header from "@/components/Layouts/Header";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: AuthLayoutProps) {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });

  return (
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
        flex="1"
        display="flex"
        flexDirection="column"
        mt="126px"
        minH="calc(100vh - 305px)"
        overflow="auto"
        pt="0"
        pb="0"
        px={{ base: "16px", md: "48px", lg: "138px" }}
      >
        <Container maxW={containerMaxW} px={0} style={{ flex: 1 }}>
          {children}
        </Container>
      </Box>
      {/* TO DO: Mobile footer missing */}
      {!isMobile && <Footer />}
    </div>
  );
}
