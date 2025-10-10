"use client";

import { Box, Image } from "@chakra-ui/react";

interface LogoProps {
  variant?: "main" | "header" | "footer";
  width?: string | number;
  height?: string | number;
}

export default function Logo({
  variant = "main",
  width = "233px",
  height = "233px",
}: LogoProps) {
  return (
    <Box>
      <Image
        src={"/assets/logo.svg"}
        alt="UniConnected Logo"
        width={width}
        height={height}
        style={{ objectFit: "contain" }}
      />
    </Box>
  );
}
