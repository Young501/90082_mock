"use client"

import { useState, useEffect } from "react"
import {
    Box,
    Heading,
    VStack,
    Button,
    Text,
    Spinner,
    Input,
    Field,
    InputGroup,
    IconButton,
} from "@chakra-ui/react"

import { Eye, EyeOff } from "lucide-react"
import { useAuth, useLogin, useSignup, usePasswordReset } from "@/api"
import { checkOnboardingStatus } from "@/app/onboarding/utils"
import { useRouter } from "next/navigation"

const validateEmail = (email: string): string => {
    if (!email) return ""
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return EMAIL_REGEX.test(email) ? "" : "Invalid email format"
}

const validatePassword = (password: string): string => {
    if (!password) return ""
    return password.length < 8 ? "Password must be at least 8 characters" : ""
}

export default function LoginPage() {
    const router = useRouter()
    const { user, token } = useAuth()
    const userType = user?.user_types?.[0]

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [emailErr, setEmailErr] = useState("")
    const [pwdErr, setPwdErr] = useState("")
    const [successMsg, setSuccessMsg] = useState("")

    const loginMutation = useLogin()
    const signupMutation = useSignup()
    const passwordResetMutation = usePasswordReset()

    const isFormValid = !emailErr && !pwdErr && email && password

    useEffect(() => setEmailErr(validateEmail(email)), [email])
    useEffect(() => setPwdErr(validatePassword(password)), [password])

    const handleOnboardingCheck = async () => {
        const result = await checkOnboardingStatus(user!, token!)
        if (result.status === "needs_onboarding") {
            router.push("/onboarding")
        } else {
            router.push("/home")
        }
    }

    const handleLogin = async () => {
        try {
            await loginMutation.mutateAsync({ email, password })
            setSuccessMsg("Login successful!")
            handleOnboardingCheck()
        } catch (error) {}
    }

    const handleSignup = async () => {
        try {
            await signupMutation.mutateAsync({
                email,
                password,
                user_types: userType ? [userType] : [],
            })
            setSuccessMsg("Signup successful!")
        } catch (error) {}
    }

    const handleForgotPassword = async () => {
        if (!email) {
            return
        }

        if (emailErr) {
            return
        }

        try {
            await passwordResetMutation.mutateAsync({ email })
            setSuccessMsg("Password reset email sent! Please check your inbox.")
        } catch (error) {}
    }

    const errorMsg =
        loginMutation.error?.message ||
        signupMutation.error?.message ||
        passwordResetMutation.error?.message ||
        ""

    return (
        <Box maxW="420px" mx="auto" mt={12} p={8} borderWidth={1} rounded="lg">
            <Heading size="lg" mb={6}>
                Login / Sign Up
            </Heading>
            {userType && (
                <Text fontSize="md" mb={2} color="gray.600">
                    You're signing up as a <strong>{userType}</strong>
                </Text>
            )}

            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    handleLogin()
                }}
                autoComplete="on"
            >
                <VStack align="stretch" gap={4}>
                    <Field.Root id="email" invalid={!!emailErr}>
                        <Field.Label>Email</Field.Label>
                        <Input
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                        <Field.ErrorText>{emailErr}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root id="password" invalid={!!pwdErr}>
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
                                name="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="********"
                            />
                        </InputGroup>
                        <Field.ErrorText>{pwdErr}</Field.ErrorText>
                    </Field.Root>

                    <Button
                        type="submit"
                        disabled={!isFormValid || loginMutation.isPending}
                        width="100%"
                    >
                        {loginMutation.isPending ? (
                            <Spinner size="sm" />
                        ) : (
                            "Login"
                        )}
                    </Button>

                    <Button
                        onClick={handleSignup}
                        disabled={!isFormValid || signupMutation.isPending}
                        width="100%"
                    >
                        {signupMutation.isPending ? (
                            <Spinner size="sm" />
                        ) : (
                            "Sign Up"
                        )}
                    </Button>

                    {successMsg && <Text color="green.500">{successMsg}</Text>}
                    {errorMsg && <Text color="red.500">{errorMsg}</Text>}
                </VStack>
            </form>

            <Button
                variant="ghost"
                onClick={handleForgotPassword}
                disabled={
                    passwordResetMutation.isPending || !email || !!emailErr
                }
                width="100%"
                mt={2}
            >
                {passwordResetMutation.isPending ? (
                    <Spinner size="sm" />
                ) : (
                    "Forgot Password?"
                )}
            </Button>
        </Box>
    )
}
