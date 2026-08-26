"use client";

import React from "react";
import { Box } from "@chakra-ui/react";
import { ProfileOverview } from "./ProfileOverview";
import { MyOpportunities } from "./MyOpportunities";
import { RecentMessages } from "./RecentMessages";
import { TeamMembers } from "./TeamMembers";
import { SmartRecommendations } from "./SmartRecommendations";
import { FloatingTeamMembers } from "./FloatingTeamMembers";
import type { HomepageStats } from "@/types/homepage";

interface HomepageDashboardProps {
  data: HomepageStats;
  teamMembersPlacement?: "inline" | "floating";
}

export function HomepageDashboard({
  data,
  teamMembersPlacement = "inline",
}: HomepageDashboardProps) {
  const {
    profile,
    opportunities,
    recent_messages,
    team_members,
    user_type,
    pending_actions,
    smart_recommendations,
  } = data;
  const showTeamMembers =
    user_type === "organisation" && (team_members?.length ?? 0) > 0;
  const showInlineTeamMembers =
    showTeamMembers && teamMembersPlacement === "inline";
  const showFloatingTeamMembers =
    showTeamMembers && teamMembersPlacement === "floating";
  const showSmartRecommendations = (smart_recommendations?.length ?? 0) > 0;

  return (
    <>
      <Box
        display="grid"
        gridTemplateColumns={{ base: "1fr", md: "260px 1fr", lg: "294px 1fr" }}
        gap={6}
        w="100%"
      >
        <Box minW={0} display="flex" flexDirection="column" gap={6}>
          <ProfileOverview
            profile={profile}
            userType={user_type}
            pendingActions={pending_actions}
          />
          {showInlineTeamMembers && <TeamMembers members={team_members} />}
        </Box>

        <Box minW={0} display="flex" flexDirection="column" gap={6}>
          {showSmartRecommendations && (
            <SmartRecommendations
              recommendations={smart_recommendations}
              userType={user_type}
            />
          )}
          <MyOpportunities
            opportunities={opportunities}
            userType={user_type}
            maxH="551px"
          />
          <RecentMessages messages={recent_messages} userType={user_type} />
        </Box>
      </Box>
      {showFloatingTeamMembers && (
        <FloatingTeamMembers members={team_members} />
      )}
    </>
  );
}
