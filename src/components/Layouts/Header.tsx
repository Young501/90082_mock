import {
  Box,
  Container,
  HStack,
  Text,
  VStack,
  useBreakpointValue,
  Button,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { UserRound, Menu, X } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";
import Image from "next/image";
import {
  LinkIcon,
  InboxIcon,
  FolderIcon,
  hamburgerIcon,
  closeIcon,
} from "@/assets";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth";
import { useAuthStore } from "@/store/authStore";

const Header = ({ isProtected }: { isProtected?: boolean }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const router = useRouter();
  const { handleLogout } = useAuth();
  const { logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleUserLogout = async () => {
    await handleLogout();
    logout();
    setIsMobileMenuOpen(false);
  };

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  const Overlay = () => (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="blackAlpha.500"
      zIndex={1001}
      opacity={isMobileMenuOpen ? 1 : 0}
      visibility={isMobileMenuOpen ? "visible" : "hidden"}
      transition="all 0.3s ease"
      onClick={() => setIsMobileMenuOpen(false)}
    />
  );

  const MobileMenu = () => (
    <>
      <Overlay />
      <Box
        position="fixed"
        top={0}
        right={0}
        bottom={0}
        width="100vw"
        bg={isProtected ? "#002157" : "white"}
        zIndex={1002}
        transform={isMobileMenuOpen ? "translateX(0)" : "translateX(100%)"}
        transition="transform 0.3s ease"
        boxShadow="lg"
        overflowY="auto"
      >
        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="flex-end"
          p={4}
        >
          <Button
            aria-label="Close menu"
            variant="ghost"
            color={isProtected ? "white" : "black"}
            size="sm"
            onClick={handleMenuToggle}
          >
            <X size={34} color={isProtected ? "white" : "black"} />
          </Button>
        </Box>

        <Box p={0}>
          {isProtected ? (
            <VStack gap={0} p={6} align="stretch">
              <Link href="/home" onClick={handleMenuItemClick}>
                <Box
                  display="flex"
                  pb={6}
                  justifyContent="center"
                  alignItems="center"
                  borderBottom="1px solid rgba(255, 255, 255, 0.26)"
                  transition="background 0.2s"
                >
                  <Image src="/uni.png" alt="logo" width={164} height={34} />
                </Box>
              </Link>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                alignItems="center"
                gap={6}
                h="100%"
                pt={6}
              >
                <Link href="/home" onClick={handleMenuItemClick}>
                  <Text py={4} fontSize="16px" fontWeight="600" color="white">
                    HOME
                  </Text>
                </Link>

                <Link href="/discover" onClick={handleMenuItemClick}>
                  <Text py={4} fontSize="16px" fontWeight="600" color="white">
                    DISCOVER
                  </Text>
                </Link>

                <Link href="/profile" onClick={handleMenuItemClick}>
                  <Text py={4} fontSize="16px" fontWeight="600" color="white">
                    PROFILE
                  </Text>
                </Link>

                <Link href="/inbox" onClick={handleMenuItemClick}>
                  <Box py={4}>
                    <Image src={InboxIcon} alt="inbox" width={24} height={24} />
                  </Box>
                </Link>

                <Link href="/folder" onClick={handleMenuItemClick}>
                  <Box py={4}>
                    <Image
                      src={FolderIcon}
                      alt="folder"
                      width={24}
                      height={24}
                    />
                  </Box>
                </Link>

                <Button
                  bg="transparent"
                  p={0}
                  w="100%"
                  onClick={handleUserLogout}
                >
                  <Box py={4}>
                    <Image src={LinkIcon} alt="logout" width={24} height={24} />
                  </Box>
                </Button>

                <Box pt={4}>
                  <Text
                    fontSize="12px"
                    color="#ffffff"
                    textAlign="center"
                    textDecoration="underline"
                  >
                    <Link href="/contact">Need Help ? Contact Us</Link>
                  </Text>
                  <Text fontSize="12px" color="#ffffff" textAlign="center">
                    Copyright
                  </Text>
                  <Text fontSize="12px" color="#ffffff" textAlign="center">
                    ©Uniconnected {new Date().getFullYear()}
                  </Text>
                </Box>
              </Box>
            </VStack>
          ) : (
            <VStack gap={0} align="stretch">
              <Box p={6} borderBottom="1px solid rgba(0, 0, 0, 0.1)">
                <HStack gap={3}>
                  <UserRound size={20} color="black" />
                  <Text fontSize="16px" fontWeight="600" color="black">
                    Account
                  </Text>
                </HStack>
              </Box>

              <Link href="/login" onClick={handleMenuItemClick}>
                <Box
                  p={6}
                  borderBottom="1px solid rgba(0, 0, 0, 0.1)"
                  transition="background 0.2s"
                >
                  <Text fontSize="16px" fontWeight="600" color="black">
                    LOGIN
                  </Text>
                </Box>
              </Link>

              <Link href="/user-type" onClick={handleMenuItemClick}>
                <Box
                  p={6}
                  borderBottom="1px solid rgba(0, 0, 0, 0.1)"
                  transition="background 0.2s"
                >
                  <Text fontSize="16px" fontWeight="600" color="black">
                    SIGN UP
                  </Text>
                </Box>
              </Link>
            </VStack>
          )}
        </Box>
      </Box>
    </>
  );

  return (
    <>
      {isProtected ? (
        <>
          <Box
            bg="#002157"
            h={`${isMobile ? "80px" : "126px"}`}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={{ base: 4, lg: 16 }}
            position="fixed"
            top={0}
            left={0}
            right={0}
            zIndex={1000}
            width="100%"
            maxHeight="126px"
          >
            {isMobile ? (
              <Image alt="logo" src="/uni.png" width={164} height={34} />
            ) : (
              <Image alt="logo" src="/uni.png" width={300} height={80} />
            )}

            <HStack gap={10} display={{ base: "none", md: "flex" }}>
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
                <Image src={InboxIcon} alt="inbox" width={30} height={30} />
              </Link>
              <Link href="/folder">
                <Image src={FolderIcon} alt="folder" width={30} height={30} />
              </Link>
              <Button bg="transparent" p={0} onClick={() => handleUserLogout()}>
                <Image src={LinkIcon} alt="link" width={30} height={30} />
              </Button>
            </HStack>

            <Button
              aria-label="Open menu"
              variant="ghost"
              color="white"
              display={{ base: "flex", md: "none" }}
              onClick={handleMenuToggle}
            >
              <Image src={hamburgerIcon} alt="menu" width={30} height={30} />
            </Button>
          </Box>

          {isMobile && <MobileMenu />}
        </>
      ) : (
        <>
          <Box
            bg="rgba(255, 255, 255, 0.91)"
            h="126px"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={{ base: 4, lg: 8 }}
            position="fixed"
            top={0}
            left={0}
            right={0}
            zIndex={1000}
            width="100%"
            maxHeight="126px"
          >
            <Logo variant="header" width="200px" height="60px" />

            <Button
              aria-label="Open menu"
              variant="ghost"
              color="black"
              display={{ base: "flex", md: "none" }}
              onClick={handleMenuToggle}
            >
              <Menu size={30} color="black" />
            </Button>

            <HStack gap={6} display={{ base: "none", md: "flex" }}>
              <UserRound size={20} color="black" />
              <Link href="/login">
                <Text fontSize="13px" fontWeight="700" color="black">
                  LOGIN
                </Text>
              </Link>
              <Link href="/user-type">
                <Text fontSize="13px" fontWeight="700" color="black">
                  SIGN UP
                </Text>
              </Link>
            </HStack>
          </Box>

          {isMobile && <MobileMenu />}
        </>
      )}
    </>
  );
};

export default Header;
