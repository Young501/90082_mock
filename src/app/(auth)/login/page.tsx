"use client";

import { useState } from "react";
import { Box, Heading, VStack, Text, Flex } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { InputField, ButtonV2 } from "@/components/ui";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/auth";
import { loginValidationSchema } from "@/utils/validationSchemas";
import Link from "next/link";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { PageTitle } from "@/components/PageTitle";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

interface FormData {
  email: string;
  password: string;
}

const MotionBox = motion.create(Box);

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { handleLogin, isLoginLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(loginValidationSchema),
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
        },
      });
    } catch {
      // Error handled in auth hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageTitle title={PAGE_TITLES.LOGIN} />
      <Box w="100%" display="flex" alignItems="center" justifyContent="center">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          w="100%"
          maxW="640px"
          bg="white"
          borderRadius="2xl"
          p={{ base: 6, md: 10 }}
          boxShadow="xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="on">
            <VStack align="stretch" gap={6}>
              <VStack align="stretch" gap={1} textAlign="left">
                <Heading
                  fontSize={{ base: "2xl", md: "4xl" }}
                  fontWeight="600"
                  color="#18181B"
                  lineHeight="1.2"
                >
                  Great to have you back
                </Heading>
              </VStack>

              <VStack
                align="stretch"
                gap={8}
                border={{ base: "none", md: "1px solid #E4E4E7" }}
                borderRadius="3xl"
                w="100%"
                p={{ base: 0, md: 8 }}
              >
                <VStack align="stretch" gap={6}>
                  <InputField
                    label="Email"
                    type="email"
                    autoComplete="email"
                    error={errors.email?.message as string}
                    labelStyle="top"
                    placeholder="sarah.smith@student.unimelb.edu.au"
                    variant="signup"
                    inputStyles={{
                      borderRadius: "sm",
                      h: "48px",
                      _focus: {
                        outline: "none",
                      },
                    }}
                    startElement={
                      <Box display="flex" alignItems="center">
                        <Mail size={20} color="#9CA3AF" />
                      </Box>
                    }
                    {...register("email")}
                    value={emailValue || ""}
                  />

                  <InputField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    error={errors.password?.message as string}
                    showPasswordToggle
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    labelStyle="top"
                    placeholder="Enter password"
                    variant="signup"
                    {...register("password")}
                    value={passwordValue || ""}
                    inputStyles={{
                      borderRadius: "sm",
                      h: "48px",
                      _focus: {
                        outline: "none",
                      },
                    }}
                  />

                  <Flex justify="flex-end" w="100%">
                    <Text fontSize="sm" color="black" fontWeight="500">
                      Forgot password?{" "}
                      <Link
                        href="/reset-password/"
                        style={{
                          color: "#2AA8E0",
                          textDecoration: "underline",
                          fontWeight: 500,
                        }}
                      >
                        Reset
                      </Link>
                    </Text>
                  </Flex>
                </VStack>

                <VStack align="stretch" gap={5}>
                  <ButtonV2
                    type="submit"
                    variant="primary"
                    bg="#2AA8E0"
                    color="white"
                    disabled={isLoginLoading || isLoading}
                    isLoading={isLoading}
                    w="100%"
                    fontSize="lg"
                    fontWeight="600"
                    h={{ base: "48px", md: "64px" }}
                    borderRadius="xl"
                  >
                    Log in
                  </ButtonV2>

                  <Flex align="center" gap={2} w="100%">
                    <Box flex={1} h="1px" bg="gray.200" />
                    <Text fontSize="sm" color="gray.500" fontWeight="500">
                      Or log in with
                    </Text>
                    <Box flex={1} h="1px" bg="gray.200" />
                  </Flex>

                  <ButtonV2
                    type="button"
                    variant="secondary"
                    w="100%"
                    fontSize="lg"
                    fontWeight="600"
                    h={{ base: "48px", md: "64px" }}
                    borderRadius="xl"
                    onClick={() => {
                      toast.info("This feature is coming soon ...");
                    }}
                  >
                    Connect with university ID
                  </ButtonV2>
                </VStack>
              </VStack>

              <Flex justify="center" align="center" gap={2}>
                <Text fontSize="sm" color="black" fontWeight="500">
                  Don&apos;t have an account?
                </Text>
                <ButtonV2
                  variant="ghost"
                  onClick={() => router.push("/signup/")}
                  border="1px solid #D6EDFB"
                  h="40px"
                  borderRadius="xl"
                  fontSize="xs"
                  color="#1679AB"
                  py={2.5}
                  px={4}
                  _hover={{
                    textDecoration: "none",
                  }}
                >
                  Sign up
                </ButtonV2>
              </Flex>
            </VStack>
          </form>
        </MotionBox>
      </Box>
    </>
  );
}
