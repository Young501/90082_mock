"use client";

import React from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

interface MetricItem {
  label: string;
  value: number;
  total: number;
}

interface MetricsColumnColors {
  primary: string;
  tint: string;
  dark: string;
}

interface MetricsColumnProps {
  title: string;
  iconSrc: string;
  iconAlt: string;
  colors: MetricsColumnColors;
  invitedLabel: string;
  invitedCount: number;
  metrics: MetricItem[];
  buttonLabel: string;
  onManage: () => void;
}

const calculatePercentage = (value: number, total: number) =>
  total > 0 ? Math.round((value / total) * 100) : 0;

const ProgressBar = ({
  value,
  total,
  colors,
}: {
  value: number;
  total: number;
  colors: MetricsColumnColors;
}) => {
  const percentage = calculatePercentage(value, total);

  return (
    <Box
      w="100%"
      position="relative"
      borderRadius="6px"
      overflow="hidden"
      height={{ base: "32px", md: "36px", lg: "40px" }}
      bg={colors.tint}
      border="1px solid"
      borderColor="#E4E4E7"
    >
      <Box
        bg={colors.primary}
        h="100%"
        width={`${percentage}%`}
        position="absolute"
        left={0}
        top={0}
      />
      <Flex
        position="absolute"
        left={0}
        top={0}
        bottom={0}
        width="100%"
        alignItems="center"
        justifyContent="center"
        px={4}
      >
        <Text
          fontWeight="600"
          textAlign="center"
          fontSize={{ base: "14px", lg: "16px" }}
          color="#000000"
        >
          {value} ({percentage}%)
        </Text>
      </Flex>
    </Box>
  );
};

export function MetricsColumn({
  title,
  iconSrc,
  iconAlt,
  colors,
  invitedLabel,
  invitedCount,
  metrics,
  buttonLabel,
  onManage,
}: MetricsColumnProps) {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const iconSize = isMobile ? 40 : 52;
  const imageSize = isMobile ? 20 : 28;

  return (
    <VStack gap={4} align="stretch">
      <Box
        bg="white"
        borderRadius="12px"
        p={{ base: 4, md: 6, lg: 8 }}
        border="1px solid"
        borderColor="#E4E4E7"
        width="100%"
      >
        <HStack mb={{ base: 3, md: 4, lg: 5 }} gap={3}>
          <Box
            bg={colors.primary}
            borderRadius="md"
            width={`${iconSize}px`}
            height={`${iconSize}px`}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Image
              src={iconSrc}
              alt={iconAlt}
              width={imageSize}
              height={imageSize}
              style={{ width: "auto", height: "auto" }}
            />
          </Box>
          <Text
            fontSize={{ base: "20px", lg: "24px" }}
            fontWeight="600"
            color="#000000"
          >
            {title}
          </Text>
        </HStack>

        <VStack align="stretch" gap={3}>
          <HStack justify="space-between" align="center" gap={4}>
            <Text
              fontSize={{ base: "15px", lg: "18px" }}
              fontWeight="600"
              color="#000000"
              flex={1}
            >
              {invitedLabel}
            </Text>
            <Box
              bg={colors.tint}
              borderRadius="8px"
              width="60px"
              height="60px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
              border="1px solid"
              borderColor="#E4E4E7"
            >
              <Text
                fontSize={{ base: "20px", lg: "22px" }}
                fontWeight="bold"
                color="#000000"
              >
                {invitedCount}
              </Text>
            </Box>
          </HStack>

          {metrics.map((item, index) => (
            <Box key={index} display="flex" flexDirection="column" gap={1}>
              <Text
                fontSize={{ base: "14px", md: "15px", lg: "17px" }}
                fontWeight="600"
                color="#000000"
                lineHeight="1.4"
              >
                {item.label}
              </Text>
              <ProgressBar
                value={item.value}
                total={item.total}
                colors={colors}
              />
            </Box>
          ))}
        </VStack>
      </Box>

      <Button
        variant="primary"
        color="white"
        size="lg"
        height="56px"
        borderRadius="xl"
        fontWeight="bold"
        fontSize="18px"
        width="100%"
        onClick={onManage}
      >
        {buttonLabel}
      </Button>
    </VStack>
  );
}
