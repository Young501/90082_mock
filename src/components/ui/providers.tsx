"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { ReactNode, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { system } from "@/theme/theme";
import "@fortawesome/fontawesome-free/css/all.css";
import { enableMocking } from "@/mocks";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error.message.includes("401") || error.message.includes("403")) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  const [isMockingEnabled, setIsMockingEnabled] = useState(false);

  useEffect(() => {
    // Enable MSW in development
    enableMocking().then(() => {
      setIsMockingEnabled(true);
    });
  }, []);

  // Don't render children until MSW is ready (in development)
  if (process.env.NODE_ENV === "development" && !isMockingEnabled) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#666",
        }}
      >
        Starting MSW...
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>
        <NextThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          {children}
        </NextThemeProvider>
      </ChakraProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
