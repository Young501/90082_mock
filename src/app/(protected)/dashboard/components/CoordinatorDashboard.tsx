"use client";

import React from "react";
import { Box, Text, SimpleGrid, Container } from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import type { DashboardStats } from "@/types/dashboard";
import {
  PROFILE_COLORS,
  PROFILE_TINT_COLORS,
  PROFILE_DARK_COLORS,
} from "@/theme/theme";
import { MetricsColumn } from "./MetricsColumn";

export function CoordinatorDashboard({
  dashboardStats,
  isLoading,
  error,
  opportunitySlug,
}: {
  dashboardStats: DashboardStats | undefined;
  isLoading: boolean;
  error: Error | null;
  opportunitySlug?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const coordinatorOpportunities = useAuthStore((s) => s.coordinatorOpportunities);
  const opportunityTitle = opportunitySlug
    ? coordinatorOpportunities.find((o) => o.slug === opportunitySlug)?.title
    : coordinatorOpportunities[0]?.title;

  const manageRoute = (type: "student" | "organisation") => {
    const opp = opportunitySlug ? `&opp=${opportunitySlug}` : "";
    router.push(`${pathname}manage/?type=${type}${opp}`);
  };

  if (isLoading || error || !dashboardStats) return null;

  const studentColors = {
    primary: PROFILE_COLORS.student,
    tint: PROFILE_TINT_COLORS.student,
    dark: PROFILE_DARK_COLORS.student,
  };

  const orgColors = {
    primary: PROFILE_COLORS.organisation,
    tint: PROFILE_TINT_COLORS.organisation,
    dark: PROFILE_DARK_COLORS.organisation,
  };

  const studentMetrics = [
    {
      label: "Students who accepted invitation:",
      value: dashboardStats.students.accepted,
      total: dashboardStats.students.invited,
    },
    {
      label: "Students contacted by at least one organisation:",
      value: dashboardStats.students.messaged,
      total: dashboardStats.students.invited,
    },
    {
      label: "Students matched to opportunity:",
      value: dashboardStats.students.matched,
      total: dashboardStats.students.invited,
    },
  ];

  const orgMetrics = [
    {
      label: "Organisations who accepted invitation:",
      value: dashboardStats.organisations.accepted,
      total: dashboardStats.organisations.invited,
    },
    {
      label: "Organisations who have contacted at least one student:",
      value: dashboardStats.organisations.messaged,
      total: dashboardStats.organisations.invited,
    },
    {
      label: "Organisations with at least one matched student:",
      value: dashboardStats.organisations.matched,
      total: dashboardStats.organisations.invited,
    },
  ];

  return (
    <Box maxW="1512px" mx="auto">
      <Container maxW="1512px" px={0} display="flex" flexDirection="column" gap={12}>
        <Text as="h1" fontSize={{ base: "32px", lg: "51px" }} fontWeight="600" color="#000000">
          {opportunityTitle ?? "Dashboard"}
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
          <MetricsColumn
            title="Students Metrics"
            iconSrc="/assets/studentmetrics.svg"
            iconAlt="Students Metrics"
            colors={studentColors}
            invitedLabel="Students invited to opportunity:"
            invitedCount={dashboardStats.students.invited}
            metrics={studentMetrics}
            buttonLabel="Manage Students"
            onManage={() => manageRoute("student")}
          />
          <MetricsColumn
            title="Organisation Metrics"
            iconSrc="/assets/organisationmetrics.svg"
            iconAlt="Organisation Metrics"
            colors={orgColors}
            invitedLabel="Organisations invited to opportunity:"
            invitedCount={dashboardStats.organisations.invited}
            metrics={orgMetrics}
            buttonLabel="Manage Organisation"
            onManage={() => manageRoute("organisation")}
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
}
