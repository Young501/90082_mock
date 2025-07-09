"use client";

import { useState } from "react";
import { Box, Heading, VStack, Text, Flex, HStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { InputField, Button } from "@/components/ui";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/auth";
import { authValidationSchema } from "@/utils/validationSchemas";
import Link from "next/link";

interface FormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleLogin,
    handleForgotPassword,
    isLoginLoading,
    isPasswordResetLoading,
  } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(authValidationSchema),
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
          router.push("/discover/");
        },
      });
    } catch (error: any) {
    } finally {
      setIsLoading(false);
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
        direction={{ base: "column", lg: "row" }}
        align="center"
        justify={{ base: "center", lg: "space-between" }}
        zIndex={2}
        px="0"
        gap={{ base: "40px", lg: "0" }}
      >
        <Box>
          <Image
            src="/assets/login-illustration.png"
            alt="UniConnected illustration"
            width={704}
            height={600}
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </Box>
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
                <Link
                  href="/reset-password/"
                  style={{ fontSize: "20px", color: "#2CA9DF" }}
                >
                  reset here
                </Link>
              </HStack>
            </VStack>
          </form>
        </Box>
      </Flex>
    </div>
  );
}
