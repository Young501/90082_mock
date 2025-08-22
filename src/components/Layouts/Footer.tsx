import { Box, Text, VStack } from "@chakra-ui/react";
import React from "react";
import Logo from "../Logo";
import Image from "next/image";

const Footer = () => {
  return (
    <div style={{ marginTop: "auto", width: "100%" }}>
      <Box
        bg="#002157"
        h="180px"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={{ base: 4, lg: 8 }}
        color="white"
      >
        <VStack align="start" gap={2}>
          <Text fontSize="20px" fontWeight="700">
            Need Help? Contact Us
          </Text>
          <Text fontSize="20px" fontWeight="700">
            Copyright © UniConnected 2025.
          </Text>
        </VStack>

        <Image alt="logo" src="/uni.png" width={300} height={80} />
      </Box>
    </div>
  );
};

export default Footer;
