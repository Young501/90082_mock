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
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { AbnValidationStatus, Page, Question } from "@/types/onboarding";
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
  useOrganisationMemberUpdateV2,
  useOrganisationProfileUpdateV2,
  useOrganisationMemberMeV2,
  useOrganisationProfileV2,
  // useOrganisationLogoUploadV2,
  useLogoUpload,
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

const DEDICATED_ENDPOINT_FIELDS = [
  "profile_picture",
  "profile_picture_url",
  "resume",
  "resume_url",
  "logo",
  "logo_url",
  "location_geocode_lookup",
];

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

  // Mutations
  const studentProfileUpdate = useStudentProfileUpdateV2();
  const userUpdate = useUserMeUpdateV2();
  const profilePictureUpload = useProfilePictureUpload();
  const resumeUpload = useResumeUpload();
  const orgMemberUpdate = useOrganisationMemberUpdateV2();
  const orgProfileUpdate = useOrganisationProfileUpdateV2();
  // const organisationLogoUpload = useLogoUpload("organisation");
  const logoUpload = useLogoUpload("organisation");

  const hasStudentProfileFields = useMemo(
    () => page.questions.some((q) => !q.model || q.model === "student_profile"),
    [page.questions]
  );
  const hasUserFields = useMemo(
    () => page.questions.some((q) => q.model === "user"),
    [page.questions]
  );
  const hasOrgMemberFields = useMemo(
    () => page.questions.some((q) => q.model === "organisation_member"),
    [page.questions]
  );
  const hasOrgFields = useMemo(
    () => page.questions.some((q) => q.model === "organisation"),
    [page.questions]
  );

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

  const {
    data: freshOrgMemberData,
    isLoading: isOrgMemberLoading,
    isFetched: isOrgMemberFetched,
  } = useOrganisationMemberMeV2(isOpen && hasOrgMemberFields);

  const {
    data: freshOrgProfileData,
    isLoading: isOrgProfileLoading,
    isFetched: isOrgProfileFetched,
  } = useOrganisationProfileV2(isOpen && hasOrgFields);

  const isFreshDataLoading =
    (hasStudentProfileFields && isOpen && !isStudentFetched) ||
    (hasUserFields && isOpen && !isUserFetched) ||
    (hasOrgMemberFields && isOpen && !isOrgMemberFetched) ||
    (hasOrgFields && isOpen && !isOrgProfileFetched);

  // skip abn field validation since its required since onboarding
  const schemaQuestions = page.questions.map((q) =>
    q.type === "abn_lookup" ? { ...q, required: false } : q
  );
  const schema = createPageSchema(schemaQuestions, true);
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
    formState: { errors, dirtyFields },
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
  const logoValue = watch("logo");
  const organisationNameValue = watch("name") as string | undefined;

  const [abnValidationStatus, setAbnValidationStatus] =
    useState<AbnValidationStatus>("idle");

  useEffect(() => {
    if (!isOpen) return;
    if (hasStudentProfileFields) {
      queryClient.invalidateQueries({ queryKey: ["student-profile-v2"] });
    }
    if (hasUserFields) {
      queryClient.invalidateQueries({ queryKey: ["user-me-v2"] });
    }
    if (hasOrgMemberFields) {
      queryClient.invalidateQueries({
        queryKey: ["organisation-member-me-v2"],
      });
    }
    if (hasOrgFields) {
      queryClient.invalidateQueries({ queryKey: ["organisation-profile-v2"] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Reset form with fresh API data once loaded
  useEffect(() => {
    if (!isOpen || isFreshDataLoading) return;

    const studentData = (freshStudentData as Record<string, any>) ?? {};
    const userData = (freshUserData as Record<string, any>) ?? {};
    const orgMemberData = (freshOrgMemberData as Record<string, any>) ?? {};
    const orgProfileData = (freshOrgProfileData as Record<string, any>) ?? {};

    const hasFreshData =
      (hasStudentProfileFields && Object.keys(studentData).length > 0) ||
      (hasUserFields && Object.keys(userData).length > 0) ||
      (hasOrgMemberFields && Object.keys(orgMemberData).length > 0) ||
      (hasOrgFields && Object.keys(orgProfileData).length > 0);

    const source: Record<string, any> = hasFreshData
      ? {
          ...studentData,
          ...orgProfileData,
          ...orgMemberData,
          ...userData,
          // profile_picture:
          //   userData.profile_picture ?? userData.profile_picture_url,
          // profile_picture_url:
          //   userData.profile_picture_url ??
          //   userData.profile_picture ??
          //   studentData.profile_picture_url,
          logo: orgProfileData.logo,
          logo_url: orgProfileData.logo,
          // linkedin: orgProfileData.linkedin,
          linkedin:
            studentData.linkedin ??
            orgProfileData.linkedin ??
            userData.linkedin,
          location: orgProfileData.location,
        }
      : (initialValues as Record<string, any>);

    const normalizeTaxonomyValue = (v: any): string | null => {
      if (typeof v === "string") return v;
      if (v && typeof v === "object") return v.value ?? v.code ?? v.id ?? null;
      return null;
    };

    const cleaned = Object.fromEntries(
      Object.entries(source).map(([key, value]) => {
        if (
          value === null &&
          (key.includes("_url") || key === "resume" || key === "logo")
        ) {
          return [key, ""];
        }
        if (value === null) return [key, undefined];
        if (value instanceof File) return [key, undefined];
        if (Array.isArray(value)) {
          const normalized = value
            .map(normalizeTaxonomyValue)
            .filter(Boolean) as string[];
          return [key, normalized];
        }
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
    freshOrgMemberData,
    freshOrgProfileData,
    hasStudentProfileFields,
    hasUserFields,
    hasOrgMemberFields,
    hasOrgFields,
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

  useEffect(() => {
    if (logoValue instanceof File) {
      setRemovedFiles((prev) => {
        const next = new Set(prev);
        next.delete("logo");
        return next;
      });
    }
  }, [logoValue]);

  const handleFileRemoval = (fieldName: string) => {
    setRemovedFiles((prev) => new Set(prev).add(fieldName));
    if (fieldName === "profile_picture") {
      setValue("profile_picture", null);
    } else if (fieldName === "resume") {
      setValue("resume", null);
    } else if (fieldName === "logo") {
      setValue("logo", null);
    }
  };

  const handleClose = () => {
    reset();
    setRemovedFiles(new Set());
    onClose();
  };

  const onSubmit = async (data: Record<string, any>) => {
    const hasAbnField = page.questions.some((q) => q.type === "abn_lookup");
    if (
      hasAbnField &&
      (abnValidationStatus === "pending" || abnValidationStatus === "invalid")
    ) {
      setError("abn" as any, { message: "Please verify your ABN before saving." });
      return;
    }

    const userFields: Record<string, any> = {};
    const studentFields: Record<string, any> = {};
    const orgMemberFields: Record<string, any> = {};
    const orgFields: Record<string, any> = {};

    for (const q of page.questions) {
      if (q.type === "display") continue;
      const model = q.model ?? "student_profile";
      const value = data[q.field];
      if (value === undefined) continue;
      if (removedFiles.has(q.field) && (value === null || value === ""))
        continue;

      if (model === "user") userFields[q.field] = value;
      else if (model === "organisation_member")
        orgMemberFields[q.field] = value;
      else if (model === "organisation") orgFields[q.field] = value;
      else studentFields[q.field] = value;
    }

    // Strip dedicated-endpoint fields from all payloads
    DEDICATED_ENDPOINT_FIELDS.forEach((f) => {
      delete userFields[f];
      delete studentFields[f];
      delete orgMemberFields[f];
      delete orgFields[f];
    });

    const profilePicFile =
      data.profile_picture instanceof File ? data.profile_picture : null;
    const resumeFile = data.resume instanceof File ? data.resume : null;
    const logoFile = data.logo instanceof File ? data.logo : null;

    try {
      if (Object.keys(userFields).length > 0) {
        const cleaned = Object.fromEntries(
          Object.entries(userFields).filter(
            ([_, v]) => v !== null && v !== undefined && v !== ""
          )
        );
        if (Object.keys(cleaned).length > 0) {
          await userUpdate.mutateAsync(cleaned);
        }
      }

      if (Object.keys(studentFields).length > 0) {
        const allStudentFields: Record<string, any> = { ...studentFields };
        for (const q of page.questions) {
          if (q.type === "display") continue;
          const model = q.model ?? "student_profile";
          if (model !== "student_profile") continue;
          if (DEDICATED_ENDPOINT_FIELDS.includes(q.field)) continue;
          if (q.field in allStudentFields) continue;
          allStudentFields[q.field] =
            q.type === "taxonomy-multiselect" || q.type === "multi-select"
              ? []
              : "";
        }
        await studentProfileUpdate.mutateAsync(allStudentFields);
      }

      if (Object.keys(orgMemberFields).length > 0) {
        const cleaned = Object.fromEntries(
          Object.entries(orgMemberFields).filter(
            ([_, v]) => v !== null && v !== undefined && v !== ""
          )
        );
        if (Object.keys(cleaned).length > 0) {
          await orgMemberUpdate.mutateAsync(cleaned);
        }
      }

      if (Object.keys(orgFields).length > 0) {
        const cleaned = Object.fromEntries(
          Object.entries(orgFields).filter(
            ([_, v]) => v !== null && v !== undefined && v !== ""
          )
        );
        if (Object.keys(cleaned).length > 0) {
          await orgProfileUpdate.mutateAsync(cleaned);
        }
      }

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

      if (logoFile) {
        await logoUpload.mutateAsync(logoFile);
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

  const questions = page.questions;

  const isMutating =
    profilePictureUpload.isPending ||
    resumeUpload.isPending ||
    logoUpload.isPending ||
    studentProfileUpdate.isPending ||
    userUpdate.isPending ||
    orgMemberUpdate.isPending ||
    orgProfileUpdate.isPending;

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
                    {questions.map((question: Question) => {
                      const fieldValue = watch(question.field);
                      const fieldProps = {
                        question,
                        fieldValue,
                        fieldError: errors[question.field],
                        isRemoved: removedFiles.has(question.field),
                        university: university ?? undefined,
                      };
                      return (
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
                          organisationName={
                            question.type !== "abn_lookup" || !!dirtyFields[question.field]
                              ? organisationNameValue
                              : undefined
                          }
                          onAbnValidationChange={setAbnValidationStatus}
                        />
                      );
                    })}
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
                      isLoading={isMutating}
                      disabled={isMutating}
                      h="44px"
                      maxW={{ base: "55%", sm: "175px" }}
                      w={{ base: "100%", sm: "auto" }}
                      px={6}
                      fontSize="md"
                      fontWeight="600"
                      bg="profile.500"
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
