"use client";

import {
  Box,
  VStack,
  Text,
  HStack,
  useDisclosure,
  Link as ChakraLink,
} from "@chakra-ui/react";
import React, { useRef, useEffect } from "react";
import {
  Home,
  Briefcase,
  MessageCircle,
  Headphones,
  User,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import type { AccessibleOpportunity } from "@/types/opportunities";

const ACTIVE_BG = "#63B3ED";
const INACTIVE_COLOR = "gray.700";
const QUICK_LINKS_BG = "gray.50";

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
  badge?: number | null;
}

interface QuickLinkItem {
  label: string;
  href: string;
}

const QUICK_LINKS: QuickLinkItem[] = [
  { label: "University Portal", href: "https://www.unimelb.edu.au/" },
  { label: "Career Services", href: "https://careers.unimelb.edu.au/" },
  { label: "Support Centre", href: "/contact/" },
  { label: "FAQs", href: "/contact/#faqs" },
];

interface SidebarProps {
  isProtected?: boolean;
  /** Unread message count for Messages badge (e.g. from API). */
  unreadMessageCount?: number;
}

const Sidebar = ({
  isProtected = true,
  unreadMessageCount = 0,
}: SidebarProps) => {
  const pathname = usePathname();
  const { getUserType, accessibleOpportunities } = useAuthStore();
  const discoverDropdownRef = useRef<HTMLDivElement>(null);
  const {
    open: isDiscoverOpen,
    onClose: onDiscoverClose,
    onToggle: onDiscoverToggle,
  } = useDisclosure();

  const userType = getUserType();
  const isCoordinator = userType === "coordinator";
  const isOrganisation = userType === "organisation";
  const isStudent = userType === "student";
  const opps: AccessibleOpportunity[] = accessibleOpportunities ?? [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        discoverDropdownRef.current &&
        !discoverDropdownRef.current.contains(e.target as Node)
      ) {
        onDiscoverClose();
      }
    };
    if (isDiscoverOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDiscoverOpen, onDiscoverClose]);

  const MENU_ITEMS: SidebarMenuItem[] = [
    {
      key: "home",
      label: "Home",
      href: "/dashboard/",
      icon: <Home size={20} />,
      isCoordinator: true,
      isOrganisation: false,
      isStudent: false,
      isProtected: true,
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
      key: "messages",
      label: "Messages",
      href: "/inbox/",
      icon: <MessageCircle size={20} />,
      isCoordinator: true,
      isOrganisation: true,
      isStudent: true,
      isProtected: true,
      badge: unreadMessageCount,
    },
    {
      key: "support",
      label: "Support",
      href: "/contact/",
      icon: <Headphones size={20} />,
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
    if (isCoordinator) {
      return MENU_ITEMS.filter((i) => i.isCoordinator && i.isProtected);
    }
    if (isOrganisation || isStudent) {
      return MENU_ITEMS.filter(
        (i) => (i.isOrganisation || i.isStudent) && i.isProtected
      );
    }
    return [];
  };

  const isActive = (href: string) => {
    if (href === "/dashboard/")
      return pathname === "/dashboard" || pathname === "/dashboard/";
    if (href === "/discover/") return pathname?.startsWith("/discover");
    if (href === "/inbox/") return pathname?.startsWith("/inbox");
    if (href === "/contact/") return pathname?.startsWith("/contact");
    if (href === "/profile/") return pathname?.startsWith("/profile");
    return pathname === href || pathname === href.replace(/\/$/, "");
  };

  const renderMenuItem = (item: SidebarMenuItem) => {
    if (item.key === "discover" && item.hasDropdown) {
      return renderDiscoverItem();
    }

    const active = isActive(item.href);
    const content = (
      <HStack
        w="full"
        py={2.5}
        px={3}
        borderRadius="md"
        bg={active ? ACTIVE_BG : "transparent"}
        color={active ? "white" : INACTIVE_COLOR}
        _hover={!active ? { bg: "gray.100" } : undefined}
        cursor="pointer"
        gap={3}
      >
        <Box flexShrink={0} color={active ? "white" : "inherit"}>
          {item.icon}
        </Box>
        <Text fontSize="sm" fontWeight={active ? 600 : 500} flex={1}>
          {item.label}
        </Text>
        {item.badge != null && item.badge > 0 && (
          <Box
            bg={active ? "whiteAlpha.400" : QUICK_LINKS_BG}
            color={active ? "white" : ACTIVE_BG}
            fontSize="xs"
            fontWeight={600}
            px={2}
            py={0.5}
            borderRadius="md"
          >
            {item.badge}
          </Box>
        )}
      </HStack>
    );

    return (
      <Link href={item.href} key={item.key} style={{ width: "100%" }}>
        {content}
      </Link>
    );
  };

  const renderDiscoverItem = () => {
    const active = pathname?.startsWith("/discover");
    const hasOpps = opps && opps.length > 0;

    if (!hasOpps || opps.length === 0) {
      return (
        <Link href="/discover/" key="discover" style={{ width: "100%" }}>
          <HStack
            w="full"
            py={2.5}
            px={3}
            borderRadius="md"
            bg={active ? ACTIVE_BG : "transparent"}
            color={active ? "white" : INACTIVE_COLOR}
            _hover={!active ? { bg: "gray.100" } : undefined}
            gap={3}
          >
            <Box flexShrink={0}>
              <Briefcase size={20} />
            </Box>
            <Text fontSize="sm" fontWeight={active ? 600 : 500} flex={1}>
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
        >
          <HStack
            w="full"
            py={2.5}
            px={3}
            borderRadius="md"
            bg={active ? ACTIVE_BG : "transparent"}
            color={active ? "white" : INACTIVE_COLOR}
            _hover={!active ? { bg: "gray.100" } : undefined}
            gap={3}
          >
            <Box flexShrink={0}>
              <Briefcase size={20} />
            </Box>
            <Text fontSize="sm" fontWeight={active ? 600 : 500} flex={1}>
              My Opportunities
            </Text>
            <ChevronDown size={16} />
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
      >
        <Box
          w="full"
          py={2.5}
          px={3}
          borderRadius="md"
          bg={active ? ACTIVE_BG : "transparent"}
          color={active ? "white" : INACTIVE_COLOR}
          _hover={!active ? { bg: "gray.100" } : undefined}
          cursor="pointer"
          onClick={onDiscoverToggle}
        >
          <HStack gap={3}>
            <Box flexShrink={0}>
              <Briefcase size={20} />
            </Box>
            <Text fontSize="sm" fontWeight={active ? 600 : 500} flex={1}>
              My Opportunities
            </Text>
            <Box
              as="span"
              transform={isDiscoverOpen ? "rotate(180deg)" : "rotate(0)"}
              transition="transform 0.2s"
            >
              <ChevronDown size={16} />
            </Box>
          </HStack>
        </Box>
        {isDiscoverOpen && (
          <VStack
            align="stretch"
            mt={1}
            pl={3}
            borderLeft="2px solid"
            borderColor="gray.200"
            gap={1}
          >
            {opps.map((o) => (
              <Link
                href={`/discover/?opp=${o.slug}`}
                key={o.id}
                onClick={onDiscoverClose}
              >
                <HStack
                  py={1.5}
                  px={2}
                  borderRadius="md"
                  _hover={{ bg: "gray.100" }}
                  gap={2}
                >
                  <Box
                    fontSize="10px"
                    px={1.5}
                    py={0.5}
                    borderRadius="md"
                    bg={
                      o.enrollment_status === "enrolled"
                        ? "green.100"
                        : "yellow.100"
                    }
                    color={
                      o.enrollment_status === "enrolled"
                        ? "green.800"
                        : "yellow.800"
                    }
                    fontWeight="600"
                  >
                    {o.enrollment_status === "enrolled"
                      ? "Enrolled"
                      : "Not Enrolled"}
                  </Box>
                  <Text fontSize="sm">{o.title || `Opportunity ${o.id}`}</Text>
                </HStack>
              </Link>
            ))}
          </VStack>
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
      h="full"
      minH="100%"
      maxW="300px"
      bg="white"
      borderRadius="lg"
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.100"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      {/* MENU */}
      <Box p={4} flex="1 1 auto">
        <Text
          fontSize="xs"
          fontWeight={700}
          color="gray.500"
          letterSpacing="wider"
          mb={3}
        >
          MENU
        </Text>
        <VStack align="stretch" gap={0.5}>
          {menuItems.map((item) => renderMenuItem(item))}
        </VStack>
      </Box>

      {/* QUICK LINKS */}
      <Box px={4} py={4} borderTopWidth="1px" borderColor="gray.100">
        <Text
          fontSize="xs"
          fontWeight={700}
          color="gray.500"
          letterSpacing="wider"
          mb={3}
        >
          QUICK LINKS
        </Text>
        <VStack align="stretch" gap={0.5}>
          {QUICK_LINKS.map((q) => (
            <ChakraLink
              key={q.label}
              href={q.href}
              // isExternal={q.href.startsWith("http")}
              _hover={{ textDecoration: "none" }}
              color={INACTIVE_COLOR}
              fontSize="sm"
            >
              <HStack py={2} gap={3} _hover={{ color: "blue.600" }}>
                <ExternalLink size={16} />
                <Text>{q.label}</Text>
              </HStack>
            </ChakraLink>
          ))}
        </VStack>
      </Box>

      <Box p={4} borderRadius="lg" mt="auto">
        <VStack gap={2}>
          <Box
            position="relative"
            h="260px"
            w="260px"
            display="flex"
            justifyContent="center"
          >
            <Image
              src="/assets/meluni2.png"
              alt="The University of Melbourne"
              width={260}
              height={260}
              style={{ objectFit: "contain" }}
            />
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default Sidebar;
