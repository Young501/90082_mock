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
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

import { Eye, EyeOff } from "lucide-react"
import { useOnboarding } from "@/hooks/onboarding"

interface FormData {
    email: string
    password: string
}

const validationSchema = yup.object({
    email: yup
        .string()
        .required("Email is required")
        .email("Invalid email format"),
    password: yup
        .string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters"),
})

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [successMsg, setSuccessMsg] = useState("")

    const {
        handleLogin,
        handleSignup: onboardingSignup,
        handleForgotPassword: onboardingForgotPassword,
        isLoginLoading,
        isSignupLoading,
        isPasswordResetLoading,
        user,
        errorMsg,
    } = useOnboarding()

    const userType = user?.user_types?.[0]

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<FormData>({
        resolver: yupResolver(validationSchema),
        mode: "onSubmit",
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const email = watch("email")
    const password = watch("password")

    const onSubmitLogin = async (data: FormData) => {
        await handleLogin({
            email: data.email,
            password: data.password,
            callback: () => {
                setSuccessMsg("Login successful!")
            },
        })
    }

    const onSubmitSignup = async (data: FormData) => {
        await onboardingSignup({
            email: data.email,
            password: data.password,
            user_types: userType ? [userType] : [],
            callback: () => {
                setSuccessMsg("Signup successful!")
            },
        })
    }

    const handleForgotPasswordClick = async () => {
        if (!email) {
            return
        }

        await onboardingForgotPassword({
            email,
        })
    }

    const errorMsg =
        loginMutation.error?.message ||
        signupMutation.error?.message ||
        passwordResetMutation.error?.message ||
        ""

    return (
        <div style={{ width: "100%", height: "100%" }}>   
                <Flex
                    h={{ base: "auto", lg: "calc(100vh - 306px)" }}
                    w="100%"
                    position="relative"
                    overflow="hidden"
                    flex={1}
                    align="center"
                    justify="flex-end"
                zIndex={2}
                px="0"
                >
                    {!isMobile && (
                        <Box
                            position="absolute"
                            left={0}
                            top="0"
                            w={{ base: "600px", xl: "704px" }}
                            h="100%"
                            zIndex={1}
                        >
                            <Image
                                src="/assets/login-illustration.png"
                                fill
                                alt="UniConnected illustration"
                                style={{ objectFit: "cover", objectPosition: "center", }}
                            />
                        </Box>
                    )}
                    <Box
                        w={{ base: "100%", md: "500px", lg: "450px" }}
                        maxW="450px"
                        mr={{ base: 0 }}
                    py={{ base: 8, lg: 0 }}
                    >
                        <form onSubmit={handleSubmit(onSubmit)} autoComplete="on">
                            <VStack align="stretch" gap={6}>
                                <Heading
                                    fontSize={{ base: "28px", md: "31px" }}
                                    fontWeight="700"
                                    textAlign="center"
                                    mb={4}
                                    color="#282F68"
                                >
                                    Login
                                </Heading>

                                {userType && (
                                    <Text
                                        fontSize="16px"
                                        mb={2}
                                        color="#282F68"
                                        textAlign="center"
                                    >
                                        You're signing up as a{" "}
                                        <strong>{userType}</strong>
                                    </Text>
                                )}

            <form onSubmit={handleSubmit(onSubmitLogin)} autoComplete="on">
                <VStack align="stretch" gap={4}>
                    <Field.Root id="email" invalid={!!errors.email}>
                        <Field.Label>Email</Field.Label>
                        <Input
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            {...register("email")}
                        />
                        <Field.ErrorText>
                            {errors.email?.message}
                        </Field.ErrorText>
                    </Field.Root>

                    <Field.Root id="password" invalid={!!errors.password}>
                        <Field.Label>Password</Field.Label>
                        <InputGroup
                            endElement={
                                <IconButton
                                    variant="ghost"
                                    size="sm"
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    title={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </IconButton>
                            }
                        >
                            <Input
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="********"
                                {...register("password")}
                            />
                        </InputGroup>
                        <Field.ErrorText>
                            {errors.password?.message}
                        </Field.ErrorText>
                    </Field.Root>

                    <Button
                        type="submit"
                        disabled={isLoginLoading}
                        width="100%"
                    >
                        {isLoginLoading ? <Spinner size="sm" /> : "Login"}
                    </Button>

                    <Button
                        onClick={handleSubmit(onSubmitSignup)}
                        disabled={isSignupLoading}
                        width="100%"
                    >
                        {isSignupLoading ? <Spinner size="sm" /> : "Sign Up"}
                    </Button>

                    {successMsg && <Text color="green.500">{successMsg}</Text>}
                    {errorMsg && <Text color="red.500">{errorMsg}</Text>}
                </VStack>
            </form>

            <Button
                variant="ghost"
                onClick={handleForgotPasswordClick}
                disabled={isPasswordResetLoading || !email || !!errors.email}
                width="100%"
                mt={2}
            >
                {isPasswordResetLoading ? (
                    <Spinner size="sm" />
                ) : (
                    "Forgot Password?"
                )}
            </Button>
        </Box>
    )
}
