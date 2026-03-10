import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, UserDetailsV2 } from "@/types/user";
import {
  UserProfile,
  Organisation,
} from "@/types/shared";
import { AccessibleOpportunity } from "@/types/opportunities";
import { SubscriptionStatus } from "@/types/subscription";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  logoUrl: string | null;
  userProfile: UserProfile | null;
  userProfilePictureUrl: string | null;
  coordinatorOpportunities: string[];
  isOrganisationMemberOnboarding: boolean;
  /** Phase to show when redirecting to onboarding: "user" | "organisation" | null (derive from data) */
  onboardingPhase: "user" | "organisation" | null;
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
  setCoordinatorOpportunities: (opportunities: string[]) => void;
  getCoordinatorOpportunities: () => string[];
  setIsOrganisationMemberOnboarding: (isMember: boolean) => void;
  getIsOrganisationMemberOnboarding: () => boolean;
  setOnboardingPhase: (phase: "user" | "organisation" | null) => void;
  getOnboardingPhase: () => "user" | "organisation" | null;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  getIsAuthenticated: () => boolean;
  setAccessibleOpportunities: (opportunities: AccessibleOpportunity[]) => void;
  hasUnreadMessages: boolean;
  setHasUnreadMessages: (hasUnread: boolean) => void;
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
      isOrganisationMemberOnboarding: false,
      onboardingPhase: null,
      accessibleOpportunities: null,
      hasUnreadMessages: false,
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
          isOrganisationMemberOnboarding: false,
          onboardingPhase: null,
          accessibleOpportunities: null,
          hasUnreadMessages: false,
        });
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
      setCoordinatorOpportunities: (opportunities: string[]) => {
        set({ coordinatorOpportunities: opportunities });
      },

      getCoordinatorOpportunities: () => {
        return get().coordinatorOpportunities;
      },

      setIsOrganisationMemberOnboarding: (isMember: boolean) => {
        set({ isOrganisationMemberOnboarding: isMember });
      },
      getIsOrganisationMemberOnboarding: () => {
        return get().isOrganisationMemberOnboarding;
      },
      setOnboardingPhase: (phase: "user" | "organisation" | null) => {
        set({ onboardingPhase: phase });
      },
      getOnboardingPhase: () => {
        return get().onboardingPhase;
      },

      setAccessibleOpportunities: (opportunities: AccessibleOpportunity[]) => {
        set({ accessibleOpportunities: opportunities });
      },
      setHasUnreadMessages: (hasUnread: boolean) => {
        if (get().hasUnreadMessages !== hasUnread) {
          set({ hasUnreadMessages: hasUnread });
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
        userProfilePictureUrl: state.userProfilePictureUrl,
        coordinatorOpportunities: state.coordinatorOpportunities,
        isOrganisationMemberOnboarding: state.isOrganisationMemberOnboarding,
        accessibleOpportunities: state.accessibleOpportunities,
        hasUnreadMessages: state.hasUnreadMessages,
      }),
    }
  )
);
