import {
  Box,
  Container,
  HStack,
  Text,
  VStack,
  useBreakpointValue,
  Button,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerContent,
  Portal,
} from "@chakra-ui/react";
import React from "react";
import { UserRound, Menu, X } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";
import Image from "next/image";
import { LinkIcon, InboxIcon, FolderIcon } from "@/assets";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/hooks/auth";
import { useAuthStore } from "@/store/authStore";

const Header = ({ isProtected }: { isProtected?: boolean }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const router = useRouter();
  const { handleLogout } = useOnboarding();
  const { logout } = useAuthStore();

  const handleUserLogout = async () => {
    await handleLogout();
    logout();
  };

  const handleMenuItemClick = () => {};

  return (
    <>
      {isProtected ? (
        <>
          <Box
            bg="#002157"
            h="126px"
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
            <Image alt="logo" src="/uni.png" width={300} height={80} />

            {/* Desktop Navigation */}
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

            <Drawer.Root size="lg">
              <Drawer.Trigger asChild>
                <Button
                  aria-label="Open menu"
                  variant="ghost"
                  color="white"
                  display={{ base: "flex", md: "none" }}
                  _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                >
                  <Menu size={24} />
                </Button>
              </Drawer.Trigger>
              <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                  <DrawerContent bg="#002157" color="white">
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={4}
                      borderBottom="1px solid rgba(255, 255, 255, 0.1)"
                    >
                      <Text fontSize="16px" fontWeight="700" color="white">
                        UNICONNECTED
                      </Text>
                      <Drawer.CloseTrigger asChild>
                        <Button
                          aria-label="Close menu"
                          variant="ghost"
                          color="white"
                          size="sm"
                          _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                        >
                          <X size={20} />
                        </Button>
                      </Drawer.CloseTrigger>
                    </Box>
                    <DrawerBody p={0}>
                      <VStack gap={0} align="stretch">
                        <Link href="/home" onClick={handleMenuItemClick}>
                          <Box
                            p={6}
                            borderBottom="1px solid rgba(255, 255, 255, 0.1)"
                            _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                            transition="background 0.2s"
                          >
                            <Text
                              fontSize="16px"
                              fontWeight="600"
                              color="white"
                            >
                              HOME
                            </Text>
                          </Box>
                        </Link>

                        <Link href="/discover" onClick={handleMenuItemClick}>
                          <Box
                            p={6}
                            borderBottom="1px solid rgba(255, 255, 255, 0.1)"
                            _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                            transition="background 0.2s"
                          >
                            <Text
                              fontSize="16px"
                              fontWeight="600"
                              color="white"
                            >
                              DISCOVER
                            </Text>
                          </Box>
                        </Link>

                        <Link href="/profile" onClick={handleMenuItemClick}>
                          <Box
                            p={6}
                            borderBottom="1px solid rgba(255, 255, 255, 0.1)"
                            _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                            transition="background 0.2s"
                          >
                            <Text
                              fontSize="16px"
                              fontWeight="600"
                              color="white"
                            >
                              PROFILE
                            </Text>
                          </Box>
                        </Link>

                        <Box
                          p={6}
                          borderBottom="1px solid rgba(255, 255, 255, 0.1)"
                        >
                          <VStack gap={4} align="stretch">
                            <Link href="/inbox" onClick={handleMenuItemClick}>
                              <HStack gap={3} _hover={{ opacity: 0.8 }}>
                                <Image
                                  src={InboxIcon}
                                  alt="inbox"
                                  width={24}
                                  height={24}
                                />
                                <Text
                                  fontSize="16px"
                                  fontWeight="600"
                                  color="white"
                                >
                                  Inbox
                                </Text>
                              </HStack>
                            </Link>

                            <Link href="/folder" onClick={handleMenuItemClick}>
                              <HStack gap={3} _hover={{ opacity: 0.8 }}>
                                <Image
                                  src={FolderIcon}
                                  alt="folder"
                                  width={24}
                                  height={24}
                                />
                                <Text
                                  fontSize="16px"
                                  fontWeight="600"
                                  color="white"
                                >
                                  Folder
                                </Text>
                              </HStack>
                            </Link>

                            <Button
                              bg="transparent"
                              p={0}
                              justifyContent="flex-start"
                              onClick={handleUserLogout}
                              _hover={{ opacity: 0.8 }}
                            >
                              <HStack gap={3}>
                                <Image
                                  src={LinkIcon}
                                  alt="logout"
                                  width={24}
                                  height={24}
                                />
                                <Text
                                  fontSize="16px"
                                  fontWeight="600"
                                  color="white"
                                >
                                  Logout
                                </Text>
                              </HStack>
                            </Button>
                          </VStack>
                        </Box>
                      </VStack>

                      <Box position="absolute" bottom={4} left={4} right={4}>
                        <Text
                          fontSize="12px"
                          color="rgba(255, 255, 255, 0.6)"
                          textAlign="center"
                        >
                          Read Tutor Connect for StudySync
                        </Text>
                        <Text
                          fontSize="12px"
                          color="rgba(255, 255, 255, 0.6)"
                          textAlign="center"
                        >
                          PRIVACY POLICY
                        </Text>
                      </Box>
                    </DrawerBody>
                  </DrawerContent>
                </Drawer.Positioner>
              </Portal>
            </Drawer.Root>
          </Box>
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

            <Drawer.Root size="lg">
              <Drawer.Trigger asChild>
                <Button
                  aria-label="Open menu"
                  variant="ghost"
                  color="black"
                  display={{ base: "flex", md: "none" }}
                  _hover={{ bg: "rgba(0, 0, 0, 0.05)" }}
                >
                  <Menu size={24} />
                </Button>
              </Drawer.Trigger>
              <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                  <DrawerContent bg="white" color="black">
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={4}
                      borderBottom="1px solid rgba(0, 0, 0, 0.1)"
                    >
                      <Text fontSize="16px" fontWeight="700" color="black">
                        MENU
                      </Text>
                      <Drawer.CloseTrigger asChild>
                        <Button
                          aria-label="Close menu"
                          variant="ghost"
                          color="black"
                          size="sm"
                          _hover={{ bg: "rgba(0, 0, 0, 0.05)" }}
                        >
                          <X size={20} />
                        </Button>
                      </Drawer.CloseTrigger>
                    </Box>
                    <DrawerBody p={0}>
                      <VStack gap={0} align="stretch">
                        <Box p={6} borderBottom="1px solid rgba(0, 0, 0, 0.1)">
                          <HStack gap={3}>
                            <UserRound size={20} color="black" />
                            <Text
                              fontSize="16px"
                              fontWeight="600"
                              color="black"
                            >
                              Account
                            </Text>
                          </HStack>
                        </Box>

                        <Link href="/login" onClick={handleMenuItemClick}>
                          <Box
                            p={6}
                            borderBottom="1px solid rgba(0, 0, 0, 0.1)"
                            _hover={{ bg: "rgba(0, 0, 0, 0.02)" }}
                            transition="background 0.2s"
                          >
                            <Text
                              fontSize="16px"
                              fontWeight="600"
                              color="black"
                            >
                              LOGIN
                            </Text>
                          </Box>
                        </Link>

                        <Link href="/user-type" onClick={handleMenuItemClick}>
                          <Box
                            p={6}
                            borderBottom="1px solid rgba(0, 0, 0, 0.1)"
                            _hover={{ bg: "rgba(0, 0, 0, 0.02)" }}
                            transition="background 0.2s"
                          >
                            <Text
                              fontSize="16px"
                              fontWeight="600"
                              color="black"
                            >
                              SIGN UP
                            </Text>
                          </Box>
                        </Link>
                      </VStack>
                    </DrawerBody>
                  </DrawerContent>
                </Drawer.Positioner>
              </Portal>
            </Drawer.Root>

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
        </>
      )}
    </>
  );
};

export default Header;
