"use client"

import { useState } from "react"
import {
    Box,
    Heading,
    VStack,
    Text,
    Flex,
    HStack,
    useBreakpointValue,
} from "@chakra-ui/react"
import { useAuth, useLogin, useSignup, usePasswordReset } from "@/api"
import { checkOnboardingStatus } from "@/app/onboarding/utils"
import { useRouter } from "next/navigation"
import { InputField, Button } from "@/components/ui"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, LoginFormData } from "./validation"

export default function LoginPage() {
    const router = useRouter()
    const { user, token } = useAuth()
    const userType = user?.user_types?.[0]

    const [showPassword, setShowPassword] = useState(false)
    const [successMsg, setSuccessMsg] = useState("")

    const loginMutation = useLogin()
    const signupMutation = useSignup()
    const passwordResetMutation = usePasswordReset()

    const isMobile = useBreakpointValue({ base: true, lg: false })

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        watch,
        setError,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: "onChange",
    })

    const emailValue = watch("email")
    const passwordValue = watch("password")

    const handleOnboardingCheck = async () => {
        const result = await checkOnboardingStatus(user!, token!)
        if (result.status === "needs_onboarding") {
            router.push("/onboarding")
        } else {
            router.push("/home")
        }
    }

    const onSubmit = async (data: LoginFormData) => {
        try {
            await loginMutation.mutateAsync(data)
            setSuccessMsg("Login successful!")
            handleOnboardingCheck()
        } catch (error: any) {
            if (error.message?.includes("email")) {
                setError("email", { message: error.message })
            } else if (error.message?.includes("password")) {
                setError("password", { message: error.message })
            }
        }
    }

    const handleSignup = async (data: LoginFormData) => {
        try {
            await signupMutation.mutateAsync({
                ...data,
                user_types: userType ? [userType] : [],
            })
            setSuccessMsg("Signup successful!")
        } catch (error: any) {
            if (error.message?.includes("email")) {
                setError("email", { message: error.message })
            } else if (error.message?.includes("password")) {
                setError("password", { message: error.message })
            }
        }
    }

    const handleForgotPassword = async () => {
        if (!emailValue || errors.email) {
            return
        }

        try {
            await passwordResetMutation.mutateAsync({ email: emailValue })
            setSuccessMsg("Password reset email sent! Please check your inbox.")
        } catch (error) {}
    }

    const errorMsg =
        loginMutation.error?.message ||
        signupMutation.error?.message ||
        passwordResetMutation.error?.message ||
        ""

    return (
        <Flex
            h={{ base: "auto", lg: "calc(100vh - 306px)" }}
            w="100%"
            position="relative"
            overflow="hidden"
        >
            {!isMobile && (
                <Box
                    position="absolute"
                    left={{ base: "-100px", xl: "90px" }}
                    top="0"
                    w={{ base: "600px", xl: "704px" }}
                    h="100%"
                    zIndex={1}
                >
                    <Image
                        src="/assets/login-illustration.png"
                        fill
                        alt="UniConnected illustration"
                        style={{ objectFit: "cover", objectPosition: "center" }}
                    />
                </Box>
            )}

            <Flex
                flex={1}
                align="center"
                justify={{ base: "center", lg: "flex-end" }}
                px={{ base: 4, md: 8, lg: 12 }}
                position="relative"
                zIndex={2}
            >
                <Box
                    w={{ base: "100%", md: "500px", lg: "450px" }}
                    maxW="450px"
                    mr={{ base: 0, lg: "140px", xl: "170px" }}
                    py={{ base: 8, lg: 0 }}
                >
                    <form onSubmit={handleSubmit(onSubmit)} autoComplete="on">
                        <VStack align="stretch" gap={6}>
                            <Heading
                                fontSize={{ base: "28px", md: "31px" }}
                                fontWeight="700"
                                color="black"
                                textAlign="center"
                                mb={4}
                            >
                                Login
                            </Heading>

                            {userType && (
                                <Text
                                    fontSize="16px"
                                    mb={2}
                                    color="gray.600"
                                    textAlign="center"
                                >
                                    You're signing up as a{" "}
                                    <strong>{userType}</strong>
                                </Text>
                            )}

                            <InputField
                                label="EMAIL"
                                type="email"
                                autoComplete="email"
                                error={errors.email?.message}
                                labelStyle="floating"
                                {...register("email")}
                                value={emailValue || ""}
                            />

                            <InputField
                                label="PASSWORD"
                                autoComplete="current-password"
                                error={errors.password?.message}
                                showPasswordToggle
                                showPassword={showPassword}
                                onTogglePassword={() =>
                                    setShowPassword(!showPassword)
                                }
                                labelStyle="floating"
                                {...register("password")}
                                value={passwordValue || ""}
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                disabled={!isValid || loginMutation.isPending}
                                isLoading={loginMutation.isPending}
                                w="100%"
                                mt={4}
                            >
                                LOGIN
                            </Button>

                            {/* <Button
                                type="button"
                                variant="secondary"
                                onClick={handleSubmit(handleSignup)}
                                disabled={!isValid || signupMutation.isPending}
                                isLoading={signupMutation.isPending}
                                w="100%"
                            >
                                SIGN UP
                            </Button> */}

                            <HStack justify="center" gap={1} mt={4}>
                                <Text fontSize="20px" color="black">
                                    forgot password?
                                </Text>
                                <Button
                                    variant="ghost"
                                    onClick={handleForgotPassword}
                                    disabled={
                                        passwordResetMutation.isPending ||
                                        !emailValue ||
                                        !!errors.email
                                    }
                                    isLoading={passwordResetMutation.isPending}
                                    p={0}
                                    h="auto"
                                    fontSize="20px"
                                >
                                    reset here
                                </Button>
                            </HStack>

                            {successMsg && (
                                <Text color="green.500" textAlign="center">
                                    {successMsg}
                                </Text>
                            )}
                            {errorMsg && (
                                <Text color="red.500" textAlign="center">
                                    {errorMsg}
                                </Text>
                            )}
                        </VStack>
                    </form>
                </Box>
            </Flex>
        </Flex>
    )
}
