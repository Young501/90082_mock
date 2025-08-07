
import { ReactNode } from "react";
import Providers from "@/components/ui/providers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: 'Unniconnected',
    template: '%s | Unniconnected'
  },
  description: 'Unniconnected',
  icons: {
    icon: '/favicons/favicon.ico',
    shortcut: '/favicons/favicon.ico',
    apple: '/favicons/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon',
      url: '/favicons/apple-touch-icon.png',
    },
  },
  manifest: '/favicons/site.webmanifest',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            style={{ zIndex: 10000 }}
            limit={3}
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
