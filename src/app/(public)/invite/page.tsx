"use client";
import { useAuth } from "@/hooks/auth";
import { useAuthStore } from "@/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function InvitePage() {
  const { isAuthenticated } = useAuthStore();

  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/discover/");
    } else {
      router.replace("/user-type/");
    }
  }, [router, isAuthenticated]);

  return null;
}
