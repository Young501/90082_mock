"use client";

import { Box, Container, useBreakpointValue } from "@chakra-ui/react";
import { ReactNode } from "react";
import Footer from "@/components/Layouts/Footer";
import Header from "@/components/Layouts/Header";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: AuthLayoutProps) {
  const isMobile = useBreakpointValue({ base: true, lg: false });
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

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginTop: "126px",
          minHeight: "calc(100vh - 305px)",
          overflow: "auto",
          padding: "0 169px 0 138px",
          width: "100%",
        }}
      >
        <Container maxW={containerMaxW} px={0} w="100%" style={{ flex: 1 }}>
          {children}
        </Container>
      </div>

      <Footer />
    </div>
  );
}
