import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import {
  useStudentProfileV2,
  useOnboardingPages,
  useUserMeV2,
  useOrganisationProfileV2,
  useOrganisationMemberMeV2,
} from "@/services/shared";
import { useAuthStore } from "@/store/authStore";
import { Page } from "@/types/onboarding";

const normalizePages = (raw: unknown[]): Page[] => {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map((p: any) => ({
    id: p.id,
    title: p.title,
    questions: p.questions ?? [],
  }));
};

export const useProfile = (userType: string) => {
  const router = useRouter();
  const { setUserProfile, setUserProfilePictureUrl } = useAuthStore();

  const isStudent = userType === "student";
  const isOrganisation = userType === "organisation";
  const isCoordinator = userType === "coordinator";

  // V2 student profile data
  const userDetailsV2 = useAuthStore((s) => s.user?.userDetailsV2);
  const {
    data: studentData,
    isLoading: isStudentProfileLoading,
    isError: isStudentError,
    error: studentError,
  } = useStudentProfileV2(isStudent);

  // V2 organisation data – three separate endpoints
  const {
    data: orgUserData,
    isLoading: isOrgUserLoading,
  } = useUserMeV2(isOrganisation);

  const {
    data: orgMemberData,
    isLoading: isOrgMemberLoading,
  } = useOrganisationMemberMeV2(isOrganisation);

  const {
    data: orgProfileData,
    isLoading: isOrgProfileLoading,
    isError: isOrgProfileError,
    error: orgProfileError,
  } = useOrganisationProfileV2(isOrganisation);

  const { data: onboardingData, isLoading: isOnboardingLoading } =
    useOnboardingPages(userType);

  const pages = useMemo(() => {
    if (!onboardingData?.onboarding_pages) return [];
    const op = onboardingData.onboarding_pages;
    if (isStudent) {
      const studentPages = op.student_onboarding ?? op.user ?? [];
      return normalizePages(studentPages);
    }
    return [];
  }, [onboardingData?.onboarding_pages, isStudent]);

  // Merged profile for student
  const mergedStudentProfile = useMemo(() => {
    if (!isStudent) return null;
    const user = userDetailsV2 as Record<string, unknown> | undefined;
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
  }, [isStudent, userDetailsV2, studentData]);

  // Merged profile for organisation (flat – no nested objects)
  const mergedOrgProfile = useMemo(() => {
    if (!isOrganisation) return null;
    const userData = orgUserData as Record<string, unknown> | undefined;
    const memberData = orgMemberData as Record<string, unknown> | undefined;
    const profileData = orgProfileData as Record<string, unknown> | undefined;
    if (!userData && !memberData && !profileData) return null;
    return {
      ...(profileData ?? {}),
      ...(memberData ?? {}),
      ...(userData ?? {}),
      profile_picture: userData?.profile_picture ?? userData?.profile_picture_url,
      profile_picture_url:
        userData?.profile_picture_url ?? userData?.profile_picture,
      logo: profileData?.logo,
      logo_url: profileData?.logo_url ?? profileData?.logo,
    } as Record<string, unknown>;
  }, [isOrganisation, orgUserData, orgMemberData, orgProfileData]);

  const mergedProfile = isStudent
    ? mergedStudentProfile
    : isOrganisation
    ? mergedOrgProfile
    : null;

  const userProfileForStore = isStudent
    ? mergedStudentProfile
    : isOrganisation
    ? mergedOrgProfile
    : null;

  useEffect(() => {
    if (userProfileForStore) {
      setUserProfile(userProfileForStore as any);
      const picUrl =
        (userProfileForStore as any)?.profile_picture_url ??
        (userProfileForStore as any)?.profile_picture;
      if (picUrl) setUserProfilePictureUrl(picUrl);
    }
  }, [userProfileForStore, setUserProfile, setUserProfilePictureUrl]);

  const handleOnboardingRedirect = (redirectOnSuccess: boolean = true) => {
    if (isStudent) {
      if (
        !isStudentProfileLoading &&
        isStudentError &&
        (studentError as any)?.response?.status === 404
      ) {
        router.push("/onboarding/");
        return;
      }
      if (
        isStudentError &&
        (studentError as any)?.response?.status !== 404
      ) {
        toast.error("Error loading profile");
      }
      return;
    }

    if (isOrganisation) {
      if (
        isOrgProfileError &&
        (orgProfileError as any)?.response?.status === 404
      ) {
        router.push("/onboarding/");
        return;
      }
      return;
    }
  };

  const isLoading = isStudent
    ? isStudentProfileLoading
    : isOrganisation
    ? isOrgUserLoading || isOrgMemberLoading || isOrgProfileLoading
    : false;

  const university = useMemo(() => {
    if (!isStudent || !studentData) return null;
    const u = (studentData as any)?.university;
    if (!u) return null;
    return {
      slug: u.slug ?? u.code,
      name: u.name,
    };
  }, [isStudent, studentData]);

  return {
    userProfile: userProfileForStore,
    mergedProfile,
    isLoading,
    isError: isStudent ? isStudentError : isOrganisation ? isOrgProfileError : false,
    error: isStudent ? studentError : isOrganisation ? orgProfileError : undefined,
    handleOnboardingRedirect,
    pages,
    university,
    onboardingData,
    isOnboardingLoading,
  };
};
