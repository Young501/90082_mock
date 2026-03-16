"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useAuthStore } from "@/store";
import { useOnboardingPages } from "@/services/shared";
import { Box, Text, Flex, VStack, Tabs } from "@chakra-ui/react";
import { AbnValidationStatus, Question } from "@/types/onboarding";
import { OnboardingPage, Tab } from "@/types/profile";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/auth";
import Loader from "@/components/ui/Loader";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import MyOpportunities from "@/components/MyOpportunities";
import { ProfileSummaryCard } from "@/app/(protected)/profile/components/ProfileSummaryCard";
import { ProfileSectionCard } from "@/app/(protected)/profile/components/ProfileSectionCard";
import { ProfileEditDialog } from "@/app/(protected)/profile/components/ProfileEditDialog";
import { DocumentsAndLinksSection } from "@/app/(protected)/profile/components/DocumentsAndLinksSection";
import { ChangePasswordSection } from "@/app/(protected)/profile/components/ChangePasswordSection";
import { toProfileDisplayString } from "@/utils/profileDisplay";

type PageItem = { id: number; title: string; questions: Question[] };

const Profile = () => {
  const { user, getUserProfile, getUserProfilePictureUrl } = useAuthStore();
  const userProfile = getUserProfile();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [editingPage, setEditingPage] = useState<{
    id: number;
    title: string;
    questions: OnboardingPage["questions"];
  } | null>(null);

  const userType: string = useAuthStore((s) => s.getUserType()) ?? "";
  const isCoordinator = userType === "coordinator";
  const isOrganisation = userType === "organisation";
  // const isOrgMember = useAuthStore((s) =>
  //   s.getIsOrganisationMemberOnboarding()
  // );

  const {
    userProfile: fetchedUserProfile,
    isLoading: isProfileLoading,
    handleOnboardingRedirect,
    university,
    platformRole,
  } = useProfile(isCoordinator ? "" : userType);

  const { data: onboardingData, isLoading: isOnboardingLoading } =
    useOnboardingPages(userType);

  // ── Student pages ──────────────────────────────────────────────────────────
  const studentPages = useMemo(() => {
    if (userType !== "student") return [];
    const op = onboardingData?.onboarding_pages;
    if (!op) return [];
    return (op.student_onboarding ?? op.user ?? []).map((p: any) => ({
      id: p.id,
      title: p.title,
      questions: (p.questions ?? []) as Question[],
    }));
  }, [onboardingData?.onboarding_pages, userType]);

  // ── Organisation pages (split by section) ─────────────────────────────────
  const orgMemberPages = useMemo(() => {
    if (!isOrganisation) return [];
    const op = onboardingData?.onboarding_pages;
    if (!op) return [];
    return (op.organisation_member_onboarding ?? op.user ?? []).map(
      (p: OnboardingPage) => ({
        id: p.id,
        title: p.title,
        questions: (p.questions ?? []) as Question[],
      })
    );
  }, [onboardingData?.onboarding_pages, isOrganisation]);

  const orgProfilePages = useMemo(() => {
    if (!isOrganisation) return [];
    const op = onboardingData?.onboarding_pages;
    if (!op) return [];
    return (op.organisation_onboarding ?? op.organisation ?? []).map(
      (p: OnboardingPage) => ({
        id: p.id,
        title: p.title,
        questions: (p.questions ?? []) as Question[],
      })
    );
  }, [onboardingData?.onboarding_pages, isOrganisation]);

  const isDocumentsPage = (p: { questions: Question[] }) =>
    p.questions?.some((q) =>
      ["resume", "homepage", "linkedin", "instagram", "bluesky"].includes(
        q.field
      )
    );

  const infoPages = useMemo(
    () => (studentPages as PageItem[]).filter((p) => !isDocumentsPage(p)),
    [studentPages]
  );

  const documentsPage = useMemo(
    () => (studentPages as PageItem[]).find((p) => isDocumentsPage(p)) ?? null,
    [studentPages]
  );

  const tabs: Tab[] = useMemo(() => {
    const allTabs: Tab[] = [];

    if (!isCoordinator) {
      allTabs.push({ title: "My Information", icon: "fa-solid fa-user" });

      if (isOrganisation) {
        // if (platformRole !== "member") {
        allTabs.push({
          title: "Organisation Profile",
          icon: "fa-solid fa-building",
        });
        // }
        allTabs.push({
          title: "My Opportunities",
          icon: "fa-solid fa-folder-closed",
        });
      } else {
        allTabs.push({
          title: "My Opportunities",
          icon: "fa-solid fa-folder-closed",
        });
        allTabs.push({
          title: "Documents & Links",
          icon: "fa-solid fa-file-lines",
        });
      }
    }

    allTabs.push({
      title: "Security Settings",
      icon: "fa-solid fa-key",
    });

    return allTabs;
  }, [isCoordinator, isOrganisation]);

  const displayFormData = useMemo(() => {
    const p = (fetchedUserProfile ?? userProfile) as Record<
      string,
      unknown
    > | null;
    if (!p) return {};
    return { ...p };
  }, [fetchedUserProfile, userProfile]);

  const profileSummaryDisplay = useMemo(() => {
    const p = (fetchedUserProfile ?? userProfile) as Record<
      string,
      unknown
    > | null;
    if (!p) return {};
    return {
      userId: toProfileDisplayString(p.id),
      email: toProfileDisplayString(p.email),
      university: toProfileDisplayString(p.university),
      course: toProfileDisplayString(p.course_stream),
      yearOfStudy: toProfileDisplayString(p.progression),
    };
  }, [fetchedUserProfile, userProfile]);

  const fullName = useMemo(() => {
    const name =
      user?.userDetailsV2?.first_name + " " + user?.userDetailsV2?.last_name;
    if (name.trim()) return name.trim();
  }, [user]);

  const previewProfileId = useMemo(() => {
    if (isCoordinator) return undefined;
    const profile = (fetchedUserProfile ?? userProfile) as { id?: number; organisation?: { id?: number } } | null;
    if (isOrganisation && profile?.organisation?.id != null) {
      return String(profile.organisation.id);
    }
    if (userType === "student") {
      return user?.id ?? user?.userDetailsV2?.id?.toString();
    }
    return undefined;
  }, [isCoordinator, isOrganisation, userType, fetchedUserProfile, userProfile, user]);

  useEffect(() => {
    if (!isProfileLoading && !fetchedUserProfile && !isCoordinator) {
      handleOnboardingRedirect(false);
    }
  }, [
    isProfileLoading,
    fetchedUserProfile,
    userType,
    isCoordinator,
    handleOnboardingRedirect,
  ]);

  const shouldShowLoading =
    (isOnboardingLoading || isProfileLoading) && !isCoordinator;
  const hasCompletedOnboarding =
    (userProfile || fetchedUserProfile) &&
    (!studentPages.length || isOrganisation);

  if (shouldShowLoading && !hasCompletedOnboarding) {
    return (
      <Box maxW="1280px" mx="auto">
        <Loader size="lg" />
      </Box>
    );
  }

  return (
    <>
      <PageTitle title={PAGE_TITLES.PROFILE} />
      <Box maxW="1512px" mx="auto" w="100%" overflow="hidden">
        <VStack align="stretch" gap={5}>
          {!isCoordinator && (
            <ProfileSummaryCard
              profilePictureUrl={getUserProfilePictureUrl() ?? undefined}
              fullName={fullName || "—"}
              userId={profileSummaryDisplay.userId}
              email={profileSummaryDisplay.email}
              university={profileSummaryDisplay.university}
              course={profileSummaryDisplay.course}
              yearOfStudy={profileSummaryDisplay.yearOfStudy}
              userType={userType}
              profileId={previewProfileId}
            />
          )}

          <Box
            w="100%"
            bg="white"
            borderRadius="12px"
            border="1px solid"
            borderColor="#E4E4E7"
            overflow="hidden"
            p={{ base: 4, md: 5 }}
          >
            <Tabs.Root
              value={String(activeTab)}
              onValueChange={(details) => setActiveTab(Number(details.value))}
              variant="plain"
            >
              <Tabs.List
                p={4}
                w="100%"
                flexWrap="wrap"
                gap={2}
                justifyContent={{ base: "center", md: "space-between" }}
                border="1px solid"
                borderColor="#E4E4E7"
                borderRadius="12px"
              >
                {tabs.map((tab, index) => (
                  <Tabs.Trigger
                    key={tab.title}
                    value={String(index)}
                    bg={
                      activeTab === index
                        ? userType === "organisation"
                          ? "#E9F7F6"
                          : "#EAF6FD"
                        : "transparent"
                    }
                    color={
                      activeTab === index
                        ? userType === "organisation"
                          ? "#3AADA8"
                          : "#1679AB"
                        : "#27272A"
                    }
                    h="36px"
                    borderRadius="xl"
                    fontSize="sm"
                    fontWeight="500"
                    textDecoration="none"
                    borderBottom="none"
                    border={
                      activeTab === index
                        ? "1px solid " +
                          (userType === "organisation" ? "#D3EFEA" : "#D6EDFB")
                        : "none"
                    }
                  >
                    {tab.title}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              <Box mt={6}>
                {tabs[activeTab]?.title === "My Information" && (
                  <VStack align="stretch" gap={6}>
                    {(isOrganisation ? orgMemberPages : infoPages).map(
                      (page: PageItem) => (
                        <ProfileSectionCard
                          key={page.id}
                          page={{
                            id: page.id,
                            title: page.title,
                            questions: page.questions,
                          }}
                          formData={displayFormData}
                          onEdit={() =>
                            setEditingPage({
                              id: page.id,
                              title: page.title,
                              questions: page.questions,
                            })
                          }
                          university={
                            userType === "student"
                              ? (university ?? undefined)
                              : undefined
                          }
                        />
                      )
                    )}
                    {(isOrganisation ? orgMemberPages : infoPages).length ===
                      0 && (
                      <Text color="#71717A" fontSize="sm">
                        No information to display yet.
                      </Text>
                    )}
                  </VStack>
                )}

                {tabs[activeTab]?.title === "Organisation Profile" && (
                  <VStack align="stretch" gap={6}>
                    {(orgProfilePages as PageItem[]).map((page) => (
                      <ProfileSectionCard
                        key={page.id}
                        page={{
                          id: page.id,
                          title: page.title,
                          questions: page.questions,
                        }}
                        disabled={platformRole === "member"}
                        formData={displayFormData}
                        onEdit={() =>
                          setEditingPage({
                            id: page.id,
                            title: page.title,
                            questions: page.questions,
                          })
                        }
                      />
                    ))}
                    {orgProfilePages.length === 0 && (
                      <Text color="#71717A" fontSize="sm">
                        No organisation profile to display yet.
                      </Text>
                    )}
                  </VStack>
                )}

                {tabs[activeTab]?.title === "My Opportunities" && (
                  <MyOpportunities userType={userType} />
                )}

                {tabs[activeTab]?.title === "Documents & Links" && (
                  <DocumentsAndLinksSection
                    profile={displayFormData}
                    onEdit={
                      documentsPage
                        ? () =>
                            setEditingPage({
                              id: documentsPage.id,
                              title: documentsPage.title,
                              questions: documentsPage.questions ?? [],
                            })
                        : undefined
                    }
                  />
                )}

                {tabs[activeTab]?.title === "Security Settings" && (
                  <ChangePasswordSection userType={userType} />
                )}
              </Box>
            </Tabs.Root>
          </Box>
        </VStack>
      </Box>

      {editingPage && (
        <ProfileEditDialog
          isOpen={!!editingPage}
          onClose={() => setEditingPage(null)}
          page={editingPage}
          initialValues={displayFormData}
          university={
            userType === "student" ? (university ?? undefined) : undefined
          }
          onSuccess={() => setEditingPage(null)}
        />
      )}
    </>
  );
};

export default Profile;
