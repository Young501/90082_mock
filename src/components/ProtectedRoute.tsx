"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import Loader from "./Loader";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading && !isAuthenticated && !token) {
        router.push("/login/");
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [isAuthenticated, token, isLoading, router]);

  if (isLoading) {
    return <Loader type="page" />;
  }

  if (!isAuthenticated || !token) {
    return null;
  }

  return <>{children}</>;
}
