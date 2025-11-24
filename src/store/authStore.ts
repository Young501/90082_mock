import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/user";
import {
  UserProfile,
  Organisation,
  tempOrganisationUser,
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
  tempOrganisationUser: tempOrganisationUser | null;
  tempOrganisation: Organisation | null;
  isOrganisationMemberOnboarding: boolean;
  accessibleOpportunities: AccessibleOpportunity[] | null;
  setAuthData: (token: string, user: User) => void;
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
  setTempOrganisation: (organisation: Organisation) => void;
  getTempOrganisation: () => Organisation | null;
  clearTempOrganisation: () => void;
  setTempOrganisationUser: (user: tempOrganisationUser) => void;
  getTempOrganisationUser: () => tempOrganisationUser | null;
  clearTempOrganisationUser: () => void;
  setIsOrganisationMemberOnboarding: (isMember: boolean) => void;
  getIsOrganisationMemberOnboarding: () => boolean;
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
      tempOrganisation: null,
      tempOrganisationUser: null,
      isOrganisationMemberOnboarding: false,
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

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          logoUrl: null,
          userProfile: null,
          userProfilePictureUrl: null,
          coordinatorOpportunities: [],
          tempOrganisation: null,
          tempOrganisationUser: null,
          isOrganisationMemberOnboarding: false,
          accessibleOpportunities: null,
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
      getUserType: () => get().user?.user_types?.[0],

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
        return (
          get().userProfilePictureUrl || get().user?.profile_picture_url || null
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

      setTempOrganisation: (organisation: Organisation) => {
        set({ tempOrganisation: organisation });
      },
      getTempOrganisation: () => {
        return get().tempOrganisation;
      },
      clearTempOrganisation: () => {
        set({ tempOrganisation: null });
      },
      setTempOrganisationUser: (user: tempOrganisationUser) => {
        set({ tempOrganisationUser: user });
      },
      clearTempOrganisationUser: () => {
        set({ tempOrganisationUser: null });
      },
      getTempOrganisationUser: () => {
        return get().tempOrganisationUser;
      },
      setIsOrganisationMemberOnboarding: (isMember: boolean) => {
        set({ isOrganisationMemberOnboarding: isMember });
      },
      getIsOrganisationMemberOnboarding: () => {
        return get().isOrganisationMemberOnboarding;
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
        coordinatorOpportunities: state.coordinatorOpportunities,
        tempOrganisation: state.tempOrganisation,
        tempOrganisationUser: state.tempOrganisationUser,
        isOrganisationMemberOnboarding: state.isOrganisationMemberOnboarding,
        accessibleOpportunities: state.accessibleOpportunities,
      }),
    }
  )
);
