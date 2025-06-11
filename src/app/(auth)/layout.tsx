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
        <div style={{ 
            minHeight: "100vh", 
            display: "flex", 
            flexDirection: "column",
            position: "relative",
            width: "100%"
        }}>
            <Header />
            
            <div style={{ 
                flex: 1,
                display: "flex",
                flexDirection: "column",
                marginTop: "126px",
                minHeight: "calc(100vh - 305px)",
                overflow: "auto",
                padding: "0 169px 0 138px"
            }}>
                <Container maxW={containerMaxW} 
                                    px={0}

                    style={{ flex: 1 }}>
                    {children}
                </Container>
            </div>

            <Footer />
        </div>
    )
}
