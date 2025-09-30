import { Box, Text, VStack } from "@chakra-ui/react";
import React from "react";
import Logo from "../Logo";
import Image from "next/image";
// import { useBreakpointValue } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

const Footer = () => {
  // const isMobile = useBreakpointValue({ base: false, lg: true });
  const router = useRouter();
  return (
    <div style={{ marginTop: "auto", width: "100%" }}>
      <Box
        bg="#002157"
        h={{ base: "90px", lg: "180px" }}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={{ base: 4, lg: 8 }}
        color="white"
      >
        <VStack align="start" gap={2}>
          <Text fontSize={{ base: "10px", lg: "20px" }} fontWeight="700">
            Need Help?{" "}
            <span
              style={{ textDecoration: "underline", cursor: "pointer" }}
              onClick={() => {
                router.push("/contact");
              }}
            >
              Contact Us
            </span>
          </Text>
          <Text fontSize={{ base: "10px", lg: "20px" }} fontWeight="700">
            Copyright © UniConnected 2025.
          </Text>
        </VStack>

        <Box
          display={{ base: "block", md: "none" }}
          pos="relative"
          w="100px"
          h="22px"
        >
          <Image
            alt="logo"
            src="/uni.png"
            fill
            style={{ objectFit: "contain" }}
          />
        </Box>

        <Box
          display={{ base: "none", md: "block" }}
          pos="relative"
          w="300px"
          h="80px"
        >
          <Image
            alt="logo"
            src="/uni.png"
            fill
            style={{ objectFit: "contain" }}
          />
        </Box>
      </Box>
    </div>
  );
};

export default Footer;
