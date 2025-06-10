"use client"

import {
    Box,
    Container,
    HStack,
    Text,
    VStack,
    useBreakpointValue,
} from "@chakra-ui/react"
import { UserRound } from "lucide-react"
import { ReactNode } from "react"
import Logo from "@/components/Logo"
import Footer from "./Footer"

interface AuthLayoutProps {
    children: ReactNode
    maxWidth?: string
}

export default function AuthLayout({
    children,
    maxWidth = "1512px",
}: AuthLayoutProps) {
    const isMobile = useBreakpointValue({ base: true, lg: false })
    const containerMaxW = useBreakpointValue({ base: "100%", lg: maxWidth })

    return (
        <Box h={["auto", "auto", "100vh"]} minH="100vh" position="relative">
            <Box p={0} h="100%" display="flex" flexDirection="column">
                <Box
                    bg="rgba(255, 255, 255, 0.91)"
                    h="126px"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    px={{ base: 4, lg: 8 }}
                >
                    <Logo variant="header" width="200px" height="60px" />

                    <UserRound
                        size={24}
                        color="black"
                        style={{ display: isMobile ? "block" : "none" }}
                    />
                    <HStack gap={6} display={{ base: "none", md: "flex" }}>
                        <UserRound size={20} color="black" />
                        <Text fontSize="13px" fontWeight="700" color="black">
                            SIGN IN
                        </Text>
                        <Text fontSize="13px" fontWeight="700" color="black">
                            SIGN UP
                        </Text>
                    </HStack>
                </Box>
                <Box flex={1} overflowY={["auto", "auto", "auto", "hidden"]}>
                    <Container maxW={containerMaxW} p={0} h="100%">
                        {children}
                    </Container>
                </Box>

                <Footer />
            </Box>
        </Box>
    )
}
