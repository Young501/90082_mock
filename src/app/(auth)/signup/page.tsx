"use client";

import { useState, useEffect } from "react";
import { Box, Heading, VStack, Text, Flex, HStack } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { InputField, Button } from "@/components/ui";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import { useAuth } from "@/hooks/auth";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  authValidationSchema,
  organisationAuthValidationSchema,
} from "@/utils/validationSchemas";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { toast } from "react-toastify";

interface FormData {
  email: string;
  password: string;
}

const SignupPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signupSelectedUserType = useAuthStore(
    (state) => state.signupSelectedUserType
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { handleSignup } = useAuth();
  const { setInviteData } = useAuthStore();

  const validationSchema =
    signupSelectedUserType === "organisation"
      ? organisationAuthValidationSchema
      : authValidationSchema;

  useEffect(() => {
    if (!signupSelectedUserType) {
      const inviteToken = searchParams.get("invite_token");
      const opportunityId = searchParams.get("opportunity_id");

      if (inviteToken && opportunityId) {
        router.push(
          `/user-type?signup=true&invite_token=${inviteToken}&opportunity_id=${opportunityId}`
        );
      } else {
        router.push("/user-type?signup=true/");
      }
    }
  }, [signupSelectedUserType, router, searchParams]);

  useEffect(() => {
    const inviteToken = searchParams.get("invite_token");
    const opportunityId = searchParams.get("opportunity_id");

    if (inviteToken && opportunityId) {
      setInviteData(inviteToken, opportunityId);
    }
  }, [searchParams, setInviteData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
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
      await handleSignup({
        email: data.email,
        password: data.password,
        user_types: signupSelectedUserType ? [signupSelectedUserType] : [],
        callback: () => {
          router.push(
            `/verify-email/sent/?email=${encodeURIComponent(data.email)}`
          );
        },
      });
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageTitle title={PAGE_TITLES.SIGNUP} />
      <Flex
        w="100%"
        position="relative"
        overflow="hidden"
        align={{ base: "center", lg: "space-between" }}
        justify="center"
        gap={{ base: 8, lg: 16 }}
        pb={{ base: 10, lg: 100 }}
        h="100%"
        direction={{ base: "column", lg: "row" }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={4}
          minW={{ base: "auto", lg: "200px" }}
          position="relative"
        >
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{ zIndex: 2, position: "relative" }}
          >
            <Image
              src="/assets/mini-logo.png"
              alt="logo"
              style={{ objectFit: "contain" }}
              width={124}
              height={124}
            />
          </motion.div>

          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
            style={{ zIndex: 1, position: "relative" }}
          >
            <Image
              src="/assets/uniconnectedLogo.png"
              alt="logo"
              style={{ objectFit: "contain" }}
              width={523}
              height={142}
            />
          </motion.div>
        </Box>

        <Box w={{ base: "100%", md: "400px" }} maxW="400px">
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="on">
            <VStack align="stretch" gap={4}>
              <Heading
                fontSize={{ base: "24px", md: "28px" }}
                fontWeight="600"
                textAlign="center"
                mb={2}
                color="#282F68"
              >
                Register an account
              </Heading>
              {signupSelectedUserType && (
                <Text fontSize="16px" mb={2} color="#282F68" textAlign="center">
                  You are signing up as{" "}
                  {signupSelectedUserType.toLowerCase() === "student"
                    ? "a"
                    : "an"}{" "}
                  <strong>{signupSelectedUserType}</strong>
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
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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
                color="#A2DDF0"
                disabled={isLoading}
                isLoading={isLoading}
                w="100%"
                fontSize="20px"
                fontWeight="400"
              >
                SIGN UP
              </Button>

              <HStack my={4} justify="center">
                <Text
                  fontSize="16px"
                  color="#000000"
                  fontWeight="700"
                  whiteSpace="nowrap"
                >
                  OR
                </Text>
              </HStack>

              <Button
                type="button"
                bg="#282F68"
                color="#A2DDF0"
                w="100%"
                fontSize="20px"
                fontWeight="400"
                onClick={() => {
                  toast.info("This feature is coming soon ...");
                }}
              >
                @ | CONNECT WITH UNIVERSITY ID
              </Button>

              <HStack justify="center" align="center" mt={4} gap={3}>
                <Text fontSize="20px" fontWeight="700" color="#000000">
                  Already have a profile?
                </Text>
                <Link href="/login/" passHref>
                  <Button
                    variant="ghost"
                    p={0}
                    h="auto"
                    fontSize="20px"
                    color="#282F68"
                    fontWeight="700"
                  >
                    Login
                  </Button>
                </Link>
              </HStack>
            </VStack>
          </form>
        </Box>
      </Flex>
    </>
  );
};

export default SignupPage;
