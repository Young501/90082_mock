import { useUserProfile } from "@/services/shared";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { toast } from "react-toastify";

export const useProfile = (userType: string) => {
  const router = useRouter();
  const { setUserProfile, setUserProfilePictureUrl } = useAuthStore();

  const {
    data: userProfile,
    error,
    isLoading,
    isError,
  } = useUserProfile(userType);

  useEffect(() => {
    if (userProfile) {
      setUserProfile(userProfile);
      if (userProfile.profile_picture_url) {
        setUserProfilePictureUrl(userProfile.profile_picture_url);
      }
    }
  }, [userProfile, setUserProfile, setUserProfilePictureUrl]);

  const handleOnboardingRedirect = (redirectOnSuccess: boolean = true) => {
    if (isError && error?.response?.status === 404) {
      router.push("/onboarding/");
      return;
    }

    if (userProfile && redirectOnSuccess && userType !== "coordinator") {
      router.push("/discover/");
    }

    if (isError && error?.response?.status !== 404) {
      toast.error("Error checking onboarding status");
    }
  };

  return {
    userProfile,
    isLoading,
    isError,
    error,
    handleOnboardingRedirect,
  };
};
