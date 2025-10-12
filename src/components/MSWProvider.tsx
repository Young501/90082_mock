"use client";

import { useEffect, useState } from "react";

/**
 * MSW Provider Component
 * Enables Mock Service Worker in development mode
 * Add this to your root layout to enable API mocking
 */
export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initMocks() {
      if (process.env.NODE_ENV === "development") {
        const { enableMocking } = await import("../../mocks");
        await enableMocking();
        console.log("✅ MSW Provider: Mocking enabled");
      }
      setIsReady(true);
    }

    initMocks();
  }, []);

  // In development, wait for MSW to be ready before rendering
  // This prevents race conditions where requests are made before MSW is set up
  if (process.env.NODE_ENV === "development" && !isReady) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}
