"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Box, Text, Flex, Avatar, Progress, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import {
  useOnboardingPages,
  useStudentProfileV2,
  useUserMeV2,
} from "@/services/shared";
import { StudentCard } from "@/app/(protected)/discover/cards/studentCard";
import { FullProfileCard } from "@/app/(protected)/discover/cards/FullProfileCard";
import { ProfileSectionCard } from "./ProfileSectionCard";
import { ProfileEditDialog } from "./ProfileEditDialog";
import MyOpportunities from "@/components/MyOpportunities";
import { ChangePasswordSection } from "./ChangePasswordSection";
import Loader from "@/components/ui/Loader";
import { Page } from "@/types/onboarding";
import { OnboardingPage, Tab } from "@/types/profile";
import { toast } from "react-toastify";

const normalizePages = (raw: unknown[]): Page[] => {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map((p: any) => ({
    id: p.id,
    title: p.title,
    questions: p.questions ?? [],
  }));
};

export function StudentProfileView() {
  const router = useRouter();
  const {
    getUserProfile,
    getUserProfilePictureUrl,
    setUserProfile,
    setUserProfilePictureUrl,
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState(0);
  const [editDialogPage, setEditDialogPage] = useState<Page | null>(null);

  const { data: userData, isLoading: isUserLoading } = useUserMeV2();
  const {
    data: studentData,
    isLoading: isStudentLoading,
    isError: isStudentError,
    error: studentError,
  } = useStudentProfileV2(true);

  const { data: onboardingData, isLoading: isOnboardingLoading } =
    useOnboardingPages("student");

  const pages = useMemo(() => {
    const op = onboardingData?.onboarding_pages;
    if (!op) return [];
    const studentPages = op.student_onboarding ?? op.user ?? [];
    return normalizePages(studentPages);
  }, [onboardingData?.onboarding_pages]);

  const mergedProfile = useMemo(() => {
    const user = userData as Record<string, unknown> | undefined;
    const student = studentData as Record<string, unknown> | undefined;
    if (!user && !student) return null;
    return {
      ...(student ?? {}),
      ...(user ?? {}),
      profile_picture: user?.profile_picture ?? user?.profile_picture_url,
      profile_picture_url:
        user?.profile_picture_url ??
        user?.profile_picture ??
        student?.profile_picture_url,
    } as Record<string, unknown>;
  }, [userData, studentData]);

  useEffect(() => {
    if (mergedProfile) {
      setUserProfile(mergedProfile as any);
      const picUrl =
        (mergedProfile.profile_picture_url as string) ??
        (mergedProfile.profile_picture as string);
      if (picUrl) setUserProfilePictureUrl(picUrl);
    }
  }, [mergedProfile, setUserProfile, setUserProfilePictureUrl]);

  useEffect(() => {
    if (
      !isStudentLoading &&
      isStudentError &&
      (studentError as any)?.response?.status === 404
    ) {
      router.push("/onboarding/");
    } else if (
      isStudentError &&
      (studentError as any)?.response?.status !== 404
    ) {
      toast.error("Error loading profile");
    }
  }, [isStudentLoading, isStudentError, studentError, router]);

  const university = useMemo(() => {
    const u = (studentData as any)?.university;
    if (!u) return null;
    return {
      slug: u.slug ?? u.code,
      name: u.name,
    };
  }, [studentData]);

  const tabs: Tab[] = useMemo(() => {
    const result: Tab[] = pages.map((p: Page) => ({
      title: (p as OnboardingPage).short_title || p.title || "Section",
      icon: (p as OnboardingPage).title_icon || "far fa-user",
    }));
    result.push({
      title: "My Opportunities",
      icon: "fa-solid fa-folder-closed",
    });
    result.push({ title: "Profile Preview", icon: "fa-solid fa-eye" });
    result.push({ title: "Change Password", icon: "fa-solid fa-key" });
    return result;
  }, [pages]);

  const completionPercentage = useMemo(() => {
    if (!mergedProfile || !pages.length) return 0;
    const EXCLUDED = new Set(["instagram", "bluesky", "linkedin", "homepage"]);
    let total = 0;
    let filled = 0;
    for (const page of pages) {
      for (const q of page.questions) {
        if (["abn_lookup", "display"].includes(q.type)) continue;
        const val = mergedProfile[q.field];
        total++;
        if (val !== undefined && val !== null && val !== "") {
          if (Array.isArray(val)) {
            if (val.length > 0) filled++;
          } else {
            if (!EXCLUDED.has(q.field)) filled++;
          }
        }
      }
    }
    return total > 0 ? Math.round((filled / total) * 100) : 0;
  }, [mergedProfile, pages]);

  const isLoading =
    isUserLoading ||
    isStudentLoading ||
    (isOnboardingLoading && pages.length === 0);

  if (isLoading && !mergedProfile) {
    return (
      <Box maxW="1280px" mx="auto">
        <Loader size="lg" />
      </Box>
    );
  }

  const isProfilePreview = tabs[activeTab]?.title === "Profile Preview";
  const isMyOpportunities = tabs[activeTab]?.title === "My Opportunities";
  const isChangePassword = tabs[activeTab]?.title === "Change Password";
  const isOnboardingTab = activeTab < pages.length;
  const activePage = pages[activeTab];

  return (
    <>
      <Box maxW="1512px" mx="auto" w="100%" overflow="hidden">
        <Flex
          w="100%"
          direction={{ base: "column", md: "row" }}
          gap={{ base: 4, lg: 20 }}
          overflow="hidden"
        >
          {/* Sidebar */}
          <Box
            bg="white"
            borderRadius="22px"
            p={6}
            maxW={{ base: "100%", md: "350px", lg: "444px" }}
            w="100%"
            h="fit-content"
            boxShadow="0px 2.65px 5.3px 1.99px rgba(0, 0, 0, 0.25)"
            background="linear-gradient(180deg, #F87C7C 0%, #FFFFFF 23.56%, #FFFFFF 37.02%, #FFFFFF 69.71%)"
          >
            <Box mb={6}>
              <Flex align="center" gap={6} mb={6}>
                <Avatar.Root
                  w={105}
                  h={105}
                  borderRadius="full"
                  border="4px solid #DC2626"
                >
                  {getUserProfilePictureUrl() && (
                    <Avatar.Image
                      src={getUserProfilePictureUrl() ?? undefined}
                    />
                  )}
                  <Avatar.Fallback
                    name={`${mergedProfile?.first_name} ${mergedProfile?.last_name}`}
                    bg="gray.200"
                    color="gray.800"
                    fontWeight="bold"
                    fontSize="2xl"
                  />
                </Avatar.Root>
                <Box>
                  <Text fontSize="25px" fontWeight="bold" color="#000000">
                    {`${mergedProfile?.first_name ?? ""} ${mergedProfile?.last_name ?? ""}`.trim() ||
                      "Student"}
                  </Text>
                  <Text
                    fontSize="20px"
                    color="#000000"
                    textTransform="capitalize"
                  >
                    Student
                  </Text>
                </Box>
              </Flex>

              <Box>
                <Progress.Root
                  value={completionPercentage}
                  max={100}
                  size="lg"
                  borderRadius="full"
                  mb={2}
                >
                  <Progress.Track borderRadius="full">
                    <Progress.Range
                      borderRadius="full"
                      style={{
                        background:
                          "radial-gradient(50% 50% at 50% 50%, #2CA9DF 0%, #167BB3 58.17%, #002157 100%)",
                      }}
                    />
                  </Progress.Track>
                </Progress.Root>
                <Flex justify="space-between" align="center">
                  <Text fontSize="16px" color="#000000">
                    Profile Completion
                  </Text>
                  <Text fontSize="16px">{completionPercentage}%</Text>
                </Flex>
              </Box>
            </Box>

            <Box display="flex" flexDirection="column" gap={3} pl="20px">
              {tabs.map((tab, index) => (
                <Box
                  key={index}
                  as="button"
                  textAlign="left"
                  onClick={() => setActiveTab(index)}
                  borderLeft={
                    activeTab === index
                      ? "4px solid #DC2626"
                      : "4px solid transparent"
                  }
                  fontWeight="600"
                  w="full"
                  py={5}
                  px={3}
                  bg="transparent"
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                  borderRadius="md"
                >
                  <Flex align="center" gap={3}>
                    <i
                      className={tab.icon}
                      style={{ color: "#000000", fontSize: "18px" }}
                    />
                    <Text fontSize="16px" fontWeight="600" color="#000000">
                      {tab.title}
                    </Text>
                  </Flex>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Main content */}
          <Box
            maxW={{ base: "100%" }}
            w="100%"
            bg="white"
            p={6}
            flex={1}
            overflow="hidden"
          >
            <Text fontSize="25px" fontWeight="bold" mb={6} color="#000000">
              {tabs[activeTab]?.title ?? "Profile"}
            </Text>

            {isProfilePreview && mergedProfile && (
              <VStack gap={10} w="full" align="flex-start">
                <StudentCard
                  student={mergedProfile as any}
                  profilePictureUrl={getUserProfilePictureUrl() ?? null}
                  userType="student"
                  maxW="500px"
                  disableViewFullProfile
                  disableAddToFolder
                />
                <FullProfileCard
                  profileId={String(mergedProfile?.id ?? "")}
                  profileType="student"
                  isModal={false}
                  studentProfile={mergedProfile as any}
                  disableBtns
                />
              </VStack>
            )}

            {isMyOpportunities && <MyOpportunities userType="student" />}

            {isChangePassword && <ChangePasswordSection />}

            {isOnboardingTab && activePage && mergedProfile && (
              <VStack align="stretch" gap={6}>
                <ProfileSectionCard
                  page={activePage}
                  formData={mergedProfile}
                  onEdit={() => setEditDialogPage(activePage)}
                  university={university}
                />
              </VStack>
            )}
          </Box>
        </Flex>
      </Box>

      {editDialogPage && (
        <ProfileEditDialog
          isOpen={!!editDialogPage}
          onClose={() => setEditDialogPage(null)}
          page={editDialogPage}
          initialValues={mergedProfile ?? {}}
          onSuccess={() => setEditDialogPage(null)}
          university={university}
        />
      )}
    </>
  );
}
