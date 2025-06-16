"use client"

import {
    Box,
    Button,
    Flex,
    Heading,
    IconButton,
    Text,
    VStack,
    useBreakpointValue,
} from "@chakra-ui/react"
import { motion, AnimatePresence, scale } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { setUserType } from "@/api"
import Image from "next/image"
import { useAuthStore } from "@/store/authStore"

const MotionBox = motion.create(Box)
const MotionFlex = motion.create(Flex)

interface UserTypeData {
    key: string
    name: string
    color: string
    bgColor: string
    shadowColor: string
}

const userTypesData: UserTypeData[] = [
    {
        key: "student",
        name: "STUDENT",
        color: "#DC2626",
        bgColor: "#DC2626",
        shadowColor: "rgba(220, 38, 38, 0.25)",
    },
    {
        key: "alumni",
        name: "ALUMNI",
        color: "#EAB308",
        bgColor: "#EAB308",
        shadowColor: "rgba(234, 179, 8, 0.15)",
    },
    {
        key: "academic",
        name: "ACADEMIC",
        color: "#173DA6",
        bgColor: "#183DA6",
        shadowColor: "rgba(23, 61, 166, 0.36)",
    },
    {
        key: "partner",
        name: "INDUSTRY PARTNER",
        color: "#089C3F",
        bgColor: "#089C3F",
        shadowColor: "rgba(8, 156, 63, 0.25)",
    },
]

