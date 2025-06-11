"use client"

import {
    Box,
    Container,
    useBreakpointValue,
} from "@chakra-ui/react"
import { ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import Footer from "@/components/Layouts/Footer"
import Header from "@/components/Layouts/Header"
import { getAuthData } from "@/api"

interface AuthLayoutProps {
    children: ReactNode
    maxWidth?: string
}

export default function Layout({
    children,
    maxWidth = "1512px",
}: AuthLayoutProps) {
    const router = useRouter()
    const isMobile = useBreakpointValue({ base: true, lg: false })
    const containerMaxW = useBreakpointValue({ base: "100%", lg: maxWidth })

    useEffect(() => {
        const { isAuthenticated } = getAuthData()
        if (!isAuthenticated) {
            router.push('/login')
        }
    }, [router])

    return (
        <div style={{ minHeight: "100vh", position: "relative", width: "100%" }}>
            <Header />
            <div style={{ 
                padding: 0, 
                height: "100%", 
                display: "flex", 
                flexDirection: "column",
                paddingTop: "80px"
            }}>
                <Container maxW={containerMaxW} p={0} h="100%" style={{ flex: 1 }}>
                    {children}
                </Container>
                <Footer />
            </div>
        </div>
    )
}
