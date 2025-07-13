import { API_ENDPOINTS, apiRequest } from "@/api";
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

export const checkOnboardingStatus = async ({
  user,
  router,
  redirectOnSuccess = true,
}: {
  user: User;
  router: AppRouterInstance;
  redirectOnSuccess?: boolean;
}) => {
  console.log("user", user);
  if (!user?.user_types?.[0]) {
    return;
  }

  try {
    const response = await apiRequest({
      endpoint: API_ENDPOINTS.USER_PROFILE(user.user_types[0]),
    });

    if (redirectOnSuccess) {
      router.push("/discover/");
    }
  } catch (error: any) {
    if (error?.response?.status === 404) {
      router.push("/onboarding/");
      return;
    }
    toast.error("Error checking onboarding status");
  }
};

export const useAuth = () => {
  const router = useRouter();
  const { setAuthData, user } = useAuthStore();
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
      queryClient.invalidateQueries({ queryKey: ["user"] });
      checkOnboardingStatus({
        user: response.user,
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
    onSuccess: (response) => {
      const successMessage = getSuccessMessage(
        response,
        "Account created successfully"
      );
      toast.success(successMessage);
    },
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
  };
};

const getErrorMessage = (error: any, defaultMessage: string): string => {
  if (!error?.response?.data) {
    return error?.message || defaultMessage;
  }

  const data = error.response.data;

  if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
    return data.non_field_errors[0];
  }

  if (data.error) {
    return data.error;
  }

  if (data.detail) {
    return Array.isArray(data.detail) ? data.detail[0] : data.detail;
  }

  if (data.message) {
    return data.message;
  }

  if (data.password && Array.isArray(data.password)) {
    return data.password[0];
  }

  if (data.email && Array.isArray(data.email)) {
    return data.email[0];
  }

  if (typeof data === "object") {
    const firstKey = Object.keys(data)[0];
    if (firstKey && data[firstKey]) {
      const value = data[firstKey];
      return Array.isArray(value) ? value[0] : value;
    }
  }

  return defaultMessage;
};

const getSuccessMessage = (response: any, defaultMessage: string): string => {
  return (
    response?.message ||
    response?.data?.detail ||
    response?.detail ||
    defaultMessage
  );
};
