"use client";

import React, { useState } from "react";
import { Box, VStack, Button } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { changePasswordSchema } from "@/utils/validationSchemas";
import { InputField } from "@/components/ui";
import { useAuth } from "@/hooks/auth";

export function ChangePasswordSection() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const { handleChangePassword, changePasswordMutation } = useAuth();
  const form = useForm({
    resolver: yupResolver(changePasswordSchema),
    mode: "onChange",
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  const onSubmit = async (data: {
    old_password: string;
    new_password: string;
    confirm_new_password: string;
  }) => {
    setSuccess(false);
    setError("");
    try {
      await handleChangePassword({
        old_password: data.old_password,
        new_password: data.new_password,
      });
      setSuccess(true);
      reset();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message || "Failed to change password");
    }
  };

  return (
    <Box
      maxW="500px"
      mx="auto"
      mt={8}
      p={8}
      borderRadius="16px"
      boxShadow="0 2px 8px rgba(0,0,0,0.08)"
      bg="#F9FAFB"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap={6} align="stretch">
          <Box>
            <InputField
              type="password"
              label="OLD PASSWORD"
              showPasswordToggle
              showPassword={showOldPassword}
              onTogglePassword={() => setShowOldPassword(!showOldPassword)}
              {...register("old_password")}
              error={errors.old_password?.message}
            />
          </Box>
          <Box>
            <InputField
              type="password"
              label="NEW PASSWORD"
              showPasswordToggle
              showPassword={showNewPassword}
              onTogglePassword={() => setShowNewPassword(!showNewPassword)}
              {...register("new_password")}
              error={errors.new_password?.message}
            />
          </Box>
          <Box>
            <InputField
              type="password"
              label="CONFIRM NEW PASSWORD"
              showPasswordToggle
              showPassword={showConfirmNewPassword}
              onTogglePassword={() =>
                setShowConfirmNewPassword(!showConfirmNewPassword)
              }
              {...register("confirm_new_password")}
              error={errors.confirm_new_password?.message}
            />
          </Box>
          {success && (
            <Box color="green.600" fontSize="sm">
              Password changed successfully.
            </Box>
          )}
          {error && (
            <Box color="red.600" fontSize="sm">
              {error}
            </Box>
          )}
          <Button
            type="submit"
            mt={4}
            borderRadius="8px"
            py={3}
            px={6}
            bg="#CFF3FF"
            height="60px"
            color="#000000"
            fontWeight="600"
            fontSize="16px"
            loading={changePasswordMutation.isPending}
          >
            Change Password
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
