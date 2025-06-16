"use client";

import { ReactNode } from "react";
import Providers from "@/components/ui/providers";
import { ToastContainer } from "react-toastify";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <ToastContainer />
          {children}
        </Providers>
      </body>
    </html>
  );
}
