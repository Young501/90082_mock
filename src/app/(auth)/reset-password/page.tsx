"use client";

import { Box, Heading, VStack, Text, Flex } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { InputField, ButtonV2 } from "@/components/ui";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "@/hooks/auth";
import { resetPasswordValidationSchema } from "@/utils/validationSchemas";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { PageTitle } from "@/components/PageTitle";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

interface FormData {
  email: string;
}

const MotionBox = motion.create(Box);

export default function ResetPasswordPage() {
  const router = useRouter();
  const { handleForgotPassword, isPasswordResetLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(resetPasswordValidationSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const emailValue = watch("email");

  const onSubmit = async (data: FormData) => {
    try {
      await handleForgotPassword({
        email: data.email,
        callback: () => setValue("email", ""),
      });
    } catch {
      // Error handled in auth hook
    }
  };

  return (
    <>
      <PageTitle title={PAGE_TITLES.RESET_PASSWORD} />
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
                  Forgot your password?
                </Heading>
                <Text fontSize="md" color="#71717A" lineHeight="1.5">
                  We&apos;ll send an email to verify that this account is yours
                </Text>
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
                      _focus: { outline: "none" },
                    }}
                    startElement={
                      <Box display="flex" alignItems="center">
                        <Mail size={20} color="#9CA3AF" />
                      </Box>
                    }
                    {...register("email")}
                    value={emailValue || ""}
                  />

                  <ButtonV2
                    type="submit"
                    variant="primary"
                    bg="#2AA8E0"
                    color="white"
                    disabled={isPasswordResetLoading}
                    isLoading={isPasswordResetLoading}
                    w="100%"
                    fontSize="lg"
                    fontWeight="600"
                    h={{ base: "48px", md: "64px" }}
                    borderRadius="xl"
                  >
                    Send reset link
                  </ButtonV2>
                </VStack>
              </VStack>

              <Flex justify="center" align="center" gap={2} pt={2}>
                <Text fontSize="sm" color="black" fontWeight="500">
                  Remember your password?
                </Text>
                <ButtonV2
                  variant="ghost"
                  onClick={() => router.push("/login/")}
                  border="1px solid #D6EDFB"
                  h="40px"
                  borderRadius="xl"
                  fontSize="xs"
                  color="#1679AB"
                  py={2.5}
                  px={4}
                  _hover={{ textDecoration: "none" }}
                >
                  Log in
                </ButtonV2>
              </Flex>
            </VStack>
          </form>
        </MotionBox>
      </Box>
    </>
  );
}
