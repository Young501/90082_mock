"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import Loader from "./Loader";
import { Box, Text } from "@chakra-ui/react";

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
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        h="100vh"
        gap={4}
      >
        <Loader />
        <Text fontSize="2xl" fontWeight="bold">
          Loading...
        </Text>
      </Box>
    );
  }

  if (!isAuthenticated || !token) {
    return null;
  }

  return <>{children}</>;
}
