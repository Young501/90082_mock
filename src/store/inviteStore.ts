import { create } from "zustand";
import { InviteState } from "@/types/invite";

export const useInviteStore = create<InviteState>((set) => ({
  isAccepting: false,
  acceptError: null,

  setAccepting: (isAccepting: boolean) => {
    set({ isAccepting });
  },

  setAcceptError: (error: string | null) => {
    set({ acceptError: error });
  },

  clearError: () => {
    set({ acceptError: null });
  },
}));
