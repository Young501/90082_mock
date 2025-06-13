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
import Image from "next/image"
import LinkIcon from "@/assets/LinkIcon.svg"
// import {Link}

const Header = ({ isProtected }: { isProtected?: boolean }) => {
    const isMobile = useBreakpointValue({ base: true, md: false })

  return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, width: "100%", maxHeight: "126px" }}>
          {isProtected ? 
               (<Box
                    bg="#002157"
                    h="126px"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    px={{ base: 4, lg: 16 }}
                >
                    <Image alt="logo" src="/uni.png" width={300} height={80} />

                    <HStack gap={10} display={{ base: "none", md: "flex" }}>
                  <Link href="/login">
                        <Text fontSize="18px" fontWeight="700" color="white">
                            SIGN IN
                      </Text>
                  </Link>
                  <Link href="/home">
                        <Text fontSize="18px" fontWeight="700" color="white">
                            HOME
                        </Text> 
                      </Link>
                      <Link href="/discover">
                        <Text fontSize="18px" fontWeight="700" color="white">
                        DISCOVER
                          </Text>
                  </Link>
                  <Link href="/profile">
                        <Text fontSize="18px" fontWeight="700" color="white">
                            PROFILE
                        </Text> 
                      </Link>
                      <Link href="/inbox">
                        <Text fontSize="18px" fontWeight="700" color="white">
                            INBOX
                      </Text>
                  </Link>
                  <Link href="/signup">
                        <Image src={LinkIcon} alt="link" width={30} height={30} />
                  </Link>
                    </HStack>
                </Box>)
            
           : (
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
                  <Link href="/user-type">
                        <Text fontSize="13px" fontWeight="700" color="black">
                            SIGN UP
                        </Text> 
                  </Link>
                    </HStack>
                </Box>
           )
           
            }
    </div>
  )
}

export default Header
