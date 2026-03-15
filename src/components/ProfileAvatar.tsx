"use client";

import React, { useState, useEffect } from "react";
import { Box } from "@chakra-ui/react";

const SIZE_MAP = {
  xs: "24px",
  sm: "32px",
  md: "40px",
  lg: "60px",
  xl: "80px",
} as const;

export interface ProfileAvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: keyof typeof SIZE_MAP | string | number;
  fallbackBg?: string;
  fallbackColor?: string;
  fallbackFontSize?: string;
  className?: string;
  borderRadius?: string;
}

export function ProfileAvatar({
  src,
  alt,
  fallback,
  size = "lg",
  fallbackBg = "#E4E4E7",
  fallbackColor = "black",
  fallbackFontSize = "sm",
  className,
  borderRadius = "full",
}: ProfileAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const resolvedSize =
    typeof size === "string" && size in SIZE_MAP
      ? SIZE_MAP[size as keyof typeof SIZE_MAP]
      : typeof size === "number"
        ? `${size}px`
        : size;
  const showImage = src && !imgError;

  useEffect(() => {
    setImgError(false);
  }, [src]);

  return (
    <Box
      w={resolvedSize}
      h={resolvedSize}
      minW={resolvedSize}
      minH={resolvedSize}
      borderRadius={borderRadius}
      overflow="hidden"
      flexShrink={0}
      bg={fallbackBg}
      position="relative"
      className={className}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt ?? ""}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          loading="eager"
          onError={() => setImgError(true)}
        />
      ) : (
        <Box
          w="100%"
          h="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg={fallbackBg}
          color={fallbackColor}
          fontSize={fallbackFontSize}
          fontWeight="600"
        >
          {fallback?.slice(0, 2).toUpperCase() ?? "?"}
        </Box>
      )}
    </Box>
  );
}
