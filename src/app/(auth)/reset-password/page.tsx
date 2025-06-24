"use client";

import React, { useState } from "react";
import { resetPasswordValidationSchema } from "@/utils/validationSchemas";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "@/hooks/auth";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button, InputField } from "@/components/ui";
import { Box, Heading, Text } from "@chakra-ui/react";

interface FormData {
  email: string;
}

const ResetPassword = () => {
  //   const [isPasswordResetLoading, setIsPasswordResetLoading] = useState(false);

  const { handleForgotPassword, isPasswordResetLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(resetPasswordValidationSchema),
  });

  const onSubmit = async (data: FormData) => {
    if (!data.email) {
      setError("email", { message: "Email is required" });
      return;
    } else if (data.email) {
      try {
        await handleForgotPassword({
          email: data.email,
          callback: () => {
            setValue("email", "");
          },
        });
      } catch (error: any) {}
    }
  };

  const handleUserForgotPassword = async (data: FormData) => {};

  return (
    <Box w="100%" display="flex" justifyContent="center" alignItems="center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="on"
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "69px",
        }}
      >
        <Box w="100%" mx="auto" display="flex" flexDirection="column" gap={4}>
          <Heading
            fontSize={{ base: "28px", md: "31px" }}
            fontWeight="700"
            textAlign="center"
            color="#000000"
          >
            Forgot your password?
          </Heading>

          <Text
            fontSize="25px"
            textAlign="center"
            fontWeight="400"
            color="#000000"
          >
            We’ll send an email to verify that this account is yours
          </Text>
        </Box>

        <Box w="100%" maxWidth="418px" display="flex" flexDirection="column">
          <Text
            fontSize="25px"
            textAlign="center"
            fontWeight="400"
            color="#000000"
            mb={5}
          >
            Enter Email
          </Text>
          <InputField
            label="Email"
            labelStyle="floating"
            type="email"
            placeholder=" Email"
            {...register("email")}
            error={errors.email?.message}
          />

          <Button
            type="submit"
            bg="#282F68"
            color="#2CA9DF"
            disabled={isPasswordResetLoading}
            isLoading={isPasswordResetLoading}
            w="100%"
            mt={10}
          >
            NEXT
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ResetPassword;
