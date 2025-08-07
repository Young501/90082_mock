
import { ReactNode } from "react";
import Providers from "@/components/ui/providers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicons/favicon.ico" />
        <link rel="shortcut icon" href="/favicons/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
        <link rel="manifest" href="/favicons/site.webmanifest" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        <title>Unniconnected</title>
        <meta name="description" content="Unniconnected" />
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
    </html>
  );
}


