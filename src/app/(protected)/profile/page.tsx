"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useAuthStore } from "@/store";
import {
  useOnboardingPages,
  useProfileUpdate,
  useProfilePictureUpload,
  useResumeUpload,
  useLogoUpload,
} from "@/services/shared";
import {
  Box,
  Text,
  Button,
  Flex,
  Avatar,
  Progress,
  VStack,
  Alert,
} from "@chakra-ui/react";
import { StudentCard } from "../discover/cards/studentCard";
import { PartnerCard } from "../discover/cards/partnerCard";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  createPageSchema,
  changePasswordSchema,
} from "@/utils/validationSchemas";
import { FieldRenderer } from "../../(auth)/onboarding/FieldRenderer";
import { Question } from "@/types/onboarding";
import Image from "next/image";
import { OnboardingPage, OnboardingData, Tab } from "@/types/profile";

import { UserProfile } from "@/types/shared";

import { toast } from "react-toastify";
import { useProfile } from "@/hooks/useProfile";
import { FullProfileCard } from "../discover/cards/FullProfileCard";
import { useAuth } from "@/hooks/auth";
import { InputField } from "@/components/ui";
import Loader from "@/components/Loader";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { OrganisationProfile } from "@/types/discovery";

const Profile = () => {
  const {
    user,
    getUserProfile,
    setUserProfile,
    getUserProfilePictureUrl,
    getLogoUrl,
    setUserProfilePictureUrl,
  } = useAuthStore();
  const userProfile: UserProfile | null = getUserProfile();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [updatedProfilePicture, setUpdatedProfilePicture] = useState<
    string | null
  >(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const { handleChangePassword, changePasswordMutation } = useAuth();
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
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

  const userType: string = user?.user_types?.[0] || "";
  const isCoordinator = userType === "coordinator";

  const {
    userProfile: fetchedUserProfile,
    isLoading: isProfileLoading,
    handleOnboardingRedirect,
  } = useProfile(userType === "coordinator" ? "" : userType);

  const { data: onboardingData, isLoading: isOnboardingLoading } =
    useOnboardingPages(userType);
  const profileUpdateMutation = useProfileUpdate(userType);
  const profilePictureUpload = useProfilePictureUpload();
  const resumeUpload = useResumeUpload(userType);
  const logoUpload = useLogoUpload(userType);

  const pages = useMemo(() => {
    if (!onboardingData?.onboarding_pages) return [];

    if (userType === "organisation") {
      const nestedPages = onboardingData.onboarding_pages;
      if (nestedPages) {
        // const userPages = nestedPages.user || [];
        const organisationPages = nestedPages.organisation || [];

        //TODO: member pages arent added yet because we could have multple members tied to an organisation

        // if (profileData?.members && profileData.members.length > 0) {
        //   const memberPages = userPages.map((page: OnboardingPage) => ({
        //     ...page,
        //     questions: page.questions.map((question: Question) => ({
        //       ...question,
        //       field: `members.${question.field}`,
        //       label: `${profileData.members![0].first_name} ${profileData.members![0].last_name} - ${question.label || question.field}`,
        //     })),
        //   }));
        //   return [...memberPages, ...organisationPages];
        // }

        return [...organisationPages];
      }
    }

    return onboardingData.onboarding_pages.user || [];
  }, [onboardingData?.onboarding_pages, userType]);

  const activePage = useMemo(() => pages[activeTab], [pages, activeTab]);
  const schema = useMemo(
    () => createPageSchema(activePage?.questions || [], true),
    [activePage]
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
    unregister,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    // mode: "onChange",
  });

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
          return [key, value];
        })
      );
      reset(cleanedProfileData);
    }
  }, [profileData, reset, activeTab, userType]);

  const tabs: Tab[] = useMemo(() => {
    if (!pages.length && !isCoordinator) return [];

    const onboardingTabs: Tab[] = pages.map((page: OnboardingPage) => ({
      title: page.short_title || page.title,
      icon: page.title_icon,
    }));
    if (!isCoordinator) {
      onboardingTabs.push({
        title: "Profile Preview",
        icon: "fa-solid fa-eye",
      });
    }
    onboardingTabs.push({
      title: "Change Password",
      icon: "fa-solid fa-key",
    });

    return onboardingTabs;
  }, [pages, isCoordinator]);

  const calculateProfileCompletion = (): number => {
    if (!userProfile || !pages.length) return 0;

    const getAllFieldsFromPages = (
      pages: OnboardingPage[],
      userProfile: UserProfile
    ): string[] => {
      const fields: string[] = [];

      const extractFieldsFromQuestion = (
        question: Question,
        userProfile: UserProfile
      ): string[] => {
        const questionFields = [question.field];
        const userAnswer = (userProfile as any)[question.field];

        if (
          question.followup_question &&
          userAnswer &&
          question.followup_question[userAnswer]
        ) {
          const followup = question.followup_question[userAnswer];
          questionFields.push(
            ...extractFieldsFromQuestion(followup, userProfile)
          );
        }

        return questionFields;
      };

      pages.forEach((page) => {
        page.questions.forEach((question: Question) => {
          fields.push(...extractFieldsFromQuestion(question, userProfile));
        });
      });

      return [...new Set(fields)];
    };

    const allOnboardingFields = getAllFieldsFromPages(pages, userProfile);

    const filledFields = allOnboardingFields.filter((field) => {
      const value = userProfile[field as keyof UserProfile];
      return (
        value !== undefined &&
        value !== null &&
        (Array.isArray(value)
          ? value.length > 0
          : value.toString().trim() !== "")
      );
    });

    return Math.round((filledFields.length / allOnboardingFields.length) * 100);
  };

  if ((isOnboardingLoading || !pages.length) && !isCoordinator) {
    return (
      <Box p={6} maxW="1280px" mx="auto" mt={{ base: "80px", lg: "126px" }}>
        <Loader size="lg" />
      </Box>
    );
  }

  const completionPercentage = calculateProfileCompletion();

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
    Object.keys(submissionData).forEach((key) => {
      if (submissionData[key] === null || submissionData[key] === undefined) {
        delete submissionData[key];
      }
    });
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
        const { role, ...organisationData } = submissionData;
        finalSubmissionData = {
          organisation: organisationData,
        };
      }
      const profileUpdateResponse =
        await profileUpdateMutation.mutateAsync(finalSubmissionData);
      toast.success("Profile updated successfully!");
      setUserProfile(profileUpdateResponse);
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
      <Box
        py={6}
        px={{ base: 4, lg: "72px" }}
        maxW="1512px"
        mx="auto"
        mt={{ base: "80px", lg: "126px" }}
      >
        <Flex
          w="100%"
          direction={{ base: "column", md: "row" }}
          gap={{ base: 4, lg: 20 }}
        >
          <Box
            bg="white"
            borderRadius="22px"
            p={6}
            maxW={{ base: "100%", md: "350px", lg: "444px" }}
            w="100%"
            h="fit-content"
            boxShadow="0px 2.65px 5.3px 1.99px rgba(0, 0, 0, 0.25)"
            background={
              userType === "student"
                ? "linear-gradient(180deg, #F87C7C 0%, #FFFFFF 23.56%, #FFFFFF 37.02%, #FFFFFF 69.71%);"
                : "linear-gradient(180deg, #089C3F 0%, #FFFFFF 23.56%, #FFFFFF 37.02%, #FFFFFF 69.71%);"
            }
          >
            <Box mb={6}>
              <Flex align="center" gap={6} mb={6}>
                <Avatar.Root
                  w={105}
                  h={105}
                  borderRadius="full"
                  border={
                    userType === "student"
                      ? "4px solid #DC2626"
                      : "4px solid #089C3F"
                  }
                >
                  {(updatedProfilePicture ||
                    (userType === "student"
                      ? getUserProfilePictureUrl()
                      : getLogoUrl())) && (
                    <Avatar.Image
                      src={
                        updatedProfilePicture ||
                        (userType === "student"
                          ? getUserProfilePictureUrl()
                          : getLogoUrl()) ||
                        undefined
                      }
                    />
                  )}
                  <Avatar.Fallback
                    name={
                      userType === "organisation" && userProfile?.name
                        ? userProfile.name
                        : isCoordinator
                          ? "Coordinator"
                          : `${userProfile?.first_name} ${userProfile?.last_name}`
                    }
                    bg="gray.200"
                    color="gray.800"
                    fontWeight="bold"
                    fontSize="2xl"
                  />
                </Avatar.Root>
                <Box>
                  <Text
                    fontSize="25px"
                    fontWeight="bold"
                    color="#000000"
                    display={isCoordinator ? "none" : "block"}
                  >
                    {userType === "organisation" && userProfile?.name
                      ? userProfile.name
                      : `${userProfile?.first_name} ${userProfile?.last_name}`}
                  </Text>
                  <Text
                    fontSize="20px"
                    color="#000000"
                    textTransform="capitalize"
                  >
                    {/* capitalizing  */}
                    {userType === "organisation" ? "Organisation" : userType}
                  </Text>
                </Box>
              </Flex>

              <Box display={isCoordinator ? "none" : "block"}>
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

            <Box display="flex" flexDirection="column" gap={3} mb={6} pl="20px">
              {tabs.map((tab: Tab, index: number) => {
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    justifyContent="flex-start"
                    onClick={() => handleTabChange(index)}
                    borderLeft={
                      activeTab === index && userType === "student"
                        ? "4px solid #DC2626"
                        : activeTab === index &&
                            (userType === "organisation" || isCoordinator)
                          ? "4px solid #089C3F"
                          : ""
                    }
                    fontWeight="600"
                    w="full"
                    py={5}
                    px={3}
                  >
                    <i
                      className={tab.icon}
                      style={{
                        color: "#000000",
                        fontSize: "18px",
                      }}
                    />
                    <Text fontSize="16px" fontWeight="600" color="#000000">
                      {tab.title}
                    </Text>
                  </Button>
                );
              })}
            </Box>
          </Box>

          <Box maxW={{ base: "100%" }} w="100%" bg="white" p={6} flex={1}>
            <Text fontSize="25px" fontWeight="bold" mb={6} color="#000000">
              {tabs[activeTab]?.title || "Tab Details"}
            </Text>

            {activeTab === tabs.length - 2 ? (
              <Box>
                {userProfile &&
                  (userType === "student" ? (
                    <VStack gap={10} w="full" align="flex-start">
                      <StudentCard
                        student={userProfile}
                        profilePictureUrl={getUserProfilePictureUrl()}
                        userType={userType}
                        maxW="500px"
                        disableViewFullProfile={true}
                        disableAddToFolder={true}
                      />
                      <FullProfileCard
                        profileId={userProfile.id?.toString() || ""}
                        profileType="student"
                        isModal={false}
                        studentProfile={userProfile}
                        disableBtns={true}
                      />
                    </VStack>
                  ) : userType === "organisation" ? (
                    <VStack gap={10} w="full" align="flex-start">
                      <PartnerCard
                        organisation={userProfile}
                        profilePictureUrl={getUserProfilePictureUrl()}
                        maxW="500px"
                        disableViewFullProfile={true}
                        disableAddToFolder={true}
                      />
                      <FullProfileCard
                        profileId={userProfile.id?.toString() || ""}
                        profileType="organisation"
                        isModal={false}
                        organisationProfile={userProfile}
                        disableBtns={true}
                      />
                    </VStack>
                  ) : null)}
              </Box>
            ) : activeTab === tabs.length - 1 ? (
              <Box
                maxW="500px"
                mx="auto"
                mt={8}
                p={8}
                borderRadius="16px"
                boxShadow="0 2px 8px rgba(0,0,0,0.08)"
                bg="#F9FAFB"
              >
                <form
                  onSubmit={changePasswordHandleSubmit(async (data) => {
                    setChangePasswordSuccess(false);
                    setChangePasswordError("");
                    try {
                      await handleChangePassword({
                        old_password: data.old_password,
                        new_password: data.new_password,
                      });
                      setChangePasswordSuccess(true);
                      changePasswordReset();
                    } catch (err: any) {
                      setChangePasswordError(
                        err?.message || "Failed to change password"
                      );
                    }
                  })}
                >
                  <VStack gap={6} align="stretch">
                    <Box>
                      <InputField
                        type="password"
                        label="OLD PASSWORD"
                        showPasswordToggle
                        showPassword={showOldPassword}
                        onTogglePassword={() =>
                          setShowOldPassword(!showOldPassword)
                        }
                        {...changePasswordRegister("old_password")}
                        error={changePasswordErrors.old_password?.message}
                      />
                    </Box>
                    <Box>
                      <InputField
                        type="password"
                        label="NEW PASSWORD"
                        showPasswordToggle
                        showPassword={showNewPassword}
                        onTogglePassword={() =>
                          setShowNewPassword(!showNewPassword)
                        }
                        {...changePasswordRegister("new_password")}
                        error={changePasswordErrors.new_password?.message}
                      />
                    </Box>
                    <Box>
                      <InputField
                        type="password"
                        label="CONFIRM NEW PASSWORD"
                        showPasswordToggle
                        showPassword={showConfirmNewPassword}
                        onTogglePassword={() =>
                          setShowConfirmNewPassword(!showConfirmNewPassword)
                        }
                        {...changePasswordRegister("confirm_new_password")}
                        error={
                          changePasswordErrors.confirm_new_password?.message
                        }
                      />
                    </Box>
                    <Button
                      type="submit"
                      mt={4}
                      borderRadius="8px"
                      py={3}
                      px={6}
                      bg="#CFF3FF"
                      height="60px"
                      color="#000000"
                      fontWeight="600"
                      fontSize="16px"
                      loading={changePasswordMutation.isPending}
                    >
                      Change Password
                    </Button>
                  </VStack>
                </form>
              </Box>
            ) : (
              <form onSubmit={handleSubmit(handleUpdate)}>
                {showValidationError &&
                  hasAttemptedSubmit &&
                  Object.keys(errors).length > 0 && (
                    <Alert.Root status="error" mb={4}>
                      <Alert.Indicator />
                      <Alert.Title>
                        Please follow the instructions to fill the form.
                      </Alert.Title>
                    </Alert.Root>
                  )}
                {activePage?.questions?.map((question: Question) => (
                  <FieldRenderer
                    key={question.field}
                    question={question}
                    register={register}
                    control={control}
                    errors={errors}
                    clearErrors={clearErrors}
                    unregister={unregister}
                  />
                ))}
                <Button
                  type="submit"
                  mt={10}
                  display="flex"
                  alignItems="center"
                  justifySelf="flex-end"
                  borderRadius="8px"
                  gap={2}
                  py={3}
                  px={6}
                  bg="#CFF3FF"
                  loading={profileUpdateMutation.isPending}
                >
                  <Image
                    src="/assets/saveicon.svg"
                    alt="save"
                    width={15}
                    height={20}
                  />
                  <Text fontWeight="600" fontSize="15px" color="#000000">
                    Save Changes
                  </Text>
                </Button>
              </form>
            )}
          </Box>
        </Flex>
      </Box>
    </>
  );
};

export default Profile;
