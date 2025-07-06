import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/user";
import { UserProfile } from "@/types/profile";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
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
  setLogoUrl: (url: string) => void;
  getLogoUrl: () => string | null;
  getUserFullName: () => string;
  getUserFirstName: () => string;
  getUserLastName: () => string;
  getUserProfilePictureUrl: () => string | null;
  updateUserProfilePicture: (url: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      signupSelectedUserType: null,
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

      setLogoUrl: (url: string) => {
        set({ logoUrl: url });
      },
      getLogoUrl: () => get().logoUrl,

      setUserProfile: (profile: UserProfile) => {
        set({ userProfile: profile });
      },
      getUserProfile: () => get().userProfile,
      getUserFullName: () => {
        const { user } = get();
        if (!user?.first_name || !user?.last_name) return "";
        return `${user.first_name} ${user.last_name}`.trim();
      },

      getUserFirstName: () => {
        const { user } = get();
        return user?.first_name || "";
      },

      getUserLastName: () => {
        const { user } = get();
        return user?.last_name || "";
      },

      getUserProfilePictureUrl: () => {
        const { user } = get();
        return user?.profile_picture_url || null;
      },

      updateUserProfilePicture: (url: string) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, profile_picture_url: url },
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        logoUrl: state.logoUrl,
        userProfile: state.userProfile,
      }),
    }
  )
);
