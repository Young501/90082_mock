"use client";

import React from "react";
import { Box } from "@chakra-ui/react";
import { ProfileOverview } from "./ProfileOverview";
import { MyOpportunities } from "./MyOpportunities";
import { RecentMessages } from "./RecentMessages";
import { TeamMembers } from "./TeamMembers";
import type { HomepageStats } from "@/types/homepage";

interface HomepageDashboardProps {
  data: HomepageStats;
}

export function HomepageDashboard({ data }: HomepageDashboardProps) {
  const { profile, opportunities, recent_messages, team_members, user_type } =
    data;

  return (
    <Box
      display="grid"
      gridTemplateColumns={{ base: "1fr", md: "260px 1fr", lg: "294px 1fr" }}
      gap={6}
      w="100%"
    >
      <Box
        minW={0}
        h="100%"
        display="flex"
        flexDirection="column"
      >
        <ProfileOverview profile={profile} userType={user_type} />
      </Box>

      <Box
        minW={0}
        display="flex"
        flexDirection="column"
        gap={6}
      >
        <MyOpportunities
          opportunities={opportunities}
          userType={user_type}
          maxH="551px"
        />
        <RecentMessages messages={recent_messages} userType={user_type} />
      </Box>
    </Box>
  );
}
