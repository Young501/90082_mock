"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  VStack,
  Dialog,
  Portal,
  IconButton,
  Alert,
  Flex,
} from "@chakra-ui/react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import { toast } from "react-toastify";
import { Page, Question } from "@/types/onboarding";
import { createPageSchema } from "@/utils/validationSchemas";
import { FieldRenderer } from "@/app/(auth)/onboarding/FieldRenderer";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import {
  useStudentProfileUpdateV2,
  useUserMeUpdateV2,
  useProfilePictureUpload,
  useResumeUpload,
} from "@/services/shared";
import { useAuthStore } from "@/store/authStore";

export interface ProfileEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  page: Page;
  initialValues: Record<string, unknown>;
  onSuccess?: () => void;
  university?: { slug?: string; name?: string } | null;
}

export function ProfileEditDialog({
  isOpen,
  onClose,
  page,
  initialValues,
  onSuccess,
  university,
}: ProfileEditDialogProps) {
  const [fileUploadKey, setFileUploadKey] = useState(0);
  const [removedFiles, setRemovedFiles] = useState<Set<string>>(new Set());
  const { setUserProfilePictureUrl } = useAuthStore();

  const studentProfileUpdate = useStudentProfileUpdateV2();
  const userUpdate = useUserMeUpdateV2();
  const profilePictureUpload = useProfilePictureUpload();
  const resumeUpload = useResumeUpload();

  const schema = createPageSchema(page.questions, true);
  const customResolverFn = async (values: any, context: any, options: any) => {
    const result = await yupResolver(schema)(values, context, options);
    if (result.errors && Object.keys(result.errors).length > 0) {
      const filtered: Record<string, any> = {};
      Object.keys(result.errors).forEach((key) => {
        const shouldSkip =
          removedFiles.has(key) &&
          (values[key] === null ||
            values[key] === undefined ||
            values[key] === "");
        if (!shouldSkip) {
          filtered[key] = (result.errors as Record<string, any>)[key];
        }
      });
      result.errors = filtered;
    }
    return result;
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
    unregister,
    setError,
    setValue,
    watch,
  } = useForm({
    resolver: customResolverFn,
    defaultValues: initialValues as Record<string, any>,
  });

  const profilePictureValue = watch("profile_picture");
  const resumeValue = watch("resume");

  useEffect(() => {
    if (isOpen && initialValues) {
      const cleaned = Object.fromEntries(
        Object.entries(initialValues).map(([key, value]) => {
          if (value === null && (key.includes("_url") || key === "resume")) {
            return [key, ""];
          }
          if (value === null) return [key, undefined];
          if (value instanceof File) return [key, undefined];
          return [key, value];
        })
      );
      reset(cleaned as Record<string, any>);
      setRemovedFiles(new Set());
      setFileUploadKey((k) => k + 1);
    }
  }, [isOpen, initialValues, reset]);

  useEffect(() => {
    if (profilePictureValue instanceof File) {
      setRemovedFiles((prev) => {
        const next = new Set(prev);
        next.delete("profile_picture");
        return next;
      });
    }
  }, [profilePictureValue]);

  useEffect(() => {
    if (resumeValue instanceof File) {
      setRemovedFiles((prev) => {
        const next = new Set(prev);
        next.delete("resume");
        return next;
      });
    }
  }, [resumeValue]);

  const handleFileRemoval = (fieldName: string) => {
    setRemovedFiles((prev) => new Set(prev).add(fieldName));
    if (fieldName === "profile_picture") {
      setValue("profile_picture", null);
    } else if (fieldName === "resume") {
      setValue("resume", null);
    }
  };

  const handleClose = () => {
    reset();
    setRemovedFiles(new Set());
    onClose();
  };

  const onSubmit = async (data: Record<string, any>) => {
    const userFields: Record<string, any> = {};
    const studentFields: Record<string, any> = {};

    for (const q of page.questions) {
      const model = q.model ?? "student_profile";
      const value = data[q.field];
      if (value === undefined) continue;
      if (removedFiles.has(q.field) && (value === null || value === "")) continue;

      const payload = model === "user" ? userFields : studentFields;
      payload[q.field] = value;
    }

    try {
      if (Object.keys(userFields).length > 0) {
        const profilePicFile = userFields.profile_picture;
        if (profilePicFile instanceof File) {
          delete userFields.profile_picture;
          const uploadRes = await profilePictureUpload.mutateAsync(profilePicFile);
          const url =
            (uploadRes as any)?.profile_picture_url ??
            (uploadRes as any)?.profile_picture;
          if (url) setUserProfilePictureUrl(url);
        }
        delete userFields.profile_picture_url;
        delete userFields.resume;
        delete userFields.resume_url;
        const cleanedUser = Object.fromEntries(
          Object.entries(userFields).filter(
            ([_, v]) => v !== null && v !== undefined && v !== ""
          )
        );
        if (Object.keys(cleanedUser).length > 0) {
          await userUpdate.mutateAsync(cleanedUser);
        }
      }

      if (Object.keys(studentFields).length > 0) {
        const resumeFile = studentFields.resume;
        if (resumeFile instanceof File) {
          delete studentFields.resume;
          await resumeUpload.mutateAsync(resumeFile);
        }
        delete studentFields.profile_picture;
        delete studentFields.profile_picture_url;
        const cleanedStudent = Object.fromEntries(
          Object.entries(studentFields).filter(
            ([_, v]) => v !== null && v !== undefined && v !== ""
          )
        );
        if (Object.keys(cleanedStudent).length > 0) {
          await studentProfileUpdate.mutateAsync(cleanedStudent);
        }
      }

      toast.success("Profile updated successfully");
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Update failed";
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  const questions = page.questions.filter(
    (q: Question) => !["abn_lookup"].includes(q.type)
  );

  if (!isOpen) return null;

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
        <Dialog.Positioner zIndex={10000}>
          <Dialog.Content
            bg="white"
            borderRadius="20px"
            w="90%"
            maxW="560px"
            maxH="90vh"
            overflow="hidden"
            display="flex"
            flexDirection="column"
          >
            <Box
              p={6}
              pb={0}
              flexShrink={0}
              borderBottom="1px solid"
              borderColor="#E4E4E7"
            >
              <Flex justify="space-between" align="center">
                <Text fontSize="xl" fontWeight="bold" color="#000">
                  Edit {page.title}
                </Text>
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  aria-label="Close"
                >
                  <X size={20} color="#52525B" />
                </IconButton>
              </Flex>
            </Box>

            <Box
              flex={1}
              overflowY="auto"
              p={6}
              as="form"
              onSubmit={handleSubmit(onSubmit)}
            >
              {Object.keys(errors).length > 0 && (
                <Alert.Root status="error" mb={4}>
                  <Alert.Indicator />
                  <Alert.Title>Please fix the errors below.</Alert.Title>
                </Alert.Root>
              )}

              <VStack align="stretch" gap={4}>
                {questions.map((question: Question) => (
                  <FieldRenderer
                    key={question.field}
                    question={question}
                    register={register}
                    control={control}
                    errors={errors}
                    setError={setError}
                    setValue={setValue}
                    clearErrors={clearErrors}
                    unregister={unregister}
                    fileUploadKey={fileUploadKey}
                    onFileRemove={handleFileRemoval}
                    removedFiles={removedFiles}
                    university={university ?? undefined}
                  />
                ))}
              </VStack>

              <Flex gap={3} mt={6} justify="flex-end">
                <ButtonV2
                  variant="ghost"
                  bg="transparent"
                  color="black"
                  onClick={handleClose}
                  fontSize="14px"
                  border="1px solid #E4E4E7"
                  h="40px"
                  px={6}
                  borderRadius="xl"
                >
                  Cancel
                </ButtonV2>
                <ButtonV2
                  bg="#2AA8E0"
                  color="white"
                  type="submit"
                  isLoading={
                    studentProfileUpdate.isPending || userUpdate.isPending
                  }
                  disabled={
                    studentProfileUpdate.isPending || userUpdate.isPending
                  }
                  fontSize="14px"
                  h="40px"
                  px={6}
                  borderRadius="xl"
                >
                  <Flex as="span" align="center" gap={2}>
                    <Image
                      src="/assets/saveicon.svg"
                      alt="save"
                      width={15}
                      height={20}
                    />
                    Save
                  </Flex>
                </ButtonV2>
              </Flex>
            </Box>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
