"use client";

import {
  Box,
  VStack,
  Text,
  HStack,
  useDisclosure,
  Link as ChakraLink,
} from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import {
  Home,
  LayoutDashboard,
  Briefcase,
  MessageCircle,
  Headset,
  User,
  ChevronDown,
  ExternalLink,
  CircleCheckBig,
  Users,
  CreditCard,
} from "lucide-react";

import { IconSidebarLine } from "@/components/Icons";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import type { AccessibleOpportunity } from "@/types/opportunities";

const INACTIVE_COLOR = "#71717A";

interface SidebarMenuItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  isCoordinator: boolean;
  isOrganisation: boolean;
  isStudent: boolean;
  isProtected: boolean;
  hasDropdown?: boolean;
  badge?: boolean;
}

interface SidebarProps {
  isProtected?: boolean;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

const Sidebar = ({
  isProtected = true,
  setIsMobileMenuOpen = () => {},
}: SidebarProps) => {
  const hasUnreadMessages = useAuthStore((s) => s.hasUnreadMessages);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getUserType, accessibleOpportunities, coordinatorOpportunities, userProfile } = useAuthStore();
  const discoverDropdownRef = useRef<HTMLDivElement>(null);
  const { open: isDiscoverOpen, onToggle: onDiscoverToggle } = useDisclosure();
  const [isDashboardOpen, setIsDashboardOpen] = useState(() => pathname?.startsWith("/dashboard") ?? false);
  const onDashboardToggle = () => setIsDashboardOpen((prev) => !prev);

  const userType = getUserType();
  const isCoordinator = userType === "coordinator";
  const isOrganisation = userType === "organisation";
  const isStudent = userType === "student";
  const opps: AccessibleOpportunity[] = accessibleOpportunities ?? [];
  const defaultOpp = opps.find((o) => o.is_default);
  const showSubscriptionTab = opps.some(
    (o) => o.access?.subscription != null || o.access?.active_override != null
  );

  const MENU_ITEMS: SidebarMenuItem[] = [
    {
      key: "home",
      label: "Home",
      href: "/home/",
      icon: <Home size={20} />,
      isCoordinator: false,
      isOrganisation: true,
      isStudent: true,
      isProtected: true,
    },
    {
      key: "dashboard",
      label: "Dashboards",
      href: "/dashboard/",
      icon: <LayoutDashboard size={20} />,
      isCoordinator: true,
      isOrganisation: false,
      isStudent: false,
      isProtected: true,
      hasDropdown: true,
    },
    {
      key: "discover",
      label: "My Opportunities",
      href: "/discover/",
      icon: <Briefcase size={20} />,
      isCoordinator: false,
      isOrganisation: true,
      isStudent: true,
      isProtected: true,
      hasDropdown: true,
    },
    {
      key: "team",
      label: "Team",
      href: "/team/",
      icon: <Users size={20} />,
      isCoordinator: false,
      isOrganisation: true,
      isStudent: false,
      isProtected: true,
    },
    {
      key: "subscription",
      label: "Subscription",
      href: "/subscription/",
      icon: <CreditCard size={20} />,
      isCoordinator: false,
      isOrganisation: true,
      isStudent: true,
      isProtected: true,
    },
    {
      key: "messages",
      label: "Messages",
      href: "/messaging/",
      icon: <MessageCircle size={20} />,
      isCoordinator: true,
      isOrganisation: true,
      isStudent: true,
      isProtected: true,
      badge: hasUnreadMessages,
    },
    {
      key: "support",
      label: "Support",
      href: "/support/",
      icon: <Headset size={20} />,
      isCoordinator: true,
      isOrganisation: true,
      isStudent: true,
      isProtected: true,
    },
    {
      key: "account",
      label: "Account",
      href: "/profile/",
      icon: <User size={20} />,
      isCoordinator: true,
      isOrganisation: true,
      isStudent: true,
      isProtected: true,
    },
  ];

  const getMenuItems = (): SidebarMenuItem[] => {
    if (!isProtected) return [];
    let items: SidebarMenuItem[] = [];
    if (isCoordinator) {
      items = MENU_ITEMS.filter((i) => i.isCoordinator && i.isProtected);
    } else if (isOrganisation) {
      items = MENU_ITEMS.filter((i) => i.isOrganisation && i.isProtected);
    } else if (isStudent) {
      items = MENU_ITEMS.filter((i) => i.isStudent && i.isProtected);
    }
    return items.filter((i) => i.key !== "subscription" || showSubscriptionTab);
  };

