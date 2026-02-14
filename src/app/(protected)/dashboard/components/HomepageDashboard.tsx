"use client";

import React from "react";
import { Box, Container, Text, SimpleGrid, HStack } from "@chakra-ui/react";
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
    <>
      <Box
        display="flex"
        flexDirection={{ base: "column", md: "row" }}
        gap={6}
        w="100%"
      >
        <Box
          w="100%"
          maxW={{ base: "100%", md: "260px", lg: "294px" }}
          flexShrink={0}
          maxH="551px"
        >
          <ProfileOverview profile={profile} userType={user_type} />
        </Box>
        <Box w="100%" maxH="551px">
          <MyOpportunities
            opportunities={opportunities}
            userType={user_type}
            height="551px"
          />
        </Box>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} width="100%">
        <RecentMessages messages={recent_messages} />
        <TeamMembers members={team_members} />
      </SimpleGrid>
    </>
  );
}
