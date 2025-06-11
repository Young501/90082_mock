import { ReactNode } from "react"
import AuthLayout from "@/components/Layouts/AuthLayout"

export default function LoginLayout({ children }: { children: ReactNode }) {
    return <AuthLayout>{children}</AuthLayout>
} 