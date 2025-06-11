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
    maxWidth?: string
}

export default function Layout({
    children,
    maxWidth = "1512px",
}: AuthLayoutProps) {
    const isMobile = useBreakpointValue({ base: true, lg: false })
    const containerMaxW = useBreakpointValue({ base: "100%", lg: maxWidth })

    return (
        <div style={{ minHeight: "100vh", position: "relative", width: "100%" }}>
            <div style={{position:"relative", display: "block"}}>
            <Header />
            </div>

            <div style={{ 
                padding: 0, 
                height: "100%",
                minHeight: "calc(100vh - 125px)",
                display: "flex",
                marginTop: "126px",
                flexDirection: "column",
                paddingTop: "43px",
                position: "relative",
                width: "100%"
            }}>
                <Container maxW={containerMaxW} px={138} h="100%" style={{ flex: 1 }}>
                    {children}
                </Container>
                <Footer />
            </div>
        </div>
    )
}
