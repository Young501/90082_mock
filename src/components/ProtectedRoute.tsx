"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/api";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading && !isAuthenticated && !token) {
        router.push("/login");
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [isAuthenticated, token, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !token) {
    return null;
  }

  return <>{children}</>;
}
