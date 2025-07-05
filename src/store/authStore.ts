import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/user";
import { UserProfile } from "@/types/profile";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  profileImageUrl: string | null;
  logoUrl: string | null;
  userProfile: UserProfile | null;
  setAuthData: (token: string, user: User) => void;
  logout: () => void;
  setUserType: (userType: string) => void;
  getCurrentUser: () => User | null;
  getCurrentToken: () => string | null;
  getUserType: () => string | undefined;
  signupSelectedUserType: string | null;
  setSignupSelectedUserType: (userType: string | null) => void;
  getSignupSelectedUserType: () => string | null;
  // images sent to seprate endpoints and doesnt return with user data on submission
  setProfileImageUrl: (url: string) => void;
  getProfileImageUrl: () => string | null;
  setLogoUrl: (url: string) => void;
  getLogoUrl: () => string | null;
  setUserProfile: (profile: UserProfile) => void;
  getUserProfile: () => UserProfile | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      signupSelectedUserType: null,
      profileImageUrl: null,
      logoUrl: null,
      userProfile: null,

      setAuthData: (token: string, user: User) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          profileImageUrl: null,
          logoUrl: null,
          userProfile: null,
        });

        if (typeof window !== "undefined") {
          window.location.href = "/login/";
        }
      },

      setUserType: (userType: string) => {
        const { user } = get();
        if (!user) return;

        const updatedUser: User = {
          ...user,
          user_types: [userType],
        };

        set({ user: updatedUser });
      },

      getCurrentUser: () => get().user,
      getCurrentToken: () => get().token,
      getUserType: () => get().user?.user_types?.[0],

      setSignupSelectedUserType: (userType: string | null) => {
        set({ signupSelectedUserType: userType });
      },
      getSignupSelectedUserType: () => get().signupSelectedUserType,

      setProfileImageUrl: (url: string) => {
        set({ profileImageUrl: url });
      },
      getProfileImageUrl: () => get().profileImageUrl,

      setLogoUrl: (url: string) => {
        set({ logoUrl: url });
      },
      getLogoUrl: () => get().logoUrl,

      setUserProfile: (profile: UserProfile) => {
        set({ userProfile: profile });
      },
      getUserProfile: () => get().userProfile,
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        profileImageUrl: state.profileImageUrl,
        logoUrl: state.logoUrl,
        userProfile: state.userProfile,
      }),
    }
  )
);
