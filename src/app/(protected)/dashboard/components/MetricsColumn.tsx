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
  const gradient = `linear-gradient(90deg, ${colors.dark} 0%, ${colors.primary} 100%)`;

  return (
    <Box
      w="100%"
      position="relative"
      borderRadius={{ base: "10px", lg: "15px" }}
      boxShadow="0px 4px 4px 0px rgba(0, 0, 0, 0.25)"
      overflow="hidden"
      height={{ base: "36px", md: "42px", lg: "48px" }}
      bg={colors.tint}
    >
      <Box
        bg={gradient}
        h={{ base: "36px", md: "42px", lg: "48px" }}
        borderRadius={{ base: "10px", lg: "15px" }}
        width={`${percentage}%`}
        position="absolute"
        left={0}
      />
      <Box
        bg={gradient}
        h={{ base: "36px", md: "42px", lg: "48px" }}
        borderRadius={{ base: "10px", lg: "15px" }}
        width="100%"
        opacity={0.5}
        position="relative"
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
          fontWeight="700"
          textAlign="center"
          fontSize={{ base: "16px", lg: "22px" }}
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
        borderRadius="10px"
        p={{ base: 4, md: 6, lg: 8 }}
        boxShadow="-4.3px 4.3px 11.71px 4.3px rgba(0, 0, 0, 0.24)"
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
              borderRadius="10px"
              width="60px"
              height="60px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
              boxShadow="0px 4px 4px 0px rgba(0, 0, 0, 0.25)"
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
