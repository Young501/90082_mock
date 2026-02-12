"use client";

import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ChevronRight, User, Building2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { userTypesData } from "@/utils/constants";

const HEXAGON_CLIP = "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)";

const MotionBox = motion.create(Box);

export default function UserTypePage() {
  const router = useRouter();
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  const handleSelect = (typeKey: string) => {
    const params = new URLSearchParams({ "user-type": typeKey });
    router.push(`/signup/?${params.toString()}`);
  };

  return (
    <>
      <PageTitle title={PAGE_TITLES.USER_TYPE} />
      <Box w="100%" display="flex" alignItems="center" justifyContent="center">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          w="100%"
          maxW="600px"
          bg="white"
          borderRadius="2xl"
          py={{ base: 6, md: 8 }}
          px={{ base: 6, md: 12 }}
          boxShadow="xl"
        >
          <VStack align="stretch" gap={6}>
            <VStack align="stretch" gap={2} textAlign="left">
              <Heading
                fontSize={{ base: "2xl", md: "4xl" }}
                fontWeight="600"
                color="black"
                lineHeight="1.2"
              >
                Get started
              </Heading>
              <Text
                fontSize={{ base: "sm", md: "md" }}
                color="black"
                lineHeight="1.5"
                opacity={0.9}
              >
                To begin this journey, tell us what type of account you&apos;d
                be opening.
              </Text>
            </VStack>

            <VStack gap={4} align="stretch">
              {userTypesData.map((option, index) => {
                const isHovered = hoveredType === option.key;
                const IconComponent = option.icon;

                return (
                  <MotionBox
                    key={option.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: 0.1 + index * 0.1,
                      ease: "easeOut",
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Flex
                      as="button"
                      w="100%"
                      align="center"
                      gap={4}
                      px={{ base: 3, md: 6 }}
                      py={{ base: 4, md: 5 }}
                      borderRadius="xl"
                      bg={isHovered ? userTypesData[index].bgColor : "white"}
                      borderColor={
                        isHovered ? userTypesData[index].borderColor : "none"
                      }
                      cursor="pointer"
                      textAlign="left"
                      transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                      boxShadow="0px 2px 14px 1px #0000000F"
                      _hover={{
                        bg: userTypesData[index].bgColor,
                        border: `1px solid ${userTypesData[index].borderColor}`,

                        boxShadow: "0px 4px 14px 1px #0000000A",
                      }}
                      onClick={() => handleSelect(option.key)}
                      onMouseEnter={() => setHoveredType(option.key)}
                      onMouseLeave={() => setHoveredType(null)}
                    >
                      <MotionBox
                        position="relative"
                        w="52px"
                        h="52px"
                        flexShrink={0}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        animate={{ scale: isHovered ? 1.02 : 1 }}
                      >
                        <Box
                          position="absolute"
                          inset={0}
                          bg={
                            isHovered ? userTypesData[index].bgColor : "#E4E4E7"
                          }
                          clipPath={HEXAGON_CLIP}
                        />
                        <Box
                          position="absolute"
                          top="2px"
                          left="2px"
                          right="2px"
                          bottom="2px"
                          bg={isHovered ? userTypesData[index].color : "white"}
                          clipPath={HEXAGON_CLIP}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <IconComponent
                            size={option.iconSize}
                            color={
                              isHovered ? "white" : userTypesData[index].color
                            }
                            aria-hidden
                          />
                        </Box>
                      </MotionBox>

                      <Box flex={1} w="100%">
                        <VStack
                          flex={1}
                          align="stretch"
                          gap={1}
                          minW={0}
                          maxW="239px"
                        >
                          <Text fontSize="md" fontWeight="500" color="black">
                            {option.name}
                          </Text>
                          <Text fontSize="sm" color="#52525B" lineHeight="1.4">
                            {option.description}
                          </Text>
                        </VStack>
                      </Box>

                      <MotionBox
                        animate={{
                          opacity: isHovered ? 1 : 0,
                          x: isHovered ? 0 : -4,
                        }}
                        transition={{ duration: 0.2 }}
                        flexShrink={0}
                      >
                        <ArrowRight
                          size={24}
                          color={userTypesData[index].color}
                          aria-hidden
                        />
                      </MotionBox>
                    </Flex>
                  </MotionBox>
                );
              })}
            </VStack>

            {/* <Flex
              pt={4}
              borderTop="1px solid"
              borderColor="gray.200"
              justify="center"
            >
              <Box
                as="button"
                fontSize="sm"
                color="gray.600"
                _hover={{ color: "#002157", textDecoration: "underline" }}
                transition="color 0.2s"
                onClick={() => handleSelect("coordinator")}
              >
                I&apos;m a Coordinator
              </Box>
            </Flex> */}
          </VStack>
        </MotionBox>
      </Box>
    </>
  );
}
