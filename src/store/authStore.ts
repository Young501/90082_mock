import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, UserDetailsV2 } from "@/types/user";
import { UserProfile, Organisation } from "@/types/shared";
import { AccessibleOpportunity } from "@/types/opportunities";
import { SubscriptionStatus } from "@/types/subscription";
import { useUIStore } from "./uiStore";
import { useOnboardingFlowStore } from "./onboardingFlowStore";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  logoUrl: string | null;
  userProfile: UserProfile | null;
  userProfilePictureUrl: string | null;
  coordinatorOpportunities: AccessibleOpportunity[];
  accessibleOpportunities: AccessibleOpportunity[] | null;
  setAuthData: (token: string, user: User) => void;
  setUserDetailsV2: (details: UserDetailsV2) => void;
  logout: () => void;
  setUserType: (userType: string) => void;
  getCurrentUser: () => User | null;
  getCurrentToken: () => string | null;
  getUserType: () => string | undefined;
  setUserProfile: (profile: UserProfile) => void;
  getUserProfile: () => UserProfile | null;
  setLogoUrl: (url: string) => void;
  getLogoUrl: () => string | null;
  getUserFullName: () => string;
  getUserFirstName: () => string;
  setUserFirstName: (firstName: string) => void;
  getUserLastName: () => string;
  setUserLastName: (lastName: string) => void;
  getUserProfilePictureUrl: () => string | null;
  setUserProfilePictureUrl: (url: string) => void;
  setCoordinatorOpportunities: (opportunities: AccessibleOpportunity[]) => void;
  getCoordinatorOpportunities: () => AccessibleOpportunity[];
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  getIsAuthenticated: () => boolean;
  setAccessibleOpportunities: (opportunities: AccessibleOpportunity[]) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      logoUrl: null,
      userProfile: null,
      userProfilePictureUrl: null,
      coordinatorOpportunities: [],
      accessibleOpportunities: null,
      setIsAuthenticated: (isAuthenticated: boolean) => {
        set({ isAuthenticated });
      },
      getIsAuthenticated: () => get().isAuthenticated,
      setAuthData: (token: string, user: User) => {
        set({
          user,
          token,
          isAuthenticated: get().isAuthenticated,
          userProfilePictureUrl: user?.profile_picture_url || null,
        });
      },

      setUserDetailsV2: (userDetailsV2: UserDetailsV2) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, userDetailsV2 } });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          logoUrl: null,
          userProfile: null,
          userProfilePictureUrl: null,
          coordinatorOpportunities: [],
          accessibleOpportunities: null,
        });
        useUIStore.getState().resetUnread();
        useOnboardingFlowStore.getState().reset();
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
      getUserType: () => {
        const user = get().user;
        const v2 = user?.userDetailsV2;
        if (v2?.user_types?.[0]?.key) return v2.user_types[0].key;
        const firstType = user?.user_types?.[0];
        return typeof firstType === "string" ? firstType : undefined;
      },

      setLogoUrl: (url: string) => {
        set({ logoUrl: url });
      },
      getLogoUrl: () =>
        get().logoUrl || get().userProfile?.organisation?.logo_url || null,

      setUserProfile: (profile: UserProfile) => {
        set({ userProfile: profile });
      },
      getUserProfile: () => get().userProfile,
      getUserFullName: () => {
        const { user } = get();
        const v2 = user?.userDetailsV2;
        if (v2?.first_name || v2?.last_name) {
          return `${v2.first_name || ""} ${v2.last_name || ""}`.trim();
        }
        if (!user?.first_name || !user?.last_name) return "";
        return `${user.first_name} ${user.last_name}`.trim();
      },

      getUserFirstName: () => {
        const { user } = get();
        return user?.userDetailsV2?.first_name || user?.first_name || "";
      },

      getUserLastName: () => {
        const { user } = get();
        return user?.userDetailsV2?.last_name || user?.last_name || "";
      },

      setUserFirstName: (firstName: string) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, first_name: firstName } });
      },

      setUserLastName: (lastName: string) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, last_name: lastName } });
      },

      getUserProfilePictureUrl: () => {
        const { userProfilePictureUrl, user, userProfile } = get();
        const v2 = user?.userDetailsV2;
        return (
          userProfilePictureUrl ||
          v2?.profile_picture_url ||
          v2?.profile_picture ||
          user?.profile_picture_url ||
          userProfile?.profile_picture_url ||
          null
        );
      },

      setUserProfilePictureUrl: (url: string) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, profile_picture_url: url },
            userProfilePictureUrl: url,
          });
        } else {
          set({ userProfilePictureUrl: url });
        }
      },
      setCoordinatorOpportunities: (opportunities: AccessibleOpportunity[]) => {
        set({ coordinatorOpportunities: opportunities });
      },

      getCoordinatorOpportunities: () => {
        return get().coordinatorOpportunities;
      },

      setAccessibleOpportunities: (opportunities: AccessibleOpportunity[]) => {
        set({ accessibleOpportunities: opportunities });
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
        userProfilePictureUrl: state.userProfilePictureUrl,
      }),
    }
  )
);
