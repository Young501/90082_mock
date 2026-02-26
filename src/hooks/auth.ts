import { API_ENDPOINTS, apiRequest } from "@/api";
import { getErrorMessage, getSuccessMessage } from "@/utils/apiErrorHandling";
import { useAuthStore } from "@/store";
import {
  LoginData,
  PasswordResetData,
  SignupData,
  PasswordResetConfirmData,
} from "@/types/auth";
import { User } from "@/types/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { UserProfile, OrganisationCheckResponse } from "@/types/shared";

/** required fields for student onboarding completion  */
export const STUDENT_ONBOARDING_REQUIRED_FIELDS = [
  "faculty",
  "course_stream",
] as const;

export const isStudentOnboardingComplete = (
  profile: Record<string, any>
): boolean => {
  return STUDENT_ONBOARDING_REQUIRED_FIELDS.every((field) => {
    const value = profile[field];
    if (value == null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.trim() !== "";
    return true;
  });
};

export const checkOnboardingStatus = async ({
  user,
  router,
  redirectOnSuccess = true,
  setUserProfile,
}: {
  user: User;
  router: AppRouterInstance;
  redirectOnSuccess?: boolean;
  setUserProfile: (userProfile: UserProfile) => void;
}) => {
  if (!user?.user_types?.[0]) {
    return;
  }

  const userType = user.user_types[0];
  const isCoordinator = userType === "coordinator";

  if (isCoordinator) {
    if (redirectOnSuccess) {
      await fetchCoordinatorOpportunities();
      router.push("/dashboard/");
    }
    return;
  }

  if (userType === "student") {
    try {
      const response = await apiRequest({
        endpoint: API_ENDPOINTS.STUDENT_PROFILE_V2,
      });
      setUserProfile(response);
      if (redirectOnSuccess) {
        if (isStudentOnboardingComplete(response)) {
          router.push("/home/");
        } else {
          router.push("/onboarding/");
        }
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        if (redirectOnSuccess) router.push("/onboarding/");
        return;
      }
      console.error("Error checking onboarding status:", error);
      toast.error("Error checking onboarding status");
    }
    return;
  }

  try {
    const response = await apiRequest({
      endpoint: API_ENDPOINTS.ORGANISATION_PROFILE_V2,
    });
    setUserProfile(response);
    if (redirectOnSuccess) {
      router.push("/home/");
    }
  } catch (error: any) {
    if (error?.response?.status === 404 && userType === "organisation") {
      await checkOrganisationDomain(user, router);
      return;
    } else if (error?.response?.status === 404 && userType !== "coordinator") {
      router.push("/onboarding/");
      return;
    }
    console.error("Error checking onboarding status:", error);
    toast.error("Error checking onboarding status");
  }
};

const checkOrganisationDomain = async (
  user: User,
  router: AppRouterInstance
) => {
  try {
    const response = await apiRequest<OrganisationCheckResponse>({
      endpoint: API_ENDPOINTS.ORGANISATION_CHECK_DOMAIN,
    });

    if (response.organisation && response.organisation.id) {
      const { setTempOrganisation } = useAuthStore.getState();
      setTempOrganisation(response.organisation);
      router.push("/onboarding/organisation-match");
    } else if (response.organisation === null) {
      router.push("/onboarding/");
    }
  } catch (error: any) {
    router.push("/onboarding/");
  }
};

const fetchCoordinatorOpportunities = async () => {
  try {
    const response = await apiRequest({
      endpoint: API_ENDPOINTS.COORDINATOR_OPPORTUNITIES,
    });

    const opportunityIds = response.map((opportunity: any) => opportunity.id);
    useAuthStore.getState().setCoordinatorOpportunities(opportunityIds);
  } catch (error: any) {
    console.error("Failed to fetch coordinator opportunities:", error);
    toast.error("Failed to fetch opportunities");
  }
};

export const useAuth = () => {
  const router = useRouter();
  const { setAuthData, user, setUserProfile, setIsAuthenticated } =
    useAuthStore();
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.LOGIN,
        body: {
          email: data.email,
          password: data.password,
        },
      });
    },
    onSuccess: (response) => {
      setAuthData(response.token, response.user);
      setIsAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["accepted-opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["accessible-opportunities"] });
      checkOnboardingStatus({
        user: response.user,
        setUserProfile: setUserProfile,
        router,
      });
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error, "Login failed");
      toast.error(errorMessage);
      setErrorMsg(errorMessage);
      throw error;
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupData) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.SIGNUP,
        body: {
          email: data.email,
          password: data.password,
          user_types: data.user_types,
        },
      });
    },
    onSuccess: (response) => {},
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error, "Signup failed");
      toast.error(errorMessage);
      setErrorMsg(errorMessage);
    },
  });

  const passwordResetConfirmMutation = useMutation({
    mutationFn: async (data: PasswordResetConfirmData) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.PASSWORD_RESET_CONFIRM,
        body: {
          token: data.token,
          new_password: data.new_password,
          confirm_password: data.confirm_password,
        },
      });
    },
    onSuccess: (response) => {
      const successMessage = getSuccessMessage(
        response,
        "Password reset successfully"
      );
      toast.success(successMessage);
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error, "Failed to reset password");
      toast.error(errorMessage);
      setErrorMsg(errorMessage);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest({
        endpoint: API_ENDPOINTS.LOGOUT,
      });
    },
    onSettled: () => {
      queryClient.removeQueries({ queryKey: ["homepage"] });
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error, "Logout failed");
      toast.error(errorMessage);
      setErrorMsg(errorMessage);
    },
  });

  const passwordResetMutation = useMutation({
    mutationFn: async (data: PasswordResetData) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.PASSWORD_RESET,
        body: {
          email: data.email,
        },
      });
    },
    onSuccess: (response) => {
      const successMessage = getSuccessMessage(
        response,
        "Password reset email sent"
      );
      toast.success(successMessage);
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(
        error,
        "Failed to send password reset email"
      );
      toast.error(errorMessage);
      setErrorMsg(errorMessage);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: {
      old_password: string;
      new_password: string;
    }) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.CHANGE_PASSWORD,
        body: {
          old_password: data.old_password,
          new_password: data.new_password,
        },
      });
    },
    onSuccess: (response) => {
      const successMessage = getSuccessMessage(
        response,
        "Password changed successfully"
      );
      toast.success(successMessage);
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error, "Failed to change password");
      toast.error(errorMessage);
      setErrorMsg(errorMessage);
    },
  });

  const handleChangePassword = async (data: {
    old_password: string;
    new_password: string;
    callback?: () => void;
  }) => {
    try {
      await changePasswordMutation.mutateAsync({
        old_password: data.old_password,
        new_password: data.new_password,
      });
      data.callback?.();
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      throw error;
    }
  };

  const handleLogin = async (data: {
    email: string;
    password: string;
    callback?: () => void;
  }) => {
    try {
      await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });
      data.callback?.();
    } catch (error: any) {
      throw error;
    }
  };

  const handleSignup = async (data: {
    email: string;
    password: string;
    user_types: string[];
    callback?: () => void;
  }) => {
    try {
      await signupMutation.mutateAsync({
        email: data.email,
        password: data.password,
        user_types: data.user_types,
      });
      data.callback?.();
    } catch (error: any) {
      throw error;
    }
  };

  const handleForgotPassword = async (data: {
    email: string;
    callback?: () => void;
  }) => {
    try {
      await passwordResetMutation.mutateAsync({
        email: data.email,
      });
      data.callback?.();
    } catch (error) {
      console.error("Password reset failed:", error);
      throw error;
    }
  };

  const handlePasswordResetConfirm = async (data: {
    token: string;
    new_password: string;
    confirm_password: string;
    callback?: () => void;
  }) => {
    try {
      await passwordResetConfirmMutation.mutateAsync({
        token: data.token,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });
      data.callback?.();
    } catch (error) {
      console.error("Password reset confirm failed:", error);
      throw error;
    }
  };

  return {
    checkOnboardingStatus,
    handleLogout,
    handleLogin,
    handleSignup,
    handleForgotPassword,
    handlePasswordResetConfirm,
    loginMutation,
    signupMutation,
    passwordResetMutation,
    isLoginLoading: loginMutation.isPending,
    isSignupLoading: signupMutation.isPending,
    isPasswordResetLoading: passwordResetMutation.isPending,
    loginError: loginMutation.error,
    signupError: signupMutation.error,
    passwordResetError: passwordResetMutation.error,
    passwordResetConfirmMutation,
    isPasswordResetConfirmLoading: passwordResetConfirmMutation.isPending,
    passwordResetConfirmError: passwordResetConfirmMutation.error,
    user,
    errorMsg,
    changePasswordMutation,
    handleChangePassword,
  };
};

