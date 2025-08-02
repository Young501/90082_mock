import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/user";
import { UserProfile } from "@/types/shared";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  logoUrl: string | null;
  userProfile: UserProfile | null;
  userProfilePictureUrl: string | null;
  coordinatorOpportunities: string[];
  inviteToken: string | null;
  inviteOpportunityId: string | null;
  setAuthData: (token: string, user: User) => void;
  logout: () => void;
  setUserType: (userType: string) => void;
  getCurrentUser: () => User | null;
  getCurrentToken: () => string | null;
  getUserType: () => string | undefined;
  signupSelectedUserType: string | null;
  setSignupSelectedUserType: (userType: string | null) => void;
  getSignupSelectedUserType: () => string | null;
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
  setInviteData: (token: string, opportunityId: string) => void;
  getInviteData: () => { token: string | null; opportunityId: string | null };
  clearInviteData: () => void;
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
      userProfilePictureUrl: null,
      coordinatorOpportunities: [],
      inviteToken: null,
      inviteOpportunityId: null,
      setAuthData: (token: string, user: User) => {
        set({
          user,
          token,
          isAuthenticated: true,
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
          inviteToken: null,
          inviteOpportunityId: null,
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
      getLogoUrl: () => get().logoUrl || get().userProfile?.logo_url || null,

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

      setInviteData: (token: string, opportunityId: string) => {
        set({ inviteToken: token, inviteOpportunityId: opportunityId });
      },

      getInviteData: () => {
        const { inviteToken, inviteOpportunityId } = get();
        return { token: inviteToken, opportunityId: inviteOpportunityId };
      },

      clearInviteData: () => {
        set({ inviteToken: null, inviteOpportunityId: null });
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
        inviteToken: state.inviteToken,
        inviteOpportunityId: state.inviteOpportunityId,
      }),
    }
  )
);



