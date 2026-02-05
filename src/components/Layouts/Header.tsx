import {
  Box,
  HStack,
  Text,
  VStack,
  useBreakpointValue,
  Button,
  Drawer,
} from "@chakra-ui/react";
import React, { useState, useEffect, useRef } from "react";
import {
  UserRound,
  HelpCircle,
  Bell,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/auth";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { getSubscriptionTrialInfo } from "@/utils/subscriptionPermissions";
import { formatDate } from "@/utils/formatDate";
import Sidebar from "@/components/Layouts/Sidebar";

const lessThan3Days = (date: string) => {
  const trialEndDate = new Date(date);
  const currentDate = new Date();
  const diffTime = Math.abs(trialEndDate.getTime() - currentDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays < 3;
};

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
  const {
    logout,
    getUserType,
    accessibleOpportunities,
    getUserFirstName,
    getUserProfilePictureUrl,
  } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDiscoverDropdownOpen, setIsDiscoverDropdownOpen] = useState(false);
  const discoverDropdownRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const userType = getUserType();
  const isCoordinator = userType === "coordinator";
  const isOrganisation = userType === "organisation";
  const isStudent = userType === "student";
  const accessibleOpps = accessibleOpportunities;

  const firstName = getUserFirstName?.() ?? "";
  const profilePictureUrl = getUserProfilePictureUrl?.() ?? null;

  const isOnInviteOrOnboardingPage =
    pathname?.includes("/invite") ||
    pathname?.includes("/onboarding") ||
    pathname?.includes("/verify-email");

  // // Close dropdown when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (
  //       discoverDropdownRef.current &&
  //       !discoverDropdownRef.current.contains(event.target as Node)
  //     ) {
  //       setIsDiscoverDropdownOpen(false);
  //     }
  //   };

  //   if (isDiscoverDropdownOpen) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //   }

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [isDiscoverDropdownOpen]);

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
    // if (isCoordinator) {
    //   return MENU_ITEMS.filter(
    //     (item) => item.isCoordinator && item.isProtected
    //   );
    // }
    // if (isOrganisation) {
    //   return MENU_ITEMS.filter(
    //     (item) => item.isOrganisation && item.isProtected
    //   );
    // }
    // if (isStudent) {
    //   return MENU_ITEMS.filter((item) => item.isStudent && item.isProtected);
    // }
    // return [];
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
        <Link href={item.href} key={item.label}>
          <Box py={isMobile ? 4 : 0}>
            <HelpCircle size={isMobile ? 24 : 30} color="white" />
          </Box>
        </Link>
      );
    }

    return (
      <Link href={item.href} key={item.label}>
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

  const SubscriptionBanner: React.FC<{
    isInMobileMenu?: boolean;
  }> = ({ isInMobileMenu = false }) => {
    const searchParams = useSearchParams();
    const opportunitySlug = searchParams.get("opp");
    const trialInfo = opportunitySlug
      ? getSubscriptionTrialInfo(opportunitySlug)
      : { isInTrial: false, trialEnd: null };

    if (!trialInfo.isInTrial || !trialInfo.trialEnd) {
      return null;
    }

    return (
      <Box
        position="fixed"
        top={isMobile ? "80px" : "126px"}
        left={0}
        right={0}
        bg={lessThan3Days(trialInfo.trialEnd) ? "#FF0000" : "#FFA500"}
        color="white"
        py={2}
        display={isInMobileMenu ? "none" : "block"}
        px={{ base: 4, lg: 16 }}
        zIndex={isInMobileMenu ? "auto" : 9998}
        boxShadow="0px 2px 4px rgba(0, 0, 0, 0.1)"
      >
        <Text
          fontSize={{ base: "12px", md: "14px" }}
          fontWeight="600"
          textAlign="center"
        >
          Your trial period ends on {formatDate(trialInfo.trialEnd)}.{" "}
          {lessThan3Days(trialInfo.trialEnd) ? "Less than 3 days left" : ""}
        </Text>
      </Box>
    );
  };

  return (
    <>
      {isProtected ? (
        <>
          <Box
            bg="white"
            position="fixed"
            top={0}
            left={0}
            right={0}
            zIndex={9999}
            width="100%"
            borderBottom="1px solid rgba(148, 163, 184, 0.35)"
            h={`${isMobile ? "58px" : "76px"}`}
          >
            <Box
              maxW="1440px"
              display="flex"
              mx="auto"
              alignItems="center"
              justifyContent="space-between"
              px={{ base: 4, lg: 16 }}
              maxHeight={{ base: "58px", lg: "76px" }}
              py={3}
            >
              <Link href="/">
                <Box
                  pos="relative"
                  w={isMobile ? "164px" : "260px"}
                  h={isMobile ? "40px" : "70px"}
                >
                  <Image
                    alt="Uniconnected"
                    src="/assets/Logoone.png"
                    fill
                    style={{ objectFit: "contain" }}
                    priority
                  />
                </Box>
              </Link>

              {!isMobile ? (
                <HStack gap={4}>
                  <Box
                    w={10}
                    h={10}
                    borderRadius="full"
                    bg="#FAFAFA"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={2}
                  >
                    <Bell size={18} color="#18181B" />
                  </Box>
                  <Box
                    overflow="hidden"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={1}
                  >
                    <Box
                      w={8}
                      h={8}
                      borderRadius="full"
                      overflow="hidden"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {profilePictureUrl ? (
                        <Image
                          src={profilePictureUrl}
                          alt="Profile picture"
                          width={32}
                          height={32}
                        />
                      ) : (
                        <UserRound size={20} color="#18181B" />
                      )}
                    </Box>
                    <ChevronDown width={20} height={20} color="#18181B" />
                  </Box>
                </HStack>
              ) : (
                <Button
                  aria-label="Open menu"
                  variant="ghost"
                  color="black"
                  onClick={handleMenuToggle}
                  px={2}
                  minW="auto"
                  height="auto"
                >
                  <Menu width={20} height={20} color="black" />
                </Button>
              )}
            </Box>
            <SubscriptionBanner isInMobileMenu={isMobileMenuOpen} />
            {isMobile && (
              <Box mt="58px" position="relative" zIndex={99999}>
                <Drawer.Root
                  open={isMobileMenuOpen}
                  onOpenChange={(details) => setIsMobileMenuOpen(details.open)}
                  placement="end"
                  size="full"
                >
                  <Drawer.Backdrop />
                  <Drawer.Positioner>
                    <Drawer.Content bg="white">
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        px={4}
                        py={3}
                        borderBottom="1px solid rgba(148, 163, 184, 0.35)"
                      >
                        <Box pos="relative" w="164px" h="34px">
                          <Image
                            alt="Uniconnected"
                            src="/assets/Logoone.png"
                            fill
                            style={{ objectFit: "contain" }}
                            priority
                          />
                        </Box>
                        <Button
                          aria-label="Close menu"
                          variant="ghost"
                          onClick={handleMenuToggle}
                          px={2}
                          minW="auto"
                          height="auto"
                        >
                          <X width={20} height={20} color="#0F172A" />
                        </Button>
                      </Box>
                      <Drawer.Body p={4}>
                        <Sidebar
                          isMobileMenuOpen={isMobileMenuOpen}
                          setIsMobileMenuOpen={handleMenuToggle}
                        />
                      </Drawer.Body>
                    </Drawer.Content>
                  </Drawer.Positioner>
                </Drawer.Root>
              </Box>
            )}
          </Box>
        </>
      ) : (
        <>
          <Box
            bg="white"
            h={{ base: "58px", lg: "76px" }}
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
            maxHeight={{ base: "58px", lg: "76px" }}
            borderBottom="1px solid rgba(148, 163, 184, 0.35)"
          >
            <Link href="/">
              <Box pos="relative" w="200px" h="60px">
                <Image
                  src="/assets/Logoone.png"
                  alt="Uniconnected"
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
              </Box>
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
              {getMenuItems()?.map((item) => renderMenuItem(item, false))}
            </HStack>
          </Box>
          {/* {isMobile && <MobileMenu />} */}
        </>
      )}
    </>
  );
};

export default Header;
