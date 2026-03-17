"use client";

import React, { useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Link,
  Button,
  HStack,
  Separator,
} from "@chakra-ui/react";
import { MessageCircle, Mail } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

declare global {
  interface Window {
    LiveAgent?: {
      setUserDetails: (
        email: string,
        firstName: string,
        lastName: string,
        phone: string
      ) => void;
      addContactField: (key: string, value: string) => void;
      createButton: (
        buttonId: string,
        element: HTMLElement
      ) => { onClick: () => void };
    };
    _laChatButton?: { onClick: () => void };
  }
}

const Contact = () => {
  const getUserFirstName = useAuthStore((s) => s.getUserFirstName);
  const getUserLastName = useAuthStore((s) => s.getUserLastName);
  const getUserType = useAuthStore((s) => s.getUserType);
  const user = useAuthStore((s) => s.user);
  const userProfile = useAuthStore((s) => s.userProfile);

  useEffect(() => {
    const email = user?.email ?? "";
    const firstName = getUserFirstName();
    const lastName = getUserLastName();
    const userType = getUserType() ?? "";
    const companyName = userProfile?.organisation?.name ?? "";
    const userId = String(user?.userDetailsV2?.id ?? user?.id ?? "");

    const initScript = document.createElement("script");
    initScript.id = "la_x2s6df8d_init";
    initScript.innerHTML = `
      (function(d, src, c) {
        var t = d.scripts[d.scripts.length - 1],
            s = d.createElement('script');
        s.id = 'la_x2s6df8d';
        s.defer = true;
        s.src = src;
        s.onload = s.onreadystatechange = function() {
          var rs = this.readyState;
          if (rs && (rs !== 'complete') && (rs !== 'loaded')) return;
          if (${JSON.stringify(email)}) {
            LiveAgent.setUserDetails(
              ${JSON.stringify(email)},
              ${JSON.stringify(firstName)},
              ${JSON.stringify(lastName)},
              ''
            );
          }
          if (${JSON.stringify(userType)}) {
            LiveAgent.addContactField('user-type', ${JSON.stringify(userType)});
          }
          if (${JSON.stringify(companyName)}) {
            LiveAgent.addContactField('company-name', ${JSON.stringify(companyName)});
          }
          if (${JSON.stringify(userId)}) {
            LiveAgent.addContactField('user-id', ${JSON.stringify(userId)});
          }
          c(this);
        };
        t.parentElement.insertBefore(s, t.nextSibling);
      })(document, 'https://uniconnected.ladesk.com/scripts/track.js', function(e) {
        window._laChatButton = LiveAgent.createButton('p6n4e9xe', e);
      });
    `;
    document.body.appendChild(initScript);

    return () => {
      document.getElementById("la_x2s6df8d_init")?.remove();
      document.getElementById("la_x2s6df8d")?.remove();
    };
  }, [
    user,
    getUserFirstName,
    getUserLastName,
    getUserType,
    userProfile?.organisation?.name,
  ]);

  const openChat = () => {
    window._laChatButton?.onClick();
  };

  return (
    <Box
      bg="white"
      w="100%"
      mx="auto"
      maxW="800px"
      borderRadius="lg"
      p={{ base: 4, lg: 8 }}
    >
      <VStack gap={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading as="h1" size="2xl" color="gray.900" mb={2}>
            Support
          </Heading>
          <Text color="gray.500" fontSize="lg">
            Get help from our AI assistant or reach us directly.
          </Text>
        </Box>

        {/* Chat CTA */}
        <Box
          borderRadius="xl"
          border="1px solid"
          borderColor="profile.200"
          bg="profile.50"
          p={{ base: 5, lg: 8 }}
        >
          <HStack gap={4} align="flex-start">
            <Box
              bg="profile.500"
              borderRadius="xl"
              p={3}
              flexShrink={0}
              color="white"
            >
              <MessageCircle size={24} />
            </Box>
            <VStack align="flex-start" gap={2} flex={1}>
              <Heading as="h2" size="md" color="gray.900">
                Chat with UniBot, our friendly AI assistant
              </Heading>
              <Text color="gray.600" fontSize="sm" lineHeight="tall">
                Get instant answers to your questions. If the assistant
                can&apos;t resolve your issue, you can leave a message and our
                team will follow up.
              </Text>
              <Button
                mt={2}
                bg="profile.500"
                color="white"
                size="md"
                borderRadius="lg"
                _hover={{ bg: "profile.600" }}
                onClick={openChat}
              >
                Start a chat
              </Button>
            </VStack>
          </HStack>
        </Box>

        <HStack gap={4} align="center">
          <Separator flex={1} />
          <Text color="gray.400" fontSize="sm" flexShrink={0}>
            or
          </Text>
          <Separator flex={1} />
        </HStack>

        {/* Email fallback */}
        <Box
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.200"
          p={{ base: 5, lg: 8 }}
        >
          <HStack gap={4} align="flex-start">
            <Box
              bg="gray.100"
              borderRadius="xl"
              p={3}
              flexShrink={0}
              color="gray.500"
            >
              <Mail size={24} />
            </Box>
            <VStack align="flex-start" gap={2} flex={1}>
              <Heading as="h2" size="md" color="gray.900">
                Send us an email
              </Heading>
              <Text color="gray.600" fontSize="sm" lineHeight="tall">
                Prefer to write to us? Reach out at{" "}
                <Link
                  href="mailto:contactus@uniconnected.com"
                  color="blue.600"
                  _hover={{ color: "blue.800" }}
                  textDecoration="underline"
                >
                  contactus@uniconnected.com
                </Link>{" "}
                and we&apos;ll respond within 1–2 business days.
              </Text>
            </VStack>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default Contact;
