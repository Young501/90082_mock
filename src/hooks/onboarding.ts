import { API_ENDPOINTS, apiClient, apiRequest, useAuth } from "@/api";
import { useAuthStore } from "@/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
  user_types: string[];
}

interface PasswordResetData {
  email: string;
}

export const useOnboarding = () => {
  const router = useRouter();
  const { setAuthData, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState("");

  const checkOnboardingStatus = async () => {
    if (!user?.user_types?.[0]) {
      return;
    }

    await apiClient
      .get(API_ENDPOINTS.USER_PROFILE(user?.user_types?.[0]).url)
      .then(() => {
        console.log("User profile exists, no onboarding needed");
        router.push("/home");
      })
      .catch((error: AxiosError) => {
        if (error.response?.status === 404) {
          console.log("User profile not found, needs onboarding");
          router.push("/onboarding");
          return;
        }
        console.log("error", error.response);
        toast.error("Error checking onboarding status");
      });
  };

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiClient.post(API_ENDPOINTS.LOGIN.url, {
        email: data.email,
        password: data.password,
      });
      return response.data;
    },
    onSuccess: (response) => {
      setAuthData(response.token, response.user);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      checkOnboardingStatus();
    },
    onError: (error: any) => {
      let errorMessage = "Login failed";

      if (error?.response?.data?.non_field_errors) {
        errorMessage = error.response.data.non_field_errors[0];
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (
        error?.response?.data &&
        typeof error.response.data === "object"
      ) {
        const firstKey = Object.keys(error.response.data)[0];
        if (firstKey && Array.isArray(error.response.data[firstKey])) {
          errorMessage = error.response.data[firstKey][0];
        }
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.password) {
        errorMessage = error.response.data.password[0];
      } else if (error?.response?.data?.email) {
        errorMessage = error.response.data.email[0];
      }
      toast.error(errorMessage);
      setErrorMsg(errorMessage);
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupData) => {
      const response = await apiClient.post(API_ENDPOINTS.SIGNUP.url, {
        email: data.email,
        password: data.password,
        user_types: data.user_types,
      });
      return response.data;
    },
    onSuccess: (response) => {
      toast.success(response?.message);
    },
    onError: (error: any) => {
      let errorMessage = "Signup failed";

      if (error?.response?.data?.non_field_errors) {
        errorMessage = error.response.data.non_field_errors[0];
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (
        error?.response?.data &&
        typeof error.response.data === "object"
      ) {
        const firstKey = Object.keys(error.response.data)[0];
        if (firstKey && Array.isArray(error.response.data[firstKey])) {
          errorMessage = error.response.data[firstKey][0];
        }
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.password) {
        errorMessage = error.response.data.password[0];
      } else if (error?.response?.data?.email) {
        errorMessage = error.response.data.email[0];
      }
      toast.error(errorMessage);
      setErrorMsg(errorMessage);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(API_ENDPOINTS.LOGOUT.url);

      return response.data;
    },
  });

  const passwordResetMutation = useMutation({
    mutationFn: async (data: PasswordResetData) => {
      const response = await apiClient.post(API_ENDPOINTS.PASSWORD_RESET.url, {
        email: data.email,
      });
      return response.data;
    },
    onError: (error: any) => {
      let errorMessage = "Failed to send password reset email";

      if (error?.response?.data?.non_field_errors) {
        errorMessage = error.response.data.non_field_errors[0];
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (
        error?.response?.data &&
        typeof error.response.data === "object"
      ) {
        const firstKey = Object.keys(error.response.data)[0];
        if (firstKey && Array.isArray(error.response.data[firstKey])) {
          errorMessage = error.response.data[firstKey][0];
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      setErrorMsg(errorMessage);
    },
  });

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout failed:", error);
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
      console.error("Login failed:", error);
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
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const handleForgotPassword = async (data: {
    email: string;
    callback?: () => void;
  }) => {
    try {
      const response = await passwordResetMutation.mutateAsync({
        email: data.email,
      });
      data.callback?.();
      toast.success(response?.message);
    } catch (error) {
      console.error("Password reset failed:", error);
      throw error;
    }
  };

  return {
    checkOnboardingStatus,
    handleLogout,
    handleLogin,
    handleSignup,
    handleForgotPassword,
    loginMutation,
    signupMutation,
    passwordResetMutation,
    isLoginLoading: loginMutation.isPending,
    isSignupLoading: signupMutation.isPending,
    isPasswordResetLoading: passwordResetMutation.isPending,
    loginError: loginMutation.error,
    signupError: signupMutation.error,
    passwordResetError: passwordResetMutation.error,
    user,
    errorMsg,
  };
};
