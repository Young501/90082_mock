import {
    Box,
    Container,
    HStack,
    Text,
    VStack,
    useBreakpointValue,
} from "@chakra-ui/react"
import React from 'react'
import { UserRound } from "lucide-react"
import { ReactNode } from "react"
import Link from "next/link"
import Logo from "@/components/Logo"
// import {Link}

const Header = () => {
    const isMobile = useBreakpointValue({ base: true, md: false })

  return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, width: "100%", maxHeight: "126px" }}>
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
                  <Link href="/login">
                        <Text fontSize="13px" fontWeight="700" color="black">
                            SIGN IN
                      </Text>
                  </Link>
                  <Link href="/signup">
                        <Text fontSize="13px" fontWeight="700" color="black">
                            SIGN UP
                        </Text> 
                  </Link>
                    </HStack>
                </Box>
    </div>
  )
}

export default Header
