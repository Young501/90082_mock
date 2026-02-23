"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Box, Heading, VStack, Text, Flex } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "@/hooks/auth";
import { passwordResetFormSchema } from "@/utils/validationSchemas";
import { InputField, ButtonV2 } from "@/components/ui";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { motion } from "framer-motion";

interface FormData {
  new_password: string;
  confirm_password: string;
}

const MotionBox = motion.create(Box);

function ResetPasswordFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const { handlePasswordResetConfirm, isPasswordResetConfirmLoading } =
    useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(passwordResetFormSchema),
    mode: "onChange",
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  });

  const newPasswordValue = watch("new_password");
  const confirmPasswordValue = watch("confirm_password");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      router.push(
        "/reset-password/failed?message=" +
          encodeURIComponent(
            "No reset token found. Please check your email link."
          )
      );
      return;
    }
    setToken(tokenParam);
  }, [searchParams, router]);

  const onSubmit = async (data: FormData) => {
    if (!token) return;

    try {
      await handlePasswordResetConfirm({
        token,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
        callback: () => {
          router.push("/reset-password/success");
        },
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail ||
        "Failed to reset password. Please try again.";
      router.push(
        "/reset-password/failed?message=" + encodeURIComponent(errorMessage)
      );
    }
  };

  if (!token) {
    return null;
  }

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
                  Reset your password
                </Heading>
                <Text fontSize="md" color="#71717A" lineHeight="1.5">
                  Please enter your new password below
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
                    label="New password"
                    type={showNewPassword ? "text" : "password"}
                    autoComplete="new-password"
                    error={errors.new_password?.message as string}
                    showPasswordToggle
                    showPassword={showNewPassword}
                    onTogglePassword={() => setShowNewPassword(!showNewPassword)}
                    labelStyle="top"
                    placeholder="Enter new password"
                    variant="signup"
                    {...register("new_password")}
                    value={newPasswordValue || ""}
                    inputStyles={{
                      borderRadius: "sm",
                      h: "48px",
                      _focus: { outline: "none" },
                    }}
                  />

                  <InputField
                    label="Confirm password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    error={errors.confirm_password?.message as string}
                    showPasswordToggle
                    showPassword={showConfirmPassword}
                    onTogglePassword={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    labelStyle="top"
                    placeholder="Confirm password"
                    variant="signup"
                    {...register("confirm_password")}
                    value={confirmPasswordValue || ""}
                    inputStyles={{
                      borderRadius: "sm",
                      h: "48px",
                      _focus: { outline: "none" },
                    }}
                  />

                  <ButtonV2
                    type="submit"
                    variant="primary"
                    bg="#2AA8E0"
                    color="white"
                    disabled={isPasswordResetConfirmLoading}
                    isLoading={isPasswordResetConfirmLoading}
                    w="100%"
                    fontSize="lg"
                    fontWeight="600"
                    h={{ base: "48px", md: "64px" }}
                    borderRadius="xl"
                  >
                    Reset password
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

export default function ResetPasswordFormPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordFormContent />
    </Suspense>
  );
}
