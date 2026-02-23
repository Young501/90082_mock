"use client";

import React, { useState } from "react";
import {
  Box,
  Text,
  Heading,
  Flex,
  Separator,
  VStack,
  Dialog,
  Portal,
  IconButton,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { changePasswordSchema } from "@/utils/validationSchemas";
import { InputField } from "@/components/ui";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { useAuth } from "@/hooks/auth";
import { useAuthStore } from "@/store";
import { X, Lock, Mail } from "lucide-react";

function ChangePasswordDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const { handleChangePassword, changePasswordMutation } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
    mode: "onChange",
  });

  const handleClose = () => {
    reset();
    setSuccess(false);
    setError("");
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    onClose();
  };

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
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) handleClose();
      }}
      placement="center"
      trapFocus
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" style={{ zIndex: 10000 }} />
        <Dialog.Positioner zIndex={10001}>
          <Dialog.Content
            bg="white"
            borderRadius="20px"
            w="90%"
            maxW="560px"
            overflow="hidden"
          >
            <Flex justify="space-between" align="center" px={6} py={5}>
              <Heading fontSize="xl" fontWeight="700" color="#18181B">
                Change Password
              </Heading>
              <IconButton
                variant="ghost"
                size="sm"
                aria-label="Close"
                onClick={handleClose}
              >
                <X size={24} color="#52525B" />
              </IconButton>
            </Flex>

            {/* Form */}
            <Box as="form" onSubmit={handleSubmit(onSubmit)} px={6} pb={6}>
              <VStack gap={5} align="stretch">
                <InputField
                  type="password"
                  label="Current Password"
                  placeholder="Enter current password"
                  showPasswordToggle
                  showPassword={showOldPassword}
                  onTogglePassword={() => setShowOldPassword(!showOldPassword)}
                  {...register("old_password")}
                  error={errors.old_password?.message}
                  inputStyles={{ borderRadius: "12px", h: "48px" }}
                />
                <InputField
                  type="password"
                  label="New Password"
                  placeholder="Enter new password"
                  showPasswordToggle
                  showPassword={showNewPassword}
                  onTogglePassword={() => setShowNewPassword(!showNewPassword)}
                  {...register("new_password")}
                  error={errors.new_password?.message}
                  inputStyles={{ borderRadius: "12px", h: "48px" }}
                />
                <InputField
                  type="password"
                  label="Confirm New Password"
                  placeholder="Re-enter new password"
                  showPasswordToggle
                  showPassword={showConfirmNewPassword}
                  onTogglePassword={() =>
                    setShowConfirmNewPassword(!showConfirmNewPassword)
                  }
                  {...register("confirm_new_password")}
                  error={errors.confirm_new_password?.message}
                  inputStyles={{ borderRadius: "12px", h: "48px" }}
                />

                {success && (
                  <Text color="green.600" fontSize="sm">
                    Password changed successfully.
                  </Text>
                )}

                <Flex
                  justify={{ base: "space-between", sm: "flex-end" }}
                  // justify="flex-end"
                  gap={3}
                  flexWrap="wrap"
                >
                  <ButtonV2
                    variant="ghost"
                    type="button"
                    borderRadius="xl"
                    onClick={handleClose}
                    border="1px solid"
                    borderColor="#E4E4E7"
                    color="#52525B"
                    h="44px"
                    maxW={{ base: "40%", sm: "156px" }}
                    w={{ base: "100%", sm: "auto" }}
                    px={6}
                    fontSize="md"
                    fontWeight="500"
                    _hover={{ bg: "#F4F4F5" }}
                  >
                    Cancel
                  </ButtonV2>
                  <ButtonV2
                    variant="primary"
                    type="submit"
                    isLoading={changePasswordMutation.isPending}
                    h="44px"
                    maxW={{ base: "55%", sm: "175px" }}
                    w={{ base: "100%", sm: "auto" }}
                    px={6}
                    fontSize="md"
                    fontWeight="600"
                    bg="#2AA8E0"
                  >
                    Change Password
                  </ButtonV2>
                </Flex>
              </VStack>
            </Box>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export function ChangePasswordSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuthStore();
  const email = user?.email ?? "";

  return (
    <VStack align="stretch" gap={4}>
      <Box
        bg="white"
        borderRadius="12px"
        border="1px solid"
        borderColor="#E4E4E7"
        overflow="hidden"
        py={5}
        px={{ base: 4, md: 5 }}
      >
        <Box pb={4}>
          <Heading fontSize="lg" fontWeight="600" color="#18181B">
            Email Address
          </Heading>
        </Box>
        <Separator borderColor="#E4E4E7" />
        <Box py={4}>
          <Text fontSize="sm" color="#52525B" mb={3}>
            Your email address is managed by your university
          </Text>
          <Flex
            align="center"
            gap={3}
            px={4}
            py={3}
            bg="#F4F4F5 "
            borderRadius="4px"
            h="48px"
          >
            <Mail size={18} color="black" />
            <Text fontSize="sm" color="black">
              {email || "No email on file"}
            </Text>
          </Flex>
        </Box>
      </Box>

      <Box
        bg="white"
        borderRadius="12px"
        border="1px solid"
        borderColor="#E4E4E7"
        overflow="hidden"
        py={5}
        px={{ base: 4, md: 5 }}
      >
        <Box pb={4}>
          <Heading fontSize="lg" fontWeight="600" color="#18181B">
            Password
          </Heading>
        </Box>
        <Separator borderColor="#E4E4E7" />
        <Box py={4}>
          <Text fontSize="sm" color="#52525B" mb={3}>
            Change your account password
          </Text>
          <ButtonV2
            variant="secondary"
            onClick={() => setIsDialogOpen(true)}
            h="48px"
            fontSize="sm"
            fontWeight="500"
            icon={<Lock size={18} color="#1679AB" />}
          >
            Change Password
          </ButtonV2>
        </Box>
      </Box>

      <ChangePasswordDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </VStack>
  );
}
