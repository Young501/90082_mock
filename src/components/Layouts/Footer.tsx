import { Box, Text, VStack, HStack } from "@chakra-ui/react";
import React from "react";
import Image from "next/image";
import Link from "next/link";
// import NewsletterSubscribe from "./NewsletterSubscribe";
import { SOCIAL_MEDIA_LINKS, CONTACT_EMAIL } from "@/utils/constants";

const Footer = () => {
  return (
    <Box mt="auto" w="100%">
      {/* <NewsletterSubscribe /> */}
      <Box
        bg="#0A425F"
        backgroundImage="url('/assets/Backgroundwaves.svg')"
        backgroundSize="auto"
        // backgroundPosition="center"
        backgroundRepeat="repeat"
      >
        <VStack
          display="flex"
          alignItems={{ base: "center", lg: "stretch" }}
          px={{ base: 4, lg: 20 }}
          color="white"
          py={14}
          w="100%"
          maxW="1440px"
          mx="auto"
          gap={{ base: 8, lg: 6 }}
          justifyContent="center"
          borderTop="1px solid #E4E4E7"
        >
          <Box
            display="flex"
            flexDirection={{ base: "column", lg: "row" }}
            alignItems={{ base: "center", lg: "center" }}
            justifyContent={{ base: "center", lg: "space-between" }}
            w="100%"
            gap={{ base: 6, lg: 4 }}
          >
            <Box flexShrink={0}>
              <Image
                src="/assets/uniconnectedLogoBlueVariant.png"
                alt="Uniconnected"
                width={233}
                height={56}
              />
            </Box>

            <HStack
              flexDirection={{ base: "column", lg: "row" }}
              alignItems={{ base: "center", lg: "center" }}
              justifyContent={{ base: "center", lg: "flex-end" }}
              gap={{ base: 4, lg: 8 }}
              w={{ base: "100%", lg: "auto" }}
            >
              <HStack
                gap={2}
                whiteSpace="nowrap"
                flexWrap="nowrap"
                justifyContent={{ base: "center", lg: "flex-start" }}
              >
                <Text
                  fontSize="14px"
                  fontWeight="600"
                  color="#FAFAFA"
                  textTransform="capitalize"
                >
                  contact us :
                </Text>
                <Link
                  href={`mailto:${CONTACT_EMAIL}`}
                  style={{ textDecoration: "none", cursor: "pointer" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Text
                    as="span"
                    fontSize="14px"
                    fontWeight="600"
                    color="#2AA8E0"
                    whiteSpace="nowrap"
                    // textTransform="capitalize"
                  >
                    {CONTACT_EMAIL}
                  </Text>
                </Link>
              </HStack>

              <HStack
                gap={2}
                alignItems="center"
                justifyContent={{ base: "center", lg: "flex-start" }}
              >
                <Text
                  fontSize="14px"
                  fontWeight="600"
                  color="#FAFAFA"
                  whiteSpace="nowrap"
                  textTransform="capitalize"
                >
                  follow us :
                </Text>
                <HStack gap={2}>
                  {SOCIAL_MEDIA_LINKS.map((link) => (
                    <Link
                      key={link.name}
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#2AA8E0",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        padding: "6px",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      <link.icon size={12} />
                    </Link>
                  ))}
                </HStack>
              </HStack>
            </HStack>
          </Box>

          <Text
            fontSize="14px"
            fontWeight="400"
            textAlign="center"
            color="#A1A1AA"
          >
            Copyright © Uniconnected {new Date().getFullYear()}
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default Footer;
