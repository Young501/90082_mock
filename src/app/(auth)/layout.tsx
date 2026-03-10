"use client";

import { Container, useBreakpointValue, Box } from "@chakra-ui/react";
import { ReactNode, Suspense } from "react";
import Footer from "@/components/Layouts/Footer";
import Header from "@/components/Layouts/Header";
import { usePathname, useSearchParams } from "next/navigation";

interface AuthLayoutProps {
  children: ReactNode;
}

function AuthLayoutContent({ children }: AuthLayoutProps) {
  const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOnboardingPage = pathname?.startsWith("/onboarding") ?? false;
  const isOnboardingOrganisationMatchPage =
    pathname?.includes("/onboarding/organisation-match") ?? false;
  const isInvitePage = pathname?.startsWith("/invite") ?? false;
  const allowedbgwaves = pathname
    ? [
        "/login",
        "/signup",
        "/user-type",
        "/onboarding/organisation-match",
        "/invite",
      ].some((path) => pathname.startsWith(path))
    : false;

  const isOrganisationSignupPage =
    searchParams?.get("user-type") === "organisation" ||
    isOnboardingOrganisationMatchPage ||
    isInvitePage;

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
      <Header isOnboardingPage={isOnboardingPage} />

      <Box
        display="flex"
        flex={1}
        w="100%"
        mt={`${isMobile ? "0" : "76px"}`}
        gap={6}
        py={20}
        px={{ base: 4, lg: 14 }}
        h="100%"
        bg={
          allowedbgwaves
            ? !isOrganisationSignupPage
              ? "#0A425F"
              : "#0F4F4D"
            : "transparent"
        }
        backgroundImage={
          allowedbgwaves ? "url('/assets/Backgroundwaves.svg')" : "transparent"
        }
        backgroundSize="auto"
        // backgroundPosition="center"
        backgroundRepeat={allowedbgwaves ? "repeat" : "no-repeat"}
      >
        <Container maxW="1440px" mx="auto" px={0} position="relative">
          {children}
        </Container>
      </Box>
      {!isOnboardingPage && (
        <Footer isOrganisationSignupPage={isOrganisationSignupPage} />
      )}
    </div>
  );
}

export default function Layout({ children }: AuthLayoutProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthLayoutContent>{children}</AuthLayoutContent>
    </Suspense>
  );
}
