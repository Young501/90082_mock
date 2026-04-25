import {
  Box,
  HStack,
  Text,
  useBreakpointValue,
  Button,
  Drawer,
  IconButton,
  VStack,
} from "@chakra-ui/react";
import React, { useState, useEffect, useRef } from "react";
import {
  UserRound,
  HelpCircle,
  Bell,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  LogOut,
  Headset,
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
import { MenuPopover } from "../ui/MenuPopover";
import { ButtonV2 } from "../ui/ButtonV2";
import { SupportModal } from "../SupportModal";

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

interface PublicMenuItem {
  label: string;
  subLabel?: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  variant: "ghost" | "secondary" | "primary";
  customStyles?: Record<string, unknown>;
  isOnbardingPage?: boolean;
}

const Header = ({
  isProtected,
  isOnboardingPage,
}: {
  isProtected?: boolean;
  isOnboardingPage?: boolean;
}) => {
  const isMobile = useBreakpointValue({ base: true, md: true, lg: false });
  const router = useRouter();
  const isCollapsed = useAuthStore((s) => s.isSidebarCollapsed);
  const toggleSidebar = useAuthStore((s) => s.toggleSidebar);
  const { handleLogout } = useAuth();
  const { logout, getUserProfilePictureUrl } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const hasUnreadMessages = useAuthStore((s) => s.hasUnreadMessages);

  const profilePictureUrl = getUserProfilePictureUrl?.() ?? null;

  const getSignupLink = () => {
    const inviteToken = searchParams.get("invite_token");
    const opportunityId = searchParams.get("opportunity_id");

    if (inviteToken && opportunityId) {
      return `/user-type?signup=true&invite_token=${inviteToken}&opportunity_id=${opportunityId}`;
    }
    return "/user-type/";
  };

  const PUBLIC_HEADER_MENU_ITEMS: PublicMenuItem[] = [
    {
      label: "Contact Us",
      subLabel: "Need Help?",
      onClick: () => setIsContactModalOpen(true),
      icon: Headset,
      variant: "ghost",
      customStyles: {
        border: "1px solid #D6EDFB",
        borderRadius: "xl",
        textDecoration: "none",
      },
      isOnbardingPage: true,
    },
    {
      label: "Login",
      href: "/login/",
      variant: "secondary",
      isOnbardingPage: false,
    },
    {
      label: "Sign up",
      href: getSignupLink(),
      variant: "primary",
      isOnbardingPage: false,
    },
  ];

  const publicMenuItems = isOnboardingPage
    ? PUBLIC_HEADER_MENU_ITEMS.filter((item) => item.isOnbardingPage === true)
    : PUBLIC_HEADER_MENU_ITEMS;

  const handleUserLogout = async () => {
    await handleLogout();
    logout();
    setIsMobileMenuOpen(false);
    router.push("/login/");
  };

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const renderPublicMenuItem = (item: PublicMenuItem, isCompact = false) => {
    const content = item.icon ? (
      <HStack>
        <item.icon size={20} color="black" />
        <Box display="flex" flexDirection="column" alignItems="start">
          <Text fontSize="2xs" color="#A1A1AA" lineHeight="1.3">
            {item.subLabel}
          </Text>
          <Text fontSize="xs" color="#1679AB" lineHeight="1.3">
            {item.label}
          </Text>
        </Box>
      </HStack>
    ) : (
      item.label
    );
    const button = (
      <ButtonV2
        variant={item.variant}
        h={12}
        fontSize="md"
        py="9px"
        px="20px"
        w={isCompact ? "full" : undefined}
        {...(item.customStyles ?? {})}
      >
        {content}
      </ButtonV2>
    );
    const key = item.href ?? item.label;
    if (item.onClick) {
      return (
        <Box key={key} w={isCompact ? "full" : undefined}>
          <Box
            onClick={() => {
              if (isCompact) handleMenuToggle();
              item.onClick!();
            }}
            w={isCompact ? "full" : undefined}
          >
            {button}
          </Box>
        </Box>
      );
    }
    return (
      <Box key={key} w={isCompact ? "full" : undefined}>
        <Link
          href={item.href!}
          onClick={isCompact ? handleMenuToggle : undefined}
        >
          {button}
        </Link>
      </Box>
    );
  };

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
        top={{ base: "80px", lg: "126px", xl: "126px" }}
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
            zIndex={5000}
            width="100%"
            h={{ base: "58px", lg: "76px" }}
          >
            <Box display="flex" h="100%" alignItems="stretch">
              {/* Sidebar-width section: logo + collapse toggle (desktop only) */}
              <Box
                display={{ base: "none", lg: "block" }}
                position="relative"
                flexShrink={0}
                w="300px"
                borderRight={
                  isCollapsed ? "none" : "1px solid rgba(148, 163, 184, 0.35)"
                }
                borderBottom={
                  isCollapsed ? "1px solid rgba(148, 163, 184, 0.35)" : "none"
                }
                // Delay border appearing to match the 0.3s sidebar animation,
                // but remove it instantly when it should disappear
                style={{
                  transition: isCollapsed
                    ? "border-right 0s 0s, border-bottom 0s 0.3s"
                    : "border-right 0s 0.3s, border-bottom 0s 0s",
                }}
              >
                {/* Logo — slides right and shrinks when collapsed */}
                <Box
                  position="absolute"
                  left={isCollapsed ? "64px" : "12px"}
                  top="50%"
                  transition="left 0.3s ease"
                  style={{ transform: "translateY(-50%)" }}
                >
                  <Box
                    pos="relative"
                    w={isCollapsed ? "260px" : "200px"}
                    h={isCollapsed ? "64px" : "45px"}
                    transition="width 0.3s ease, height 0.3s ease"
                  >
                    {isOnboardingPage ? (
                      <Image
                        alt="Uniconnected"
                        src="/assets/logo.svg"
                        fill
                        style={{ objectFit: "contain", objectPosition: "left" }}
                        priority
                      />
                    ) : (
                      <Link href="/">
                        <Image
                          alt="Uniconnected"
                          src="/assets/logo.svg"
                          fill
                          style={{
                            objectFit: "contain",
                            objectPosition: "left",
                          }}
                          priority
                        />
                      </Link>
                    )}
                  </Box>
                </Box>

                {/* Toggle button — slides from right edge to left edge on collapse */}
                <Box
                  as="button"
                  position="absolute"
                  left={isCollapsed ? "12px" : "256px"}
                  top="50%"
                  transition="left 0.3s ease"
                  style={{ transform: "translateY(-50%)" }}
                  w="32px"
                  h="32px"
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="#1679AB"
                  cursor="pointer"
                  _hover={{ bg: "gray.100" }}
                  onClick={toggleSidebar}
                >
                  {isCollapsed ? (
                    <PanelLeftOpen size={24} />
                  ) : (
                    <PanelLeftClose size={20} />
                  )}
                </Box>
              </Box>

              {/* Right section: mobile hamburger + logo, then bell + profile */}
              <Box
                flex={1}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                px={{ base: 4, lg: 8 }}
                py={3}
                borderBottom="1px solid rgba(148, 163, 184, 0.35)"
              >
                <Box display="flex" alignItems="center" gap={1}>
                  {isMobile && (
                    <Button
                      aria-label="Open menu"
                      variant="ghost"
                      color="black"
                      onClick={handleMenuToggle}
                      px={2}
                      minW="auto"
                      height="auto"
                    >
                      <Menu width={20} height={20} color="#1679AB" />
                    </Button>
                  )}
                  {/* Logo visible on mobile only — desktop logo lives in the left section */}
                  <Box display={{ base: "block", lg: "none" }}>
                    {isOnboardingPage ? (
                      <Box
                        pos="relative"
                        w={{ base: "133px", md: "216px" }}
                        h={{ base: "32px", md: "52px" }}
                      >
                        <Image
                          alt="Uniconnected"
                          src="/assets/logo.svg"
                          fill
                          style={{ objectFit: "contain" }}
                          priority
                        />
                      </Box>
                    ) : (
                      <Link href="/">
                        <Box
                          pos="relative"
                          w={{ base: "133px", md: "216px" }}
                          h={{ base: "32px", md: "52px" }}
                        >
                          <Image
                            alt="Uniconnected"
                            src="/assets/logo.svg"
                            fill
                            style={{ objectFit: "contain" }}
                            priority
                          />
                        </Box>
                      </Link>
                    )}
                  </Box>
                </Box>
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
                    position={"relative"}
                  >
                    <Bell size={18} color="#18181B" />
                    {hasUnreadMessages && (
                      <Box
                        position={"absolute"}
                        top={1}
                        right={1}
                        w={"8px"}
                        h={"8px"}
                        bg={"red.500"}
                        borderRadius={"full"}
                      />
                    )}
                  </Box>

                  <MenuPopover
                    placement="bottom-end"
                    minW="180px"
                    trigger={
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap={2}
                        px={1}
                        py={1}
                        borderRadius="full"
                        cursor="pointer"
                        _hover={{ bg: "#F4F4F5" }}
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
                              style={{
                                objectFit: "cover",
                                width: "100%",
                                height: "100%",
                              }}
                            />
                          ) : (
                            <UserRound size={20} color="#18181B" />
                          )}
                        </Box>
                        <ChevronDown width={20} height={20} color="#18181B" />
                      </Box>
                    }
                  >
                    <HStack
                      gap={2}
                      cursor="pointer"
                      px={2}
                      py={1}
                      borderRadius="md"
                      _hover={{ bg: "#F4F4F5" }}
                      onClick={handleUserLogout}
                    >
                      <LogOut size={16} color="#111827" />
                      <Text fontSize="sm" color="#111827">
                        Log out
                      </Text>
                    </HStack>
                  </MenuPopover>
                </HStack>
              </Box>
            </Box>
            <SubscriptionBanner isInMobileMenu={isMobileMenuOpen} />
            {isMobile && (
              <Box
                mt={{ base: "58px", lg: "0" }}
                position="relative"
                zIndex={99999}
              >
                <Drawer.Root
                  open={isMobileMenuOpen}
                  onOpenChange={(details) => setIsMobileMenuOpen(details.open)}
                  placement="start"
                  size="full"
                >
                  <Drawer.Backdrop />
                  <Drawer.Positioner>
                    <Drawer.Content bg="white">
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        px={{ base: 4, lg: 16 }}
                        py={3}
                        borderBottom="1px solid rgba(148, 163, 184, 0.35)"
                      >
                        <Box pos="relative" w="164px" h="34px">
                          <Image
                            alt="Uniconnected"
                            src="/assets/logo.svg"
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
                      <Drawer.Body p={{ base: 4, lg: 14 }}>
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
            position="fixed"
            top={0}
            left={0}
            right={0}
            zIndex={1000}
            maxHeight={{ base: "58px", lg: "76px" }}
            borderBottom="1px solid rgba(148, 163, 184, 0.35)"
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              width="100%"
              maxW="1440px"
              mx="auto"
              h="100%"
              px={{ base: 4, lg: 20 }}
              py={3}
            >
              <Box pos="relative" w="200px" h="60px">
                <Image
                  src="/assets/logo.svg"
                  alt="Uniconnected"
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
              </Box>

              <Box>
                {!isMobile ? (
                  <HStack gap={4}>
                    {publicMenuItems.map((item) =>
                      renderPublicMenuItem(item, false)
                    )}
                  </HStack>
                ) : (
                  <IconButton
                    aria-label="Open menu"
                    variant="ghost"
                    color="black"
                    display={{ base: "flex", xl: "none" }}
                    onClick={handleMenuToggle}
                  >
                    <Menu size={20} color="black" />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Box>

          {isMobile && (
            <Box
              mt={{ base: "58px", lg: "0" }}
              position="relative"
              zIndex={1001}
            >
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
                      px={{ base: 4, lg: 16 }}
                      py={3}
                      borderBottom="1px solid rgba(148, 163, 184, 0.35)"
                    >
                      <Box pos="relative" w="164px" h="34px">
                        <Image
                          alt="Uniconnected"
                          src="/assets/logo.svg"
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
                      <VStack gap={4} alignItems="stretch" w="full">
                        {publicMenuItems.map((item) =>
                          renderPublicMenuItem(item, true)
                        )}
                      </VStack>
                    </Drawer.Body>
                  </Drawer.Content>
                </Drawer.Positioner>
              </Drawer.Root>
            </Box>
          )}
        </>
      )}
      <SupportModal
        open={isContactModalOpen}
        onOpenChange={(details) => setIsContactModalOpen(details.open)}
      />
    </>
  );
};

export default Header;
