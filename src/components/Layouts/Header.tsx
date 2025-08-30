import {
  Box,
  Container,
  HStack,
  Text,
  VStack,
  useBreakpointValue,
  Button,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { UserRound, Menu, X, HelpCircle } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";
import Image from "next/image";
import { useAuth } from "@/hooks/auth";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";

interface MenuItem {
  label: string;
  href: string;
  isCoordinator: boolean;
  isOrganisation: boolean;
  isStudent: boolean;
  isProtected: boolean;
}

const Header = ({ isProtected }: { isProtected?: boolean }) => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const router = useRouter();
  const { handleLogout } = useAuth();
  const { logout, getUserType } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchParams = useSearchParams();

  const userType = getUserType();
  const isCoordinator = userType === "coordinator";
  const isOrganisation = userType === "organisation";
  const isStudent = userType === "student";

  const getSignupLink = () => {
    const inviteToken = searchParams.get("invite_token");
    const opportunityId = searchParams.get("opportunity_id");

    if (inviteToken && opportunityId) {
      return `/user-type?signup=true&invite_token=${inviteToken}&opportunity_id=${opportunityId}`;
    }
    return "/user-type/";
  };

  const MENU_ITEMS: MenuItem[] = [
    {
      label: "DASHBOARD",
      href: "/dashboard/",
      isCoordinator: true,
      isOrganisation: false,
      isStudent: false,
      isProtected: true,
    },
    {
      label: "DISCOVER",
      href: "/discover/",
      isCoordinator: false,
      isOrganisation: true,
      isStudent: true,
      isProtected: true,
    },
    {
      label: "PROFILE",
      href: "/profile/",
      isCoordinator: true,
      isOrganisation: true,
      isStudent: true,
      isProtected: true,
    },
    {
      label: "FOLDERS",
      href: "/folders/",
      isCoordinator: false,
      isOrganisation: true,
      isStudent: true,
      isProtected: true,
    },
    {
      label: "CONTACT",
      href: "/contact/",
      isCoordinator: true,
      isOrganisation: true,
      isStudent: true,
      isProtected: true,
    },
    {
      label: "LOGOUT",
      href: "/logout/",
      isCoordinator: true,
      isOrganisation: true,
      isStudent: true,
      isProtected: true,
    },
    {
      label: "LOGIN",
      href: "/login/",
      isCoordinator: false,
      isOrganisation: false,
      isStudent: false,
      isProtected: false,
    },
    {
      label: "SIGN UP",
      href: getSignupLink(),
      isCoordinator: false,
      isOrganisation: false,
      isStudent: false,
      isProtected: false,
    },
  ];

  const getMenuItems = () => {
    if (!isProtected) {
      return MENU_ITEMS.filter((item) => !item.isProtected);
    }
    if (isCoordinator) {
      return MENU_ITEMS.filter(
        (item) => item.isCoordinator && item.isProtected
      );
    }
    if (isOrganisation) {
      return MENU_ITEMS.filter(
        (item) => item.isOrganisation && item.isProtected
      );
    }
    if (isStudent) {
      return MENU_ITEMS.filter((item) => item.isStudent && item.isProtected);
    }
    return [];
  };

  const renderMenuItem = (item: MenuItem, isMobile = false) => {
    if (item.label === "LOGOUT") {
      return (
        <Button
          key={item.label}
          bg="transparent"
          p={0}
          w={isMobile ? "100%" : undefined}
          onClick={handleUserLogout}
        >
          <Box py={isMobile ? 4 : 0}>
            <Image
              src="/assets/LinkIcon.svg"
              alt="logout"
              width={isMobile ? 24 : 30}
              height={isMobile ? 24 : 30}
            />
          </Box>
        </Button>
      );
    }
    if (item.label === "CONTACT") {
      return (
        <Link href={item.href} key={item.label} onClick={handleMenuItemClick}>
          <Box py={isMobile ? 4 : 0}>
            <HelpCircle size={isMobile ? 24 : 30} color="white" />
          </Box>
        </Link>
      );
    }
    if (item.label === "FOLDERS") {
      return (
        <Link href={item.href} key={item.label} onClick={handleMenuItemClick}>
          <Box py={isMobile ? 4 : 0}>
            <Image
              src="/assets/folder.svg"
              alt="folder"
              width={isMobile ? 24 : 30}
              height={isMobile ? 24 : 30}
            />
          </Box>
        </Link>
      );
    }
    if (item.label === "PROFILE") {
      return (
        <Link href={item.href} key={item.label} onClick={handleMenuItemClick}>
          <Text
            py={isMobile ? 4 : 0}
            fontSize={isMobile ? "16px" : "18px"}
            fontWeight={isMobile ? "600" : "700"}
            color={isProtected ? "white" : "black"}
          >
            {item.label}
          </Text>
        </Link>
      );
    }

    return (
      <Link href={item.href} key={item.label} onClick={handleMenuItemClick}>
        <Text
          py={isMobile ? 4 : 0}
          fontSize={isMobile ? "16px" : "18px"}
          fontWeight={isMobile ? "600" : "700"}
          color={isProtected ? "white" : "black"}
        >
          {item.label}
        </Text>
      </Link>
    );
  };

  const handleUserLogout = async () => {
    await handleLogout();
    logout();
    setIsMobileMenuOpen(false);
    router.push("/login");
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
          justifyContent="space-between"
          alignItems="center"
          p={4}
        >
          <Link href="/home/" onClick={handleMenuItemClick}>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              transition="background 0.2s"
            >
              <Logo variant="header" width="200px" height="60px" />
            </Box>
          </Link>
          <Button
            aria-label="Close menu"
            variant="ghost"
            color={isProtected ? "white" : "black"}
            size="sm"
            onClick={handleMenuToggle}
          >
            <Image
              src={
                isProtected ? "/assets/cancelwhite.svg" : "/assets/cancel.svg"
              }
              alt="close"
              width={20}
              height={20}
            />
          </Button>
        </Box>
        <Box p={0}>
          {isProtected ? (
            <VStack gap={0} p={6} align="stretch">
              <Link href="/home/" onClick={handleMenuItemClick}>
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
                {getMenuItems().map((item) => renderMenuItem(item, true))}
                <Box pt={4}>
                  <Text
                    fontSize="12px"
                    color="#ffffff"
                    textAlign="center"
                    textDecoration="underline"
                  >
                    <Link href="/contact/">Need Help ? Contact Us</Link>
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
              <Box p={6}>
                <HStack
                  gap={3}
                  pb={3}
                  borderBottom="1px solid rgba(0, 0, 0, 0.1)"
                >
                  <UserRound size={20} color="black" />
                  <Text fontSize="16px" fontWeight="600" color="black">
                    Account
                  </Text>
                </HStack>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={6}
                  h="100%"
                  pt={6}
                >
                  {getMenuItems().map((item) => renderMenuItem(item, true))}
                </Box>
              </Box>
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
            zIndex={9999}
            width="100%"
            maxHeight="126px"
          >
            {isMobile ? (
              <Image alt="logo" src="/uni.png" width={164} height={34} />
            ) : (
              <Image alt="logo" src="/uni.png" width={300} height={80} />
            )}
            <HStack gap={10} display={{ base: "none", md: "flex" }}>
              {getMenuItems().map((item) => renderMenuItem(item, false))}
            </HStack>
            <Button
              aria-label="Open menu"
              variant="ghost"
              color="white"
              display={{ base: "flex", md: "none" }}
              onClick={handleMenuToggle}
            >
              {isMobileMenuOpen ? (
                <Image
                  src="/assets/whitecancel.svg"
                  alt="menu"
                  width={20}
                  height={20}
                />
              ) : (
                <Image
                  src="/assets/hamburger.svg"
                  alt="menu"
                  width={20}
                  height={20}
                />
              )}
            </Button>
          </Box>
          {isMobile && <MobileMenu />}
        </>
      ) : (
        <>
          <Box
            bg="rgba(255, 255, 255, 0.91)"
            h="80px"
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
              <Image
                src="/assets/blackhamburger.svg"
                alt="menu"
                width={20}
                height={20}
              />
            </Button>
            <HStack gap={6} display={{ base: "none", md: "flex" }}>
              <UserRound size={20} color="black" />
              {getMenuItems().map((item) => renderMenuItem(item, false))}
            </HStack>
          </Box>
          {isMobile && <MobileMenu />}
        </>
      )}
    </>
  );
};

export default Header;
