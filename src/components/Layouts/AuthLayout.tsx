"use client";

import {
  Box,
  Container,
  HStack,
  Text,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { UserRound } from "lucide-react";
import { ReactNode } from "react";
import Logo from "@/components/Logo";
import Footer from "./Footer";
import Header from "./Header";

interface AuthLayoutProps {
  children: ReactNode;
  maxWidth?: string;
}

export default function AuthLayout({
  children,
  maxWidth = "1440px",
}: AuthLayoutProps) {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const containerMaxW = useBreakpointValue({ base: "100%", lg: maxWidth });

  return (
    <Box h="100%" position="relative">
      <Box p={0} h="100%" display="flex" flexDirection="column">
        <Header />
        <Box flex={1} h="100%">
          <Container maxW={containerMaxW} p={0} h="100%">
            {children}
          </Container>
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}
