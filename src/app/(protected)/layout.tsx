"use client";

import { ReactNode } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Container } from "@chakra-ui/react";
import Header from "@/components/Layouts/Header";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
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
        <Container maxW="1512px" px={0} style={{ flex: 1 }}>
          {children}
        </Container>
      </div>
    </ProtectedRoute>
  );
}
