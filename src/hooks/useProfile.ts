import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import {
  useUserProfile,
  useStudentProfileV2,
  useOnboardingPages,
} from "@/services/shared";
import { useAuthStore } from "@/store/authStore";
import { Page } from "@/types/onboarding";
import { OnboardingPage } from "@/types/profile";

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
  const isCoordinator = userType === "coordinator";

  // Non-student: use legacy user profile API
  const {
    data: userProfile,
    error,
    isLoading: isUserProfileLoading,
    isError,
  } = useUserProfile(isStudent || isCoordinator ? "" : userType);

  const userDetailsV2 = useAuthStore((s) => s.user?.userDetailsV2);
  const {
    data: studentData,
    isLoading: isStudentProfileLoading,
    isError: isStudentError,
    error: studentError,
  } = useStudentProfileV2(isStudent);

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

  const mergedProfile = useMemo(() => {
    if (!isStudent) return userProfile ?? null;
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
  }, [isStudent, userProfile, userDetailsV2, studentData]);

  const userProfileForStore = isStudent ? mergedProfile : userProfile;

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

    if (isError && error?.response?.status === 404) {
      router.push("/onboarding/");
      return;
    }

    if (userProfile && redirectOnSuccess && !isCoordinator) {
      router.push("/discover/");
    }

    if (isError && error?.response?.status !== 404) {
      toast.error("Error checking onboarding status");
    }
  };

  const isLoading = isStudent
    ? isStudentProfileLoading
    : isUserProfileLoading;

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
    isError: isStudent ? isStudentError : isError,
    error: isStudent ? studentError : error,
    handleOnboardingRedirect,
    pages,
    university,
    onboardingData,
    isOnboardingLoading,
  };
};
