"use client";

import { useState } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  Flex,
  HStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { checkOnboardingStatus } from "@/app/onboarding/utils";
import { useRouter } from "next/navigation";
import { InputField, Button } from "@/components/ui";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useOnboarding } from "@/hooks/onboarding";

interface FormData {
  email: string;
  password: string;
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
});

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleLogin,
    handleSignup: onboardingSignup,
    handleForgotPassword,
    isLoginLoading,
    isSignupLoading,
    isPasswordResetLoading,
    errorMsg,
  } = useOnboarding();

  const isMobile = useBreakpointValue({ base: true, lg: false });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setError,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const emailValue = watch("email");
  const passwordValue = watch("password");

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      await handleLogin({
        email: data.email,
        password: data.password,
        callback: () => {
          toast.success("Login successful!");
          router.push("/home");
        },
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserForgotPassword = async () => {
    if (!emailValue) {
      setError("email", { message: "Email is required" });
      return;
    } else if (emailValue) {
      try {
        const response = await handleForgotPassword({
          email: emailValue,
          callback: () => {
            setValue("email", "");
          },
        });
        console.log(response);
      } catch (error: any) {
        toast.error(error?.message);
      }
    }
  };

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
              style={{ objectFit: "cover", objectPosition: "center" }}
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
                onTogglePassword={() => setShowPassword(!showPassword)}
                labelStyle="floating"
                {...register("password")}
                value={passwordValue || ""}
              />
              <Button
                type="submit"
                bg="#282F68"
                color="#2CA9DF"
                disabled={isLoginLoading || isLoading}
                isLoading={isLoading}
                w="100%"
                mt={4}
              >
                LOGIN
              </Button>

              <HStack justify="center" gap={1} mt={4}>
                <Text fontSize="20px" color="black">
                  forgot password?
                </Text>
                <Button
                  variant="ghost"
                  onClick={handleUserForgotPassword}
                  disabled={isPasswordResetLoading}
                  isLoading={isPasswordResetLoading}
                  p={0}
                  h="auto"
                  fontSize="20px"
                  color="#2CA9DF"
                >
                  reset here
                </Button>
              </HStack>
            </VStack>
          </form>
        </Box>
      </Flex>
    </div>
  );
}
