"use client";

import { Box, VStack, HStack, Text, Input, InputGroup } from "@chakra-ui/react";
import { useState } from "react";
import { Mail } from "lucide-react";
import { ButtonV2 } from "../ui/ButtonV2";
import { InputField } from "../ui/Input";

const NewsletterSubscribe = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to newsletter API
    console.log("Subscribe:", email);
  };

  return (
    <Box
      bg="#0A425F"
      backgroundImage="url('/assets/Backgroundwaves.svg')"
      backgroundSize="auto"
      // backgroundPosition="center"
      backgroundRepeat="repeat"
      w="100%"
      pt={14}
      pb={6}
      px={{ base: 4, lg: 20 }}
    >
      <VStack
        maxW="1440px"
        mx="auto"
        gap={8}
        alignItems="center"
        textAlign="center"
      >
        <VStack gap={3} alignItems="center" maxW="384px">
          <Text fontSize="2xl" fontWeight="bold" color="#FAFAFA">
            Subscribe to our newsletter
          </Text>

          <Text fontSize="sm" fontWeight="400" color="#FAFAFA">
            Stay informed on opportunities, updates, and insights from
            UniConnected.
          </Text>
        </VStack>

        <Box as="form" onSubmit={handleSubmit} w="100%" maxW="480px">
          <HStack gap={4} alignItems="stretch">
            <InputField
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              inputStyles={{
                h: "48px",
                bg: "transparent",
                border: "1px solid white",
                borderRadius: "md",
                color: "#A1A1AA",
                _placeholder: { color: "#A1A1AA" },
                _focus: {
                  outline: "none",
                },
              }}
              startElement={<Mail size={20} color="#A1A1AA" />}
            />
            <ButtonV2
              type="submit"
              bg="#2AA8E0"
              color="white"
              fontWeight="600"
              borderRadius="lg"
              h="48px"
              fontSize="sm"
              px={6}
              flexShrink={0}
              _active={{
                transform: "scale(0.98)",
              }}
            >
              Subscribe
            </ButtonV2>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default NewsletterSubscribe;
