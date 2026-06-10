import { create } from "zustand";

export interface OnboardingFlowState {
  onboardingPhase: "user" | "organisation" | null;
  setOnboardingPhase: (phase: "user" | "organisation" | null) => void;
  reset: () => void;
}

export const useOnboardingFlowStore = create<OnboardingFlowState>()((set) => ({
  onboardingPhase: null,
  setOnboardingPhase: (phase) => set({ onboardingPhase: phase }),
  reset: () => set({ onboardingPhase: null }),
}));
