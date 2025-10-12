import {
  Box,
  Container,
  HStack,
  Text,
  VStack,
  useBreakpointValue,
  Button,
} from "@chakra-ui/react";
import React, { useState, useEffect, useRef } from "react";
import { UserRound, Menu, X, HelpCircle } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";
import Image from "next/image";
import { useAuth } from "@/hooks/auth";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAccessibleOpportunities } from "@/services/shared";
import { toast } from "react-toastify";

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
  const [isDiscoverDropdownOpen, setIsDiscoverDropdownOpen] = useState(false);
  const discoverDropdownRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const userType = getUserType();
  const isCoordinator = userType === "coordinator";
  const isOrganisation = userType === "organisation";
  const isStudent = userType === "student";
  const { data: accessibleOpps } = useAccessibleOpportunities();

  const isOnInviteOrOnboardingPage =
    pathname?.includes("/invite") ||
    pathname?.includes("/onboarding") ||
    pathname?.includes("/verify-email");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        discoverDropdownRef.current &&
        !discoverDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDiscoverDropdownOpen(false);
      }
    };

    if (isDiscoverDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDiscoverDropdownOpen]);

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
      const publicItems = MENU_ITEMS.filter((item) => !item.isProtected);
      if (isOnInviteOrOnboardingPage) {
        return publicItems.filter(
          (item) => item.label !== "LOGIN" && item.label !== "SIGN UP"
        );
      }
      return publicItems;
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
    if (item.label === "DISCOVER") {
      return renderDiscoverMenu(isMobile);
    }
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
          <Box
            py={isMobile ? 4 : 0}
            pos="relative"
            w={isMobile ? "24px" : "30px"}
            h={isMobile ? "24px" : "30px"}
          >
            <Image
              src="/assets/folder.svg"
              alt="folder"
              fill
              style={{ objectFit: "contain" }}
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

  const renderDiscoverMenu = (isMobile = false) => {
    const opps = accessibleOpps || [];

    if (!opps || opps.length === 0) {
      // Disabled state
      return (
        <Link href={`/discover/`} key="DISCOVER" onClick={handleMenuItemClick}>
          <Text
            py={isMobile ? 4 : 0}
            fontSize={isMobile ? "16px" : "18px"}
            fontWeight={isMobile ? "600" : "700"}
            color={isProtected ? "white" : "black"}
          >
            DISCOVER
          </Text>
        </Link>
      );
    }

    if (opps.length === 1) {
      const only = opps[0];
      return (
        <Link
          href={`/discover/?id=${only.id}`}
          key="DISCOVER"
          onClick={handleMenuItemClick}
        >
          <Text
            py={isMobile ? 4 : 0}
            fontSize={isMobile ? "16px" : "18px"}
            fontWeight={isMobile ? "600" : "700"}
            color={isProtected ? "white" : "black"}
          >
            DISCOVER
          </Text>
        </Link>
      );
    }

    // dropdown/list
    if (isMobile) {
      return (
        <Box key="DISCOVER">
          <Box
            py={4}
            fontSize="16px"
            fontWeight="600"
            color={isProtected ? "white" : "black"}
            cursor="pointer"
            onClick={() => setIsDiscoverDropdownOpen(!isDiscoverDropdownOpen)}
          >
            <HStack justify="center">
              <Text>DISCOVER</Text>
              <Box
                as="span"
                ml={1}
                mt={isDiscoverDropdownOpen ? "3px" : "-6px"}
                display="inline-block"
                width="10px"
                height="10px"
                borderRight="1.5px solid"
                borderBottom="1.5px solid"
                borderColor={isProtected ? "white" : "black"}
                transform={
                  isDiscoverDropdownOpen ? "rotate(225deg)" : "rotate(45deg)"
                }
                transformOrigin="center"
                transition="transform 0.2s, margin-top 0.2s"
              />
            </HStack>
          </Box>
          {isDiscoverDropdownOpen && (
            <VStack align="stretch" gap={2}>
              {opps.map((o) => (
                <Box
                  key={o.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMobileOpportunityClick(o.id);
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation();
                    handleMobileOpportunityClick(o.id);
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    handleMobileOpportunityClick(o.id);
                  }}
                  cursor="pointer"
                  position="relative"
                  zIndex={1003}
                >
                  <VStack align="center" gap={1}>
                    <Box
                      as="span"
                      fontSize="8px"
                      px={1.0}
                      py={0.5}
                      borderRadius="md"
                      bg={
                        o.enrollment_status === "enrolled"
                          ? "green.300"
                          : "yellow.200"
                      }
                      color="black"
                      fontWeight="bold"
                      minW="80px"
                      textAlign="center"
                    >
                      {o.enrollment_status === "enrolled"
                        ? "Enrolled"
                        : "Not Enrolled"}
                    </Box>
                    <Text
                      color={isProtected ? "white" : "black"}
                      fontWeight="bold"
                      fontSize="15px"
                      textAlign="center"
                    >
                      {o.title || `Opportunity ${o.id}`}
                    </Text>
                  </VStack>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      );
    }

    // Desktop dropdown (simple custom popover)
    return (
      <Box key="DISCOVER" position="relative" ref={discoverDropdownRef}>
        <HStack
          py={0}
          fontSize="18px"
          fontWeight="700"
          color={isProtected ? "white" : "black"}
          cursor="pointer"
          onClick={() => setIsDiscoverDropdownOpen(!isDiscoverDropdownOpen)}
        >
          <Text>DISCOVER</Text>
          <Box
            as="span"
            ml={1}
            mt={isDiscoverDropdownOpen ? "3px" : "-6px"}
            display="inline-block"
            width="10px"
            height="10px"
            borderRight="1.5px solid white"
            borderBottom="1.5px solid white"
            transform={
              isDiscoverDropdownOpen ? "rotate(225deg)" : "rotate(45deg)"
            }
            transformOrigin="center"
            transition="transform 0.2s, margin-top 0.2s"
          />
        </HStack>
        {isDiscoverDropdownOpen && (
          <Box
            position="absolute"
            top="calc(100% + 8px)"
            left={0}
            minW="280px"
            bg={isProtected ? "white" : "white"}
            color="black"
            borderRadius="md"
            boxShadow="lg"
            zIndex={10000}
            p={2}
          >
            <VStack align="stretch" gap={1}>
              {opps.map((o) => (
                // Navigate to opportunity details page
                <Link
                  href={`/discover/?id=${o.id}`}
                  key={o.id}
                  onClick={handleMenuItemClick}
                >
                  <VStack
                    _hover={{ bg: "gray.100" }}
                    borderRadius="md"
                    px={3}
                    py={2}
                    align="stretch"
                    gap={1}
                  >
                    <Box
                      as="span"
                      fontSize="10px"
                      px={1.5}
                      py={0.5}
                      borderRadius="md"
                      bg={
                        o.enrollment_status === "enrolled"
                          ? "green.300"
                          : "yellow.200"
                      }
                      color={
                        o.enrollment_status === "enrolled" ? "black" : "black"
                      }
                      fontWeight="bold"
                      alignSelf="flex-start"
                      minW="80px"
                      textAlign="center"
                    >
                      {o.enrollment_status === "enrolled"
                        ? "Enrolled"
                        : "Not Enrolled"}
                    </Box>
                    <Text truncate fontWeight="bold" fontSize="16px">
                      {o.title || `Opportunity ${o.id}`}
                    </Text>
                  </VStack>
                </Link>
              ))}
            </VStack>
          </Box>
        )}
      </Box>
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
    setIsDiscoverDropdownOpen(false);
  };

  const handleMobileOpportunityClick = (opportunityId: number) => {
    setIsMobileMenuOpen(false);
    setIsDiscoverDropdownOpen(false);
    router.push(`/discover/?id=${opportunityId}`);
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
      onClick={(e) => {
        // Only close menu if clicking directly on overlay, not on child elements
        if (e.target === e.currentTarget) {
          setIsMobileMenuOpen(false);
        }
      }}
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
          <Link href="/" onClick={handleMenuItemClick}>
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
            <Box pos="relative" w="20px" h="20px">
              <Image
                src={
                  isProtected ? "/assets/cancelwhite.svg" : "/assets/cancel.svg"
                }
                alt="close"
                fill
                style={{ objectFit: "contain" }}
              />
            </Box>
          </Button>
        </Box>
        <Box p={0}>
          {isProtected ? (
            <VStack gap={0} p={6} align="stretch">
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
                    <Link href="/contact/" onClick={handleMenuItemClick}>
                      Need Help ? Contact Us
                    </Link>
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
            <Link href="/" onClick={handleMenuItemClick}>
              {isMobile ? (
                <Box pos="relative" w="164px" h="34px">
                  <Image
                    alt="logo"
                    src="/uni.png"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </Box>
              ) : (
                <Box pos="relative" w="300px" h="80px">
                  <Image
                    alt="logo"
                    src="/uni.png"
                    fill
                    style={{ objectFit: "contain" }}
                    priority
                  />
                </Box>
              )}
            </Link>

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
                <Box pos="relative" w="20px" h="20px">
                  <Image
                    src="/assets/hamburger.svg"
                    alt="menu"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </Box>
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
            <Link href="/" onClick={handleMenuItemClick}>
              <Logo variant="header" width="200px" height="60px" />
            </Link>
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
