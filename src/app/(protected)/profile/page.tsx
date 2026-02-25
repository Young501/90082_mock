"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useAuthStore } from "@/store";
import {
  useOnboardingPages,
  useProfileUpdate,
  useProfilePictureUpload,
  useProfilePictureDelete,
  useResumeUpload,
  useLogoUpload,
  useLogoDelete,
} from "@/services/shared";
import { Box, Text, Button, Flex, VStack, Alert, Tabs } from "@chakra-ui/react";
import { StudentCard } from "../discover/cards/studentCard";
import { OrganisationCard } from "../discover/cards";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  createPageSchema,
  changePasswordSchema,
} from "@/utils/validationSchemas";
import { FieldRenderer } from "../../(auth)/onboarding/FieldRenderer";
import { AbnValidationStatus, Question } from "@/types/onboarding";
import Image from "next/image";
import { OnboardingPage, OnboardingData, Tab } from "@/types/profile";

import { UserProfile } from "@/types/shared";

import { toast } from "react-toastify";
import { useProfile } from "@/hooks/useProfile";
import { FullProfileCard } from "../discover/cards/FullProfileCard";
import { useAuth } from "@/hooks/auth";
import { InputField } from "@/components/ui";
import Loader from "@/components/ui/Loader";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { OrganisationProfile } from "@/types/discovery";
import MyOpportunities from "@/components/MyOpportunities";
import { ProfileSummaryCard } from "@/app/(protected)/profile/components/ProfileSummaryCard";
import { ProfileSectionCard } from "@/app/(protected)/profile/components/ProfileSectionCard";
import { ProfileEditDialog } from "@/app/(protected)/profile/components/ProfileEditDialog";
import { DocumentsAndLinksSection } from "@/app/(protected)/profile/components/DocumentsAndLinksSection";
import { ChangePasswordSection } from "@/app/(protected)/profile/components/ChangePasswordSection";
import { toProfileDisplayString } from "@/utils/profileDisplay";

