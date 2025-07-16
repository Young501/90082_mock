"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Text,
  VStack,
  Heading,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "@/hooks/auth";
import { passwordResetFormSchema } from "@/utils/validationSchemas";
import { InputField, Button } from "@/components/ui";

interface FormData {
  new_password: string;
  confirm_password: string;
}

function ResetPasswordFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const containerMaxW = useBreakpointValue({ base: "100%", lg: "1512px" });
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
    return null; // Will redirect in useEffect
  }

  return (
    <Container maxW={containerMaxW} p={0} h="100%">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
        textAlign="center"
        px={{ base: 4, md: 6, lg: 8 }}
        py={{ base: 8, md: 12, lg: 16 }}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ width: "100%", maxWidth: "500px" }}
        >
          <VStack gap={{ base: 6, md: 8 }}>
            <Heading
              fontSize={{ base: "24px", md: "32px", lg: "42px" }}
              fontWeight="700"
              color="black"
              lineHeight="1.21"
            >
              Reset Your Password
            </Heading>

            <Text
              fontSize={{ base: "14px", md: "18px", lg: "20px" }}
              color="black"
              maxWidth={{ base: "100%", md: "400px" }}
              lineHeight="1.4"
              px={{ base: 2, md: 0 }}
            >
              Please enter your new password below
            </Text>

            <VStack gap={4} width="100%">
              <InputField
                label="NEW PASSWORD"
                type="password"
                autoComplete="new-password"
                error={errors.new_password?.message}
                showPasswordToggle
                showPassword={showNewPassword}
                onTogglePassword={() => setShowNewPassword(!showNewPassword)}
                labelStyle="floating"
                {...register("new_password")}
                value={newPasswordValue || ""}
              />

              <InputField
                label="CONFIRM PASSWORD"
                type="password"
                autoComplete="new-password"
                error={errors.confirm_password?.message}
                showPasswordToggle
                showPassword={showConfirmPassword}
                onTogglePassword={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                labelStyle="floating"
                {...register("confirm_password")}
                value={confirmPasswordValue || ""}
              />

              <Button
                type="submit"
                w={{ base: "280px", md: "320px", lg: "400px" }}
                h={{ base: "45px", md: "50px" }}
                bg="#002157"
                color="white"
                borderRadius="25px"
                fontSize={{ base: "16px", md: "18px", lg: "20px" }}
                fontWeight="500"
                disabled={isPasswordResetConfirmLoading}
                isLoading={isPasswordResetConfirmLoading}
                _hover={{ opacity: 0.8 }}
                _active={{ transform: "scale(0.98)" }}
                boxShadow="0px 4px 4px 0px rgba(0, 0, 0, 0.25)"
                transition="all 0.2s ease"
                mt={{ base: 4, md: 6 }}
              >
                Reset Password
              </Button>
            </VStack>
          </VStack>
        </form>
      </Box>
    </Container>
  );
}

export default function ResetPasswordFormPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordFormContent />
    </Suspense>
  );
}
