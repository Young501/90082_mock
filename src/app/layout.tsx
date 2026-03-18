import { ReactNode } from "react";
import { Manrope } from "next/font/google";
import Providers from "@/components/ui/providers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={manrope.className}>
      <head>
        <link rel="icon" href="/favicons/favicon.ico" />
        <link rel="shortcut icon" href="/favicons/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          href="/favicons/favicon-16x16.png"
          sizes="16x16"
        />
        <link
          rel="icon"
          type="image/png"
          href="/favicons/favicon-32x32.png"
          sizes="32x32"
        />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
        <link rel="manifest" href="/favicons/site.webmanifest" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <title>Uniconnected</title>
        <meta name="description" content="Uniconnected" />
      </head>
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
      <GoogleAnalytics
        gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ""}
      />
    </html>
  );
}