  const isActive = (href: string) => {
    if (href === "/home/") return pathname === "/home" || pathname === "/home/";
    if (href === "/dashboard/")
      return pathname === "/dashboard" || pathname === "/dashboard/";
    if (href === "/discover/") return pathname?.startsWith("/discover");
    if (href === "/inbox/") return pathname?.startsWith("/inbox");
    if (href === "/messaging/") return pathname?.startsWith("/messaging");
    if (href === "/support/") return pathname?.startsWith("/support");
    if (href === "/profile/") return pathname?.startsWith("/profile");
    if (href === "/team/") return pathname?.startsWith("/team");
    if (href === "/subscription/") return pathname?.startsWith("/subscription");
    return pathname === href || pathname === href.replace(/\/$/, "");
  };

  const renderDashboardItem = () => {
    const active = pathname?.startsWith("/dashboard");
    const activeOppSlug = searchParams?.get("opp");
    const coordOpps = coordinatorOpportunities ?? [];

    if (coordOpps.length === 0) {
      return (
        <Link
          href="/dashboard/"
          key="dashboard"
          style={{ width: "100%" }}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <HStack
            w="full"
            p={3}
            borderRadius="xl"
            bg={active ? "profile.500" : "transparent"}
            color={active ? "white" : INACTIVE_COLOR}
            gap={3}
            _hover={{ bg: active ? "profile.500" : "secondary.100" }}
            transition="background 0.15s"
          >
            <Box flexShrink={0} w={5} h={5} color={active ? "white" : "#71717A"}>
              <LayoutDashboard size={20} />
            </Box>
            <Text fontSize="md" fontWeight={active ? 600 : 500} color={active ? "white" : "#71717A"} flex={1}>
              Dashboards
            </Text>
          </HStack>
        </Link>
      );
    }

    if (coordOpps.length === 1) {
      return (
        <Link
          href={`/dashboard/?opp=${coordOpps[0].slug}`}
          key="dashboard"
          style={{ width: "100%" }}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <HStack
            w="full"
            p={3}
            borderRadius="xl"
            bg={active ? "profile.500" : "transparent"}
            color={active ? "white" : INACTIVE_COLOR}
            gap={3}
            _hover={{ bg: active ? "profile.500" : "secondary.100" }}
            transition="background 0.15s"
          >
            <Box flexShrink={0} w={5} h={5} color={active ? "white" : "#71717A"}>
              <LayoutDashboard size={20} />
            </Box>
            <Text fontSize="md" fontWeight={active ? 600 : 500} color={active ? "white" : "#71717A"} flex={1}>
              Dashboards
            </Text>
          </HStack>
        </Link>
      );
    }

    return (
      <Box key="dashboard" w="full" position="relative" h="100%">
        <Box
          w="full"
          p={3}
          borderRadius="xl"
          bg={active ? "profile.500" : "transparent"}
          color={active ? "white" : INACTIVE_COLOR}
          cursor="pointer"
          _hover={{ bg: active ? "profile.500" : "secondary.100" }}
          transition="background 0.15s"
          onClick={() => {
            router.push(`/dashboard/?opp=${coordOpps[0].slug}`);
            onDashboardToggle();
          }}
        >
          <HStack gap={3}>
            <Box flexShrink={0} w={5} h={5} color={active ? "white" : "#71717A"}>
              <LayoutDashboard size={20} />
            </Box>
            <Text fontSize="md" fontWeight={active ? 600 : 500} color={active ? "white" : "#71717A"} flex={1}>
              Dashboards
            </Text>
            <Box
              as="span"
              transform={isDashboardOpen ? "rotate(180deg)" : "rotate(0)"}
              transition="transform 0.2s"
            >
              <ChevronDown size={16} />
            </Box>
          </HStack>
        </Box>
        {isDashboardOpen && (
          <Box mt={1} pl={3} display="flex">
            <Box w="11px" flexShrink={0} alignSelf="stretch" display="flex" alignItems="stretch">
              <IconSidebarLine segmentCount={coordOpps.length} />
            </Box>
            <VStack align="stretch" flex={1} pl={2} gap={1}>
              {coordOpps.map((o) => {
                const isActiveOpp = active && activeOppSlug === o.slug;
                return (
                  <Link
                    key={o.id}
                    href={`/dashboard/?opp=${o.slug}`}
                    style={{ width: "100%" }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HStack
                      p={3}
                      borderRadius="xl"
                      borderWidth="1px"
                      borderColor={isActiveOpp ? "#D6EDFB" : "transparent"}
                      bg={isActiveOpp ? "#EAF6FD" : "transparent"}
                      color={isActiveOpp ? "#1679AB" : INACTIVE_COLOR}
                      gap={2}
                      _hover={{ bg: isActiveOpp ? "#EAF6FD" : "secondary.100" }}
                      transition="background 0.15s"
                    >
                      <Text
                        fontSize="sm"
                        fontWeight={500}
                        color={isActiveOpp ? "#1679AB" : INACTIVE_COLOR}
                        flex={1}
                      >
                        {o.title || `Opportunity ${o.id}`}
                      </Text>
                    </HStack>
                  </Link>
                );
              })}
            </VStack>
          </Box>
        )}
      </Box>
    );
  };

  const renderMenuItem = (item: SidebarMenuItem) => {
    if (item.key === "dashboard" && item.hasDropdown) {
      return renderDashboardItem();
    }
    if (item.key === "discover" && item.hasDropdown) {
      return renderDiscoverItem();
    }

    const active = isActive(item.href);
    const content = (
      <HStack
        w="full"
        p={3}
        borderRadius="xl"
        bg={active ? "profile.500" : "transparent"}
        color={active ? "white" : INACTIVE_COLOR}
        cursor="pointer"
        gap={3}
        h="100%"
        _hover={{ bg: active ? "profile.500" : "secondary.100" }}
        transition="background 0.15s"
      >
        <Box flexShrink={0} w={5} h={5} color={active ? "white" : "#71717A"}>
          {item.icon}
        </Box>
        <Text
          fontSize="md"
          fontWeight={active ? 600 : 500}
          color={active ? "white" : "#71717A"}
          flex={1}
        >
          {item.label}
        </Text>
        {item.badge && (
          <Box
            w="10px"
            h="10px"
            borderRadius="full"
            bg={active ? "white" : isOrganisation ? "#1F7F7B" : "#1679AB"}
            flexShrink={0}
            animation="pulse 2s ease-in-out infinite"
          />
        )}
      </HStack>
    );

    return (
      <Link
        href={item.href}
        key={item.key}
        style={{ width: "100%" }}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {content}
      </Link>
    );
  };

  const renderDiscoverItem = () => {
    const active = pathname?.startsWith("/discover");
    const hasOpps = opps && opps.length > 0;
    const activeOppSlug = searchParams?.get("opp");

    if (!hasOpps || opps.length === 0) {
      return (
        <Link
          href="/discover/"
          key="discover"
          style={{ width: "100%" }}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <HStack
            w="full"
            p={3}
            borderRadius="xl"
            bg={active ? "profile.500" : "transparent"}
            color={active ? "white" : INACTIVE_COLOR}
            gap={3}
            _hover={{ bg: active ? "profile.500" : "secondary.100" }}
            transition="background 0.15s"
          >
            <Box
              flexShrink={0}
              w={5}
              h={5}
              color={active ? "white" : "#71717A"}
            >
              <Briefcase size={20} />
            </Box>
            <Text
              fontSize="md"
              fontWeight={active ? 600 : 500}
              color={active ? "white" : "#71717A"}
              flex={1}
            >
              My Opportunities
            </Text>
          </HStack>
        </Link>
      );
    }

    if (opps.length === 1) {
      return (
        <Link
          href={`/discover/?opp=${opps[0].slug}`}
          key="discover"
          style={{ width: "100%" }}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <HStack
            w="full"
            p={3}
            borderRadius="xl"
            bg={active ? "profile.500" : "transparent"}
            color={active ? "white" : INACTIVE_COLOR}
            gap={3}
            _hover={{ bg: active ? "profile.500" : "secondary.100" }}
            transition="background 0.15s"
          >
            <Box
              flexShrink={0}
              w={5}
              h={5}
              color={active ? "white" : "#71717A"}
            >
              <Briefcase size={20} />
            </Box>
            <Text
              fontSize="md"
              fontWeight={active ? 600 : 500}
              color={active ? "white" : "#71717A"}
              flex={1}
            >
              My Opportunities
            </Text>
          </HStack>
        </Link>
      );
    }

    return (
      <Box
        key="discover"
        ref={discoverDropdownRef}
        w="full"
        position="relative"
        h="100%"
      >
        <Box
          w="full"
          p={3}
          borderRadius="xl"
          bg={active ? "profile.500" : "transparent"}
          color={active ? "white" : INACTIVE_COLOR}
          cursor="pointer"
          _hover={{ bg: active ? "profile.500" : "secondary.100" }}
          transition="background 0.15s"
          onClick={() => {
            const target = defaultOpp ?? opps[0];
            router.push(`/discover/?opp=${target.slug}`);
            onDiscoverToggle();
          }}
        >
          <HStack gap={3}>
            <Box
              flexShrink={0}
              w={5}
              h={5}
              color={active ? "white" : "#71717A"}
            >
              <Briefcase size={20} />
            </Box>
            <Text
              fontSize="md"
              fontWeight={active ? 600 : 500}
              color={active ? "white" : "#71717A"}
              flex={1}
            >
              My Opportunities
            </Text>
            {opps.length >= 1 && (
              <Box
                as="span"
                transform={isDiscoverOpen ? "rotate(180deg)" : "rotate(0)"}
                transition="transform 0.2s"
              >
                <ChevronDown size={16} />
              </Box>
            )}
          </HStack>
        </Box>
        {isDiscoverOpen && (
          <Box mt={1} pl={3} display="flex">
            <Box
              w="11px"
              flexShrink={0}
              alignSelf="stretch"
              display="flex"
              alignItems="stretch"
            >
              <IconSidebarLine segmentCount={opps.length} />
            </Box>
            <VStack align="stretch" flex={1} pl={2} gap={1}>
              {opps.map((o) => (
                <Link
                  key={o.id}
                  href={`/discover/?opp=${o.slug}`}
                  style={{ width: "100%" }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {/*
                    An opportunity is considered "active" when its slug matches
                    the `opp`.
                  */}
                  {(() => {
                    const isActiveOpp = active && activeOppSlug === o.slug;
                    return (
                      <HStack
                        p={3}
                        borderRadius="xl"
                        borderWidth="1px"
                        borderColor={
                          isActiveOpp
                            ? isStudent
                              ? "#D6EDFB"
                              : "#D3EFEA"
                            : "transparent"
                        }
                        bg={
                          isActiveOpp
                            ? isStudent
                              ? "#EAF6FD"
                              : "#E9F7F6"
                            : "transparent"
                        }
                        color={
                          isActiveOpp
                            ? isStudent
                              ? "#1679AB"
                              : "#1F7F7B"
                            : INACTIVE_COLOR
                        }
                        gap={2}
                        _hover={{
                          bg: isActiveOpp
                            ? isStudent
                              ? "#EAF6FD"
                              : "#E9F7F6"
                            : "secondary.100",
                        }}
                        transition="background 0.15s"
                      >
                        <Text
                          fontSize="sm"
                          fontWeight={500}
                          color={
                            isActiveOpp
                              ? isStudent
                                ? "#1679AB"
                                : "#1F7F7B"
                              : INACTIVE_COLOR
                          }
                          flex={1}
                        >
                          {o.title || `Opportunity ${o.id}`}
                        </Text>
                        {defaultOpp?.id === o.id && (
                          <CircleCheckBig
                            size={20}
                            color="var(--profile-500)"
                          />
                        )}
                      </HStack>
                    );
                  })()}
                </Link>
              ))}
            </VStack>
          </Box>
        )}
      </Box>
    );
  };

  if (!isProtected) return null;

  const menuItems = getMenuItems();
  if (menuItems.length === 0) return null;

  return (
    <Box
      w="full"
      h="100%"
      display="flex"
      flexDirection="column"
      p={4}
      overflowY="auto"
    >
      <Box flex="1 1 auto">
        <VStack align="stretch" gap={2}>
          {menuItems.map((item) => renderMenuItem(item))}
        </VStack>
      </Box>
      {userProfile?.university?.links && isStudent && (
        <Box py={4} borderTopWidth="1px" borderColor="gray.100">
          <Text
            fontSize="xs"
            fontWeight={700}
            color="#52525B"
            letterSpacing="wider"
            mb={3}
            mt={3}
            pl={3}
            textTransform={"uppercase"}
          >
            {userProfile?.university?.name}
          </Text>
          <VStack align="stretch" gap={0.1}>
            {(userProfile?.university?.links ?? []).map((link) => (
              <ChakraLink
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                color="#52525B"
                fontSize="xs"
                fontWeight={500}
                _hover={{ color: "blue.600" }}
                _focus={{
                  boxShadow: "none",
                  outline: "none",
                }}
              >
                <HStack p={3} gap={3} _hover={{ color: "blue.600" }}>
                  <ExternalLink size={16} color="#71717A" />
                  <Text fontSize="sm" color="#52525B">
                    {link.label}
                  </Text>
                </HStack>
              </ChakraLink>
            ))}
          </VStack>
        </Box>
      )}

      {userProfile?.university?.logo_url && isStudent && (
        <Box p={4} borderRadius="lg" mt="auto">
          <VStack gap={2}>
            <Box
              position="relative"
              h="260px"
              w="260px"
              display="flex"
              justifyContent="center"
              borderRadius="lg"
            >
              <Image
                src={userProfile?.university?.logo_url}
                alt={userProfile?.university?.name || "University Logo"}
                fill
                priority
                style={{ objectFit: "contain", borderRadius: "12px" }}
              />
            </Box>
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;
