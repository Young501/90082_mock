"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  PROFILE_COLORS,
  PROFILE_TINT_COLORS,
  PROFILE_DARK_COLORS,
  PROFILE_SECONDARY_COLORS,
} from "@/theme/theme";

export function useProfileColor() {
  const userType = useAuthStore((s) => s.user?.user_types?.[0]);
  return userType === "organisation"
    ? PROFILE_COLORS.organisation
    : userType === "coordinator"
      ? PROFILE_COLORS.coordinator
      : PROFILE_COLORS.student;
}

/**
 * Sets profile color CSS variables based on user type.
 * Use `profile.500` (primary), `border.100` (profile border) in components.
 */
export function ProfileThemeProvider({ children }: { children: ReactNode }) {
  const userType = useAuthStore((s) => s.user?.user_types?.[0]);

  useEffect(() => {
    const root = document.documentElement;
    const type =
      userType === "organisation"
        ? "organisation"
        : userType === "coordinator"
          ? "coordinator"
          : "student";

    const color = PROFILE_COLORS[type];
    const border = PROFILE_TINT_COLORS[type];
    const dark = PROFILE_DARK_COLORS[type];
    const secondary = PROFILE_SECONDARY_COLORS[type];
    root.style.setProperty("--profile-500", color);
    root.style.setProperty("--border-100", border);
    root.style.setProperty("--profile-dark", dark);
    root.style.setProperty("--secondary-100", secondary);
  }, [userType]);

  return <>{children}</>;
}
