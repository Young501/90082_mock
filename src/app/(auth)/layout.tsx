"use client"

import {
    Box,
    Container,
    useBreakpointValue,
} from "@chakra-ui/react"
import { ReactNode } from "react"
import Footer from "@/components/Layouts/Footer"
import Header from "@/components/Layouts/Header"

interface AuthLayoutProps {
    children: ReactNode
}

export default function Layout({
    children,
}: AuthLayoutProps) {
    const isMobile = useBreakpointValue({ base: true, lg: false })
    const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" })

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