export default function UserTypePage() {
    const router = useRouter()
    const [selectedType, setSelectedType] = useState<string | null>(null)
    const [isAnimating, setIsAnimating] = useState(false)
    const setSignupSelectedUserType = useAuthStore(state => state.setSignupSelectedUserType)

    const boxSize = useBreakpointValue({
        base: { w: "280px", h: "200px" },
        md: { w: "326px", h: "233px" },
    })

    const handleSelect = async (typeKey: string) => {
        if (isAnimating) return

        setIsAnimating(true)
        setSelectedType(typeKey)

        setTimeout(() => {
            setIsAnimating(false)
        }, 400)
    }

    const handleBack = () => {
        if (isAnimating) return
        setIsAnimating(true)
        setSelectedType(null)
        setTimeout(() => {
            setIsAnimating(false)
        }, 400)
    }

    const handleLogin = (typeKey: string) => {
        setSignupSelectedUserType(typeKey)
        router.push("/signup")
    }

    const getExpandedContent = (type: UserTypeData) => {
        const descriptions = {
            student:
                "Create a profile and discover opportunities for employment, learning and growth",
            alumni: "Connect with current students and share your professional experience",
            academic:
                "Engage with students and industry partners for research collaboration",
            industry:
                "Find talented students and collaborate with academic institutions",
        }

        return (
            <>
                <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    h="100%"
                    textAlign="center"
                    px={{ base: 4, lg: 8 }}
                >
                    <VStack gap={{ base: 3, lg: 6 }}>
                        <Heading
                            fontSize={{
                                base: "10px",
                                md: "14px",
                                lg: "17.5px",
                            }}
                            fontWeight="700"
                            color="white"
                            textAlign="center"
                            lineHeight="1.2"
                        >
                            {type.name}
                        </Heading>

                        <Text
                            fontSize={{ base: "7px", md: "12px", lg: "9px" }}
                            color="white"
                            maxW="400px"
                            textAlign="center"
                            opacity={0.9}
                        >
                            {
                                descriptions[
                                    type.key as keyof typeof descriptions
                                ]
                            }
                        </Text>

                        <Button
                            bg="rgba(255,255,255,0.2)"
                            color="white"
                            border="2px solid white"
                            _hover={{ bg: "rgba(255,255,255,0.3)" }}
                            _active={{ transform: "scale(0.95)" }}
                            size={{ base: "md", lg: "lg" }}
                            borderRadius="full"
                            px={{ base: 4, lg: 8 }}
                            py={{ base: 2, lg: 3 }}
                            onClick={(e) => {
                                e.stopPropagation()
                                handleLogin(type.key)
                            }}
                            fontSize={{ base: "8px", md: "12px", lg: "18px" }}
                            fontWeight="700"
                            transition="all 0.2s ease"
                            minH={{ base: "24px", lg: "auto" }}
                        >
                            SIGN UP
                        </Button>
                    </VStack>
                </Flex>
            </>
        )
    }

    return (
        <Box
            display={["block", "block", "block", "flex"]}
            // justifyContent={"center"}
            flexDirection={"column"}
            w="100%"
            h="inherit"
            m={"auto"}
            px="0"
            overflowY="auto"
        >
            <Flex
                direction={{ base: "column", lg: "row" }}
                align="center"
                justify="space-between"
                // gap={{ base: 6, md: 8 }}
                flex="1"
            >
                <VStack
                    gap={{ base: 4, md: 6 }}
                    flex="1"
                    maxW={{ base: "100%", lg: "600px" }}
                    textAlign="center"
                    mb={{ base: 0, lg: 0 }}
                >
                    <Box
                        w={{
                            base: "120px",
                            sm: "150px",
                            md: "200px",
                            lg: "233px",
                        }}
                        h={{
                            base: "120px",
                            sm: "150px",
                            md: "200px",
                            lg: "233px",
                        }}
                        position="relative"
                    >
                        <Image
                            src="/assets/mini-logo.png"
                            fill
                            alt="logo"
                            style={{ objectFit: "contain" }}
                        />
                    </Box>

                    <VStack gap={{ base: 3, md: 4 }}>
                        <Heading
                            fontSize={{
                                base: "24px",
                                sm: "28px",
                                md: "42px",
                                lg: "55px",
                            }}
                            fontWeight="700"
                            color="black"
                            lineHeight="1.21"
                            textAlign="center"
                            px={{ base: 2, md: 0 }}
                        >
                            Discover Your Connections Here
                        </Heading>

                        <Text
                            fontSize={{
                                base: "14px",
                                sm: "16px",
                                md: "20px",
                                lg: "25px",
                            }}
                            color="black"
                            lineHeight="1.4"
                            textAlign="center"
                            maxW={{ base: "100%", md: "500px" }}
                            px={{ base: 2, md: 0 }}
                        >
                            Connect with opportunities tailored to your studies,
                            skills and career goals
                        </Text>
                    </VStack>
                </VStack>

                <Box
                    w="100%"
                    maxW="676px"
                    mx="auto"
                    mt={{ base: 2, md: 6, lg: 14 }}
                >
                    <Box
                        flex="1"
                        maxW={{ base: "100%", lg: "676px" }}
                        position="relative"
                        h={{
                            base: "280px",
                            sm: "320px",
                            md: "400px",
                            lg: "484px",
                        }}
                        mx={{ base: 2, md: 0 }}
                    >
                        <MotionFlex
                            wrap="wrap"
                            gap={{ base: 3, sm: 4, md: 6 }}
                            w="100%"
                            h="100%"
                            position="relative"
                        >
                            {userTypesData.map((type, index) => {
                                const isSelected = selectedType === type.key
                                const isAnySelected = selectedType !== null

                                const getTransformOrigin = () => {
                                    if (index === 0) return "left top"
                                    if (index === 1) return "right top"
                                    if (index === 2) return "left bottom"
                                    if (index === 3) return "right bottom"
                                    return "center"
                                }

                                return (
                                    <MotionBox
                                        key={type.key}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{
                                            opacity:
                                                isAnySelected && !isSelected
                                                    ? 0
                                                    : 1,
                                            scale: isSelected ? 2.1 : 1,
                                            zIndex: isSelected ? 10 : 1,
                                        }}
                                        transition={{
                                            delay: isAnySelected
                                                ? 0
                                                : index * 0.1,
                                            duration: 0.4,
                                            ease: "easeInOut",
                                        }}
                                        w={{
                                            base: "calc(50% - 6px)",
                                            sm: "calc(50% - 8px)",
                                            md: "calc(50% - 12px)",
                                        }}
                                        h={{
                                            base: "calc(50% - 6px)",
                                            sm: "calc(50% - 8px)",
                                            md: "calc(50% - 12px)",
                                        }}
                                        position="relative"
                                        style={{
                                            transformOrigin:
                                                getTransformOrigin(),
                                        }}
                                    >
                                        <MotionBox
                                            position="absolute"
                                            initial={{
                                                scale: 1,
                                            }}
                                            animate={{
                                                top: isSelected
                                                    ? 16
                                                    : (() => {
                                                          if (
                                                              index === 0 ||
                                                              index === 1
                                                          )
                                                              return "calc(100% - 53px)"
                                                          return "calc(100% - 53px)"
                                                      })(),
                                                left: isSelected
                                                    ? 16
                                                    : (() => {
                                                          if (
                                                              index === 0 ||
                                                              index === 2
                                                          )
                                                              return "calc(100% - 53px)"
                                                          return "calc(100% - 53px)"
                                                      })(),
                                                width: isSelected
                                                    ? "40px"
                                                    : "37px",
                                                height: isSelected
                                                    ? "40px"
                                                    : "37px",
                                                backgroundColor: isSelected
                                                    ? "rgba(255,255,255,0.2)"
                                                    : type.key === "student"
                                                    ? "#F87C7C"
                                                    : type.key === "alumni"
                                                    ? "#FDE047"
                                                    : type.key === "academic"
                                                    ? "#A3CFFF"
                                                    : "#BBF7D0",
                                                scale: [0.6],
                                            }}
                                            transition={{
                                                duration: 0.4,
                                                ease: "easeInOut",
                                                delay: 0.3,
                                            }}
                                            borderRadius="50%"
                                            zIndex={40}
                                            cursor={
                                                isSelected
                                                    ? "pointer"
                                                    : "default"
                                            }
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            onClick={
                                                isSelected
                                                    ? (e) => {
                                                          e.stopPropagation()
                                                          handleBack()
                                                      }
                                                    : () => {
                                                          handleSelect(type.key)
                                                      }
                                            }
                                            _hover={
                                                isSelected
                                                    ? {
                                                          bg: "rgba(255,255,255,0.3)",
                                                      }
                                                    : {}
                                            }
                                        >
                                            <AnimatePresence mode="wait">
                                                {isSelected ? (
                                                    <motion.div
                                                        key="back-icon"
                                                        initial={{
                                                            opacity: 0,
                                                            scale: 0.5,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            scale: [1],
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            scale: 0.5,
                                                        }}
                                                        transition={{
                                                            delay: 0.3,
                                                            duration: 0.3,
                                                        }}
                                                    >
                                                        <ChevronLeft
                                                            size={20}
                                                            color="white"
                                                        />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="empty"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{
                                                            duration: 0.2,
                                                        }}
                                                    />
                                                )}
                                            </AnimatePresence>
                                        </MotionBox>
                                        <Box
                                            bg={type.bgColor}
                                            w="100%"
                                            h="100%"
                                            borderRadius="19px"
                                            position="relative"
                                            cursor={
                                                isAnySelected && !isSelected
                                                    ? "default"
                                                    : "pointer"
                                            }
                                            transition="all 0.3s ease"
                                            _hover={
                                                !isAnySelected
                                                    ? {
                                                          transform:
                                                              "scale(1.02)",
                                                          boxShadow: `0px 0px 8px 6px ${type.shadowColor}`,
                                                      }
                                                    : {}
                                            }
                                            onClick={() =>
                                                !isAnySelected &&
                                                handleSelect(type.key)
                                            }
                                            boxShadow={`0px 0px 4px 3px ${type.shadowColor}`}
                                        >
                                            <Box
                                                bg={type.bgColor}
                                                w="calc(100% - 16px)"
                                                h="calc(100% - 16px)"
                                                borderRadius="19px"
                                                position="absolute"
                                                top="8px"
                                                left="8px"
                                                display="flex"
                                                flexDirection="column"
                                                alignItems="center"
                                                justifyContent="center"
                                                gap={4}
                                                overflow="hidden"
                                                padding={"4px"}
                                            >
                                                <Flex
                                                    rounded={"19px"}
                                                    justifyContent={"center"}
                                                    alignItems={"center"}
                                                    minH="100%"
                                                    w="100%"
                                                    h="100%"
                                                    shadow={
                                                        "0px 0px 4px 3px #00000026"
                                                    }
                                                    margin={"4px"}
                                                >
                                                    {isSelected ? (
                                                        <MotionBox
                                                            initial={{
                                                                opacity: 0,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                            }}
                                                            transition={{
                                                                delay: 0.3,
                                                                duration: 0.3,
                                                            }}
                                                            w="100%"
                                                            h="100%"
                                                            position="relative"
                                                        >
                                                            {getExpandedContent(
                                                                type
                                                            )}
                                                        </MotionBox>
                                                    ) : (
                                                        <>
                                                            <Text
                                                                fontSize={{
                                                                    base: "14px",
                                                                    sm: "16px",
                                                                    md: "24px",
                                                                    lg: "35px",
                                                                }}
                                                                fontWeight="700"
                                                                color="white"
                                                                textAlign="center"
                                                                lineHeight="1.21"
                                                                px={{
                                                                    base: 1,
                                                                    md: 2,
                                                                }}
                                                            >
                                                                {type.name}
                                                            </Text>
                                                        </>
                                                    )}
                                                </Flex>
                                            </Box>
                                        </Box>
                                    </MotionBox>
                                )
                            })}
                        </MotionFlex>
                    </Box>

                    <Box
                        w="100%"
                        maxW="676px"
                        mx="auto"
                        mt={16}
                        px={{ base: 4, md: 0 }}
                    >
                        <Button
                            w="100%"
                            maxW="676px"
                            h={{ base: "50px", md: "45px" }}
                            bg="#002157"
                            color="white"
                            borderRadius="25px"
                            fontSize={{ base: "16px", md: "18px", lg: "20px" }}
                            fontWeight="500"
                            mx="auto"
                            display="block"
                            mb={{ base: 6, md: 8 }}
                            _hover={{ opacity: 0.8 }}
                            _active={{ transform: "scale(0.98)" }}
                            boxShadow="0px 4px 4px 0px rgba(0, 0, 0, 0.25)"
                            transition="all 0.2s ease"
                        >
                            I&apos;m a Coordinator
                        </Button>
                    </Box>
                </Box>
            </Flex>
        </Box>
    )
}
