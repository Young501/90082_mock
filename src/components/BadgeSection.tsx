import React from "react";
import { Box, Text, Badge, Flex } from "@chakra-ui/react";

interface BadgeSectionProps {
  title: string;
  items: string | string[] | undefined | null;
  titleProps?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    mb?: number;
    ml?: number;
  };
  withinDistance?: string;
  showFallback?: boolean;
  fallbackText?: string;
  badgeProps?: {
    bg?: string;
    color?: string;
    borderRadius?: string;
    px?: number;
    py?: number;
  };
}

const BadgeSection = ({
  title,
  items,
  withinDistance,
  titleProps = {
    fontSize: "14px",
    fontWeight: "600",
    color: "black",
    mb: 3,
  },
  showFallback = false,
  fallbackText = "Not specified",
  badgeProps = {
    bg: "#FFB3AC",
    color: "#000000",
  },
}: BadgeSectionProps) => {
  if (!items && !showFallback) return null;

  const itemsArray = React.useMemo(() => {
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  }, [items]);

  if (itemsArray.length === 0 && showFallback) {
    return (
      <Box w="full">
        <Text {...titleProps}>{title}</Text>
        <Text fontSize="md">{fallbackText}</Text>
      </Box>
    );
  }

  if (itemsArray.length === 0) return null;

  const renderItem = (item: string) => {
    return (
      item +
      " " +
      (withinDistance && item === "Within" ? `${withinDistance} km` : "")
    );
  };

  return (
    <Box w="full">
      <Text {...titleProps}>{title}</Text>
      <Flex gap={2} flexWrap="wrap" ml={4}>
        {itemsArray.map((item, index) => (
          <Badge key={index} {...badgeProps} px={4} py={1} borderRadius="20px">
            {renderItem(item)}
          </Badge>
        ))}
      </Flex>
    </Box>
  );
};

export default BadgeSection;
