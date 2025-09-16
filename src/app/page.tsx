"use client";
import { redirect } from "next/navigation";
import { useAuthStore } from "@/store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, isAuthenticated, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && token && user) {
      const userType = user.user_types?.[0];

      if (userType === "coordinator") {
        router.push("/dashboard");
      } else if (userType === "organisation" || userType === "student") {
        router.push("/discover");
      }
    } else {
      router.push("/user-type/");
    }
  }, [isAuthenticated, token, user, router]);

  return null;
}