const Profile = () => {
  const {
    user,
    getUserProfile,
    setUserProfile,
    getUserProfilePictureUrl,
    getLogoUrl,
    setLogoUrl,
    setUserProfilePictureUrl,
  } = useAuthStore();
  const userProfile: UserProfile | null = getUserProfile();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [activeOpportunityTab, setActiveOpportunityTab] = useState<number>(0);
  const [editingPage, setEditingPage] = useState<{
    id: number;
    title: string;
    questions: OnboardingPage["questions"];
  } | null>(null);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [updatedProfilePicture, setUpdatedProfilePicture] = useState<
    string | null
  >(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const [abnStatus, setAbnStatus] = useState<AbnValidationStatus>("idle");
  const [fileUploadKey, setFileUploadKey] = useState(0);
 
  const [removedFiles, setRemovedFiles] = useState<Set<string>>(new Set());
  const changePasswordForm = useForm({
    resolver: yupResolver(changePasswordSchema),
    mode: "onChange",
  });
  const {
    register: changePasswordRegister,
    handleSubmit: changePasswordHandleSubmit,
    formState: { errors: changePasswordErrors },
    reset: changePasswordReset,
  } = changePasswordForm;

  const userType: string = useAuthStore((s) => s.getUserType()) ?? "";
  const isCoordinator = userType === "coordinator";

  const {
    userProfile: fetchedUserProfile,
    isLoading: isProfileLoading,
    handleOnboardingRedirect,
    university,
  } = useProfile(isCoordinator ? "" : userType);


  const { data: onboardingData, isLoading: isOnboardingLoading } =
    useOnboardingPages(userType);
  const profileUpdateMutation = useProfileUpdate(userType);
  const profilePictureUpload = useProfilePictureUpload();
  const profilePictureDelete = useProfilePictureDelete();
  const resumeUpload = useResumeUpload();
  const logoUpload = useLogoUpload(userType);
  const logoDelete = useLogoDelete(userType);

  const pages = useMemo(() => {
    if (!onboardingData?.onboarding_pages) return [];
    const nestedPages = onboardingData.onboarding_pages;

    if (userType === "student") {
      return nestedPages.student_onboarding ?? nestedPages.user ?? [];
    }

    if (userType === "organisation") {
      if (nestedPages) {
        const userPages = nestedPages.user || [];
        const organisationPages = nestedPages.organisation || [];

        if (profileData) {
          const memberPages = userPages.map((page: OnboardingPage) => ({
            ...page,
            questions: page.questions.map((question: Question) => ({
              ...question,
              field: question.field,
              label: `${question.label || question.field}`,
            })),
          }));
          const organisationMemberPages = organisationPages.map(
            (page: OnboardingPage) => ({
              ...page,
              questions: page.questions.map((question: Question) => ({
                ...question,
                field: `${question.field}`,
                label: `${question.label || question.field}`,
              })),
            })
          );
          return [...memberPages, ...organisationMemberPages];
        }

        return [...organisationPages];
      }
    }

    return nestedPages.user ?? [];
  }, [onboardingData?.onboarding_pages, userType, profileData]);

  const activePage = useMemo(() => pages[activeTab], [pages, activeTab]);
  const schema = useMemo(
    () => createPageSchema(activePage?.questions || [], true),
    [activePage]
  );

  // custom resolver that skips validation for removed files
  const customResolver = async (values: any, context: any, options: any) => {
    const result = await yupResolver(schema)(values, context, options);

    if (result.errors && Object.keys(result.errors).length > 0) {
      const filteredErrors: Record<string, any> = {};
      Object.keys(result.errors).forEach((key) => {
        // skip validation error if field is in removedFiles and value is null/empty
        const shouldSkipError =
          removedFiles.has(key) &&
          (values[key] === null ||
            values[key] === undefined ||
            values[key] === "");

        if (!shouldSkipError) {
          filteredErrors[key] = (result.errors as Record<string, any>)[key];
        }
      });
      result.errors = filteredErrors;
    }

    return result;
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
    unregister,
    getValues,
    setError,
    setValue,
    watch,
  } = useForm({
    resolver: customResolver,
    // mode: "onChange",
  });
  const organisationNameValue = watch("name");
  const profilePictureValue = watch("profile_picture_url");
  const logoValue = watch("logo_url");
  const hasAbnLookupField = activePage?.questions?.some(
    (question: Question) => question.type === "abn_lookup"
  );
  const isAbnBlocking =
    hasAbnLookupField &&
    (abnStatus === "pending" ||
      abnStatus === "invalid" ||
      abnStatus === "error");

  // remove field from removedFiles if user uploads a new file
  useEffect(() => {
    if (profilePictureValue instanceof File) {
      setRemovedFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete("profile_picture_url");
        return newSet;
      });
    }
  }, [profilePictureValue]);

  useEffect(() => {
    if (logoValue instanceof File) {
      setRemovedFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete("logo_url");
        return newSet;
      });
    }
  }, [logoValue]);

  useEffect(() => {
    setAbnStatus("idle");
  }, [activeTab]);

  useEffect(() => {
    if (fetchedUserProfile) {
      setProfileData(fetchedUserProfile);
    } else if (userProfile) {
      setProfileData(userProfile);
    }
  }, [fetchedUserProfile, userProfile]);

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

  useEffect(() => {
    if (profileData) {
      const cleanedProfileData: any = Object.fromEntries(
        Object.entries(profileData).map(([key, value]) => {
          if (
            value === null &&
            (key.includes("_url") || key === "resume" || key === "logo")
          ) {
            return [key, ""];
          }
          if (value === null) {
            return [key, undefined];
          }
          if (value instanceof File) {
            return [key, undefined];
          }
          return [key, value];
        })
      );

      if (userType === "organisation" && profileData.organisation) {
        Object.entries(profileData.organisation).forEach(([key, value]) => {
          if (
            value !== null &&
            value !== undefined &&
            key !== "organisation" &&
            key !== "members" &&
            !(value instanceof File)
          ) {
            cleanedProfileData[`${key}`] = value;
          }
        });
      }

      reset(cleanedProfileData);
    }
  }, [profileData, reset, activeTab, userType]);

  const tabs: Tab[] = useMemo(() => {
    const allTabs: Tab[] = [];

    if (!isCoordinator) {
      allTabs.push({ title: "My Information", icon: "fa-solid fa-user" });
      allTabs.push({
        title: "My Opportunities",
        icon: "fa-solid fa-folder-closed",
      });
      allTabs.push({
        title: "Documents & Links",
        icon: "fa-solid fa-file-lines",
      });
    }

    allTabs.push({
      title: "Security Settings",
      icon: "fa-solid fa-key",
    });

    return allTabs;
  }, [isCoordinator]);

  const isDocumentsPage = (p: OnboardingPage) =>
    p.questions?.some((q: any) =>
      ["resume", "homepage", "linkedin", "instagram", "bluesky"].includes(
        q.field
      )
    );

  const infoPages = useMemo(
    () => pages.filter((p: OnboardingPage) => !isDocumentsPage(p)),
    [pages]
  );

  const documentsPage = useMemo(
    () => pages.find((p: OnboardingPage) => isDocumentsPage(p)) ?? null,
    [pages]
  );


  const displayFormData = useMemo(() => {
    const p = (profileData || userProfile || fetchedUserProfile) as Record<
      string,
      unknown
    > | null;
    if (!p) return {};
    const base = { ...p };
    if (
      userType === "organisation" &&
      p.organisation &&
      typeof p.organisation === "object"
    ) {
      const org = p.organisation as Record<string, unknown>;
      Object.entries(org).forEach(([key, value]) => {
        if (key !== "organisation" && key !== "members" && value != null) {
          base[key] = value;
        }
      });
    }
    return base;
  }, [profileData, userProfile, fetchedUserProfile, userType]);

  const profileSummaryDisplay = useMemo(() => {
    const p = (userProfile || fetchedUserProfile) as Record<
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
  }, [userProfile, fetchedUserProfile]);

  const fullName = useMemo(() => {
    const name =
      user?.userDetailsV2?.first_name + " " + user?.userDetailsV2?.last_name;
    if (name) return name;
  }, [user]);

  // For organisation users who have completed onboarding, show profile even if no pages
  const shouldShowLoading =
    (isOnboardingLoading || isProfileLoading) && !isCoordinator;
  const hasNoPages = !pages.length && !isCoordinator;

  // If user has profile data but no onboarding pages, they've completed onboarding
  const hasCompletedOnboarding =
    (userProfile || fetchedUserProfile) && hasNoPages;

  if (shouldShowLoading && !hasCompletedOnboarding) {
    return (
      <Box maxW="1280px" mx="auto">
        <Loader size="lg" />
      </Box>
    );
  }

  const handleTabChange = (newIndex: number) => {
    const currentValues = getValues();
    setProfileData((prev: any) => ({
      ...(prev as UserProfile),
      ...currentValues,
    }));
    setActiveTab(newIndex);
  };

  const handleUpdate = async (data: any) => {
    setHasAttemptedSubmit(true);
    const allData = { ...profileData, ...data };

    const submissionData = { ...allData };
    delete submissionData.profile_picture_url;
    delete submissionData.resume_url;
    delete submissionData.logo_url;
    delete submissionData.resume;
    delete submissionData.logo;
    delete submissionData.location;
    delete submissionData.location_geocode_lookup;
    delete submissionData.members;
    delete submissionData.email_domain;

    if (
      submissionData.organisation &&
      submissionData.organisation.organisation
    ) {
      delete submissionData.organisation.organisation;
    }
    Object.keys(submissionData).forEach((key) => {
      if (submissionData[key] === null || submissionData[key] === undefined) {
        delete submissionData[key];
      }
    });

    if (isAbnBlocking) {
      toast.error("Please verify your ABN before saving changes.");
      return;
    }

    if (Object.keys(errors).length > 0) {
      setShowValidationError(true);
      return;
    } else {
      setShowValidationError(false);
    }

    try {
      let finalSubmissionData = submissionData;
      if (userType === "organisation") {
        if (submissionData.allow_contact === "true") {
          finalSubmissionData.allow_contact = true;
        } else {
          finalSubmissionData.allow_contact = false;
        }
        delete finalSubmissionData.organisation.email_domain;

        const { first_name, last_name, role } = submissionData;

        const organisationData: any = {};

        if (profileData?.organisation) {
          Object.keys(profileData.organisation).forEach((field) => {
            if (
              field !== "organisation" &&
              field !== "members" &&
              submissionData[field] !== undefined &&
              submissionData[field] !== null
            ) {
              organisationData[field] = submissionData[field];
            }
          });
        }

        finalSubmissionData = {
          first_name,
          last_name,
          role,
          organisation: organisationData,
        };
      }
      const profileUpdateResponse =
        await profileUpdateMutation.mutateAsync(finalSubmissionData);
      toast.success("Profile updated successfully!");
      setUserProfile(profileUpdateResponse);

      // setRemovedFiles(new Set());
      const uploadTasks = [];
      if (allData.profile_picture_url instanceof File) {
        const response = await profilePictureUpload.mutateAsync(
          allData.profile_picture_url
        );
        if (response?.profile_picture_url && userType === "student") {
          setUpdatedProfilePicture(response.profile_picture_url);
          setUserProfilePictureUrl(response.profile_picture_url);
        } else if (response?.logo_url && userType === "organisation") {
          setUpdatedProfilePicture(response.logo_url);
          setUserProfilePictureUrl(response.logo_url);
        }
      }
      if (allData.resume_url instanceof File) {
        uploadTasks.push(resumeUpload.mutateAsync(allData.resume_url));
      }
      if (allData.logo_url instanceof File) {
        uploadTasks.push(logoUpload.mutateAsync(allData.logo_url));
      }
      if (uploadTasks.length > 0) {
        const results = await Promise.allSettled(uploadTasks);
        const failed = results.find((r) => r.status === "rejected");
        if (failed) {
          toast.error("A file upload failed.");
        } else {
          toast.success("All files uploaded successfully.");
        }
      }

      setFileUploadKey((prev) => prev + 1);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        "Update failed";
      toast.error(errorMessage);
    }
  };

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
              // onPreviewProfile={() => {
              //   router.push(`/profile/${userProfile?.id}`);
              // }}
            />
          )}

          {/* Content Card - Tabs on top, content below */}
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
                    bg={activeTab === index ? "#EAF6FD" : "transparent"}
                    color={activeTab === index ? "#1679AB" : "#27272A"}
                    h="36px"
                    borderRadius="xl"
                    fontSize="sm"
                    fontWeight="500"
                    textDecoration="none"
                    borderBottom="none"
                    border={activeTab === index ? "1px solid #D6EDFB" : "none"}
                  >
                    {tab.title}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              <Box mt={6}>
                {tabs[activeTab]?.title === "My Information" && (
                  <VStack align="stretch" gap={6}>
                    {infoPages.map((page: OnboardingPage) => (
                      <ProfileSectionCard
                        key={page.id}
                        page={{
                          id: page.id,
                          title: page.title,
                          questions: page.questions ?? [],
                        }}
                        formData={displayFormData}
                        onEdit={() =>
                          setEditingPage({
                            id: page.id,
                            title: page.title,
                            questions: page.questions ?? [],
                          })
                        }
                        university={
                          userType === "student"
                            ? (university ?? undefined)
                            : undefined
                        }
                      />
                    ))}
                    {infoPages.length === 0 && (
                      <Text color="#71717A" fontSize="sm">
                        No information to display yet.
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
                  <ChangePasswordSection />
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
