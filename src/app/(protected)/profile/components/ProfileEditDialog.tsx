"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Text,
  VStack,
  Dialog,
  Portal,
  IconButton,
  Alert,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { Page, Question } from "@/types/onboarding";
import { createPageSchema } from "@/utils/validationSchemas";
import { FieldRenderer } from "@/app/(auth)/onboarding/FieldRenderer";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import {
  useStudentProfileUpdateV2,
  useUserMeUpdateV2,
  useProfilePictureUpload,
  useResumeUpload,
  useStudentProfileV2,
  useUserMeV2,
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
  const queryClient = useQueryClient();

  const studentProfileUpdate = useStudentProfileUpdateV2();
  const userUpdate = useUserMeUpdateV2();
  const profilePictureUpload = useProfilePictureUpload();
  const resumeUpload = useResumeUpload();

  // Determine which endpoints are needed based on question models
  const hasStudentProfileFields = useMemo(
    () => page.questions.some((q) => !q.model || q.model === "student_profile"),
    [page.questions]
  );
  const hasUserFields = useMemo(
    () => page.questions.some((q) => q.model === "user"),
    [page.questions]
  );

  // Fetch fresh API data when dialog is open
  const {
    data: freshStudentData,
    isLoading: isStudentLoading,
    isFetched: isStudentFetched,
  } = useStudentProfileV2(isOpen && hasStudentProfileFields);

  const {
    data: freshUserData,
    isLoading: isUserLoading,
    isFetched: isUserFetched,
  } = useUserMeV2(isOpen && hasUserFields);

  const isFreshDataLoading =
    (hasStudentProfileFields && isOpen && !isStudentFetched) ||
    (hasUserFields && isOpen && !isUserFetched);

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

  // //
  // useEffect(() => {
  //   if (Object.keys(errors).length > 0) {
  //     console.log("[ProfileEditDialog] form errors:", errors);
  //   }
  // }, [errors]);

  // When dialog opens, invalidate queries so we always get fresh data
  useEffect(() => {
    if (!isOpen) return;
    if (hasStudentProfileFields) {
      queryClient.invalidateQueries({ queryKey: ["student-profile-v2"] });
    }
    if (hasUserFields) {
      queryClient.invalidateQueries({ queryKey: ["user-me-v2"] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Reset form with fresh API data once loaded
  useEffect(() => {
    if (!isOpen || isFreshDataLoading) return;

    const studentData = (freshStudentData as Record<string, any>) ?? {};
    const userData = (freshUserData as Record<string, any>) ?? {};

    const hasFreshData =
      (hasStudentProfileFields && Object.keys(studentData).length > 0) ||
      (hasUserFields && Object.keys(userData).length > 0);

    const source: Record<string, any> = hasFreshData
      ? {
          ...studentData,
          ...userData,
          profile_picture:
            userData.profile_picture ?? userData.profile_picture_url,
          profile_picture_url:
            userData.profile_picture_url ??
            userData.profile_picture ??
            studentData.profile_picture_url,
        }
      : (initialValues as Record<string, any>);

    const normalizeTaxonomyValue = (v: any): string | null => {
      if (typeof v === "string") return v;
      if (v && typeof v === "object") return v.value ?? v.code ?? v.id ?? null;
      return null;
    };

    const cleaned = Object.fromEntries(
      Object.entries(source).map(([key, value]) => {
        if (value === null && (key.includes("_url") || key === "resume")) {
          return [key, ""];
        }
        if (value === null) return [key, undefined];
        if (value instanceof File) return [key, undefined];
        // Normalize array of taxonomy objects → array of code strings
        if (Array.isArray(value)) {
          const normalized = value
            .map(normalizeTaxonomyValue)
            .filter(Boolean) as string[];
          return [key, normalized];
        }
        // Normalize single taxonomy object → code string
        if (
          value &&
          typeof value === "object" &&
          ("code" in value || "value" in value)
        ) {
          return [key, normalizeTaxonomyValue(value) ?? undefined];
        }
        return [key, value];
      })
    );

    reset(cleaned);
    setRemovedFiles(new Set());
    setFileUploadKey((k) => k + 1);
  }, [
    isOpen,
    isFreshDataLoading,
    freshStudentData,
    freshUserData,
    hasStudentProfileFields,
    hasUserFields,
    initialValues,
    reset,
  ]);

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

  const DEDICATED_ENDPOINT_FIELDS = [
    "profile_picture",
    "profile_picture_url",
    "resume",
    "resume_url",
    "location_geocode_lookup",
  ];

  const onSubmit = async (data: Record<string, any>) => {
    const userFields: Record<string, any> = {};
    const studentFields: Record<string, any> = {};

    for (const q of page.questions) {
      if (q.type === "display") continue;

      const model = q.model ?? "student_profile";
      const value = data[q.field];
      if (value === undefined) continue;
      if (removedFiles.has(q.field) && (value === null || value === ""))
        continue;

      const payload = model === "user" ? userFields : studentFields;
      payload[q.field] = value;
    }

    [...DEDICATED_ENDPOINT_FIELDS].forEach((f) => {
      delete userFields[f];
      delete studentFields[f];
    });

    // Capture file refs before they were stripped
    const profilePicFile =
      data.profile_picture instanceof File ? data.profile_picture : null;
    const resumeFile = data.resume instanceof File ? data.resume : null;

    try {
      if (Object.keys(userFields).length > 0) {
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
        const cleanedStudent = Object.fromEntries(
          Object.entries(studentFields).filter(
            ([_, v]) => v !== null && v !== undefined && v !== ""
          )
        );
        if (Object.keys(cleanedStudent).length > 0) {
          await studentProfileUpdate.mutateAsync(cleanedStudent);
        }
      }

      // Handle dedicated-endpoint uploads after PATCH calls succeed
      if (profilePicFile) {
        const uploadRes =
          await profilePictureUpload.mutateAsync(profilePicFile);
        const url =
          (uploadRes as any)?.profile_picture_url ??
          (uploadRes as any)?.profile_picture;
        if (url) setUserProfilePictureUrl(url);
      }

      if (resumeFile) {
        await resumeUpload.mutateAsync(resumeFile);
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
            maxW="682px"
            maxH="90vh"
            overflow="hidden"
            display="flex"
            flexDirection="column"
          >
            <Box
              p={6}
              pb={4}
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
              {isFreshDataLoading ? (
                <Flex justify="center" align="center" minH="120px">
                  <Spinner size="lg" color="#2AA8E0" />
                </Flex>
              ) : (
                <>
                  {Object.keys(errors).length > 0 && (
                    <Alert.Root status="error" mb={4}>
                      <Alert.Indicator />
                      <Alert.Title>Please fix the errors below.</Alert.Title>
                    </Alert.Root>
                  )}

                  <VStack align="stretch" gap={4}>
                    {questions.map((question: Question) => (
                      <FieldRenderer
                        key={`${fileUploadKey}-${question.field}`}
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
                      onClick={handleClose}
                      variant="ghost"
                      type="button"
                      borderRadius="xl"
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
                      color="white"
                      type="submit"
                      isLoading={
                        profilePictureUpload.isPending ||
                        resumeUpload.isPending ||
                        studentProfileUpdate.isPending ||
                        userUpdate.isPending
                      }
                      disabled={
                        profilePictureUpload.isPending ||
                        resumeUpload.isPending ||
                        studentProfileUpdate.isPending ||
                        userUpdate.isPending
                      }
                      h="44px"
                      maxW={{ base: "55%", sm: "175px" }}
                      w={{ base: "100%", sm: "auto" }}
                      px={6}
                      fontSize="md"
                      fontWeight="600"
                      bg="#2AA8E0"
                    >
                      <Flex as="span" align="center" gap={2}>
                        Save and Update
                      </Flex>
                    </ButtonV2>
                  </Flex>
                </>
              )}
            </Box>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
