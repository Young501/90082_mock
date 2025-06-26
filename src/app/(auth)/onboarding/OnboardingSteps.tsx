"use client";

import { Progress, Box, Heading, Text } from "@chakra-ui/react";
import { Alert } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import {
  useOnboardingSubmission,
  useProfilePictureUpload,
  useResumeUpload,
  useLogoUpload,
} from "@/services/shared";
import { useOnboardingLogic } from "@/hooks/useOnboardingLogic";
import { createPageSchema } from "@/utils/validationSchemas";
import { FieldRenderer } from "./FieldRenderer";
import { Button } from "@/components/ui/Button";
import { Question } from "@/types/onboarding";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import ProgressTrack from "@/components/ProgressTrack";

interface Props {
  userType: string;
}

export const OnboardingSteps = ({ userType }: Props) => {
  const router = useRouter();
  const {
    pages,
    currentPage,
    isLoading,
    error,
    progressPercent,
    isFirstPage,
    isLastPage,
    goToPreviousPage,
    goToNextPage,
    pages,
    // isThirdPage,
  } = useOnboardingLogic();

  useEffect(() => {
    if (!isLoading && pages) {
      if (!pages || pages.length === 0) {
        toast.info("No onboarding required. Redirecting to Home");
        router.push("/home");
        return;
      }
    }
  }, [isLoading, pages, router]);

  const [submitError, setSubmitError] = useState<string>("");
  const [showValidationError, setShowValidationError] =
    useState<boolean>(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const submissionMutation = useOnboardingSubmission(userType);
  const profilePictureUpload = useProfilePictureUpload(userType);
  const resumeUpload = useResumeUpload(userType);
  const logoUpload = useLogoUpload(userType);
  const schema = createPageSchema(currentPage?.questions || []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    trigger,
    setValue,
    getValues,
    clearErrors,
    unregister,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const getAllPossibleFields = (questions: Question[]): string[] => {
    const fields: string[] = [];
    questions.forEach((question) => {
      fields.push(question.field);
      if (question.followup_question) {
        Object.values(question.followup_question).forEach((followup) => {
          fields.push(...getAllPossibleFields([followup]));
        });
      }
    });
    return fields;
  };

  const getCurrentVisibleFields = (
    questions: Question[],
    formValues: Record<string, any>
  ): string[] => {
    const fields: string[] = [];

    const processQuestion = (question: Question) => {
      fields.push(question.field);

      if (question.followup_question && formValues[question.field]) {
        const values = Array.isArray(formValues[question.field])
          ? formValues[question.field]
          : [formValues[question.field]];

        values.forEach((val: string) => {
          const followup = question.followup_question![val];
          if (followup) {
            processQuestion(followup);
          }
        });
      }
    };

    questions.forEach(processQuestion);
    return fields;
  };

  const getChildFields = (question: Question): string[] => {
    const fields: string[] = [];
    if (question.followup_question) {
      Object.values(question.followup_question).forEach((followup) => {
        fields.push(followup.field);
        fields.push(...getChildFields(followup));
      });
    }
    return fields;
  };

  const cleanupInvisibleFields = async (): Promise<void> => {
    if (!currentPage) return;

    const currentValues = getValues();
    const visibleFields = getCurrentVisibleFields(
      currentPage.questions,
      currentValues
    );
    const allPossibleFields = getAllPossibleFields(currentPage.questions);

    const invisibleFields = allPossibleFields.filter(
      (field) => !visibleFields.includes(field)
    );

    invisibleFields.forEach((field) => {
      unregister(field);
      clearErrors(field);
    });

    await new Promise((resolve) => setTimeout(resolve, 10));
  };

  const performValidationWithoutGhosts = async (): Promise<boolean> => {
    if (!currentPage) return false;

    await cleanupInvisibleFields();

    const currentValues = getValues();
    const visibleFields = getCurrentVisibleFields(
      currentPage.questions,
      currentValues
    );

    const isValid = await trigger(visibleFields);
    return isValid;
  };

  useEffect(() => {
    const currentValues = getValues();
    setFormData((prev) => ({ ...prev, ...currentValues }));

    setShowValidationError(false);
    setHasAttemptedSubmit(false);
    setSubmitError("");

    reset();
  }, [currentPage?.id, getValues, reset]);

  useEffect(() => {
    if (currentPage && Object.keys(formData).length > 0) {
      const timeoutId = setTimeout(() => {
        Object.entries(formData).forEach(([field, value]) => {
          if (value !== undefined) {
            setValue(field, value, { shouldValidate: false });
          }
        });
      }, 10);

      return () => clearTimeout(timeoutId);
    }
  }, [setValue, formData, currentPage]);

  useEffect(() => {
    if (hasAttemptedSubmit) {
      const hasErrors = Object.keys(errors).length > 0;
      setShowValidationError(hasErrors);
    }
  }, [errors, hasAttemptedSubmit]);

  const onNext = async () => {
    setHasAttemptedSubmit(true);

    try {
      const isValid = await performValidationWithoutGhosts();

      if (isValid) {
        setShowValidationError(false);
        setSubmitError("");
        goToNextPage();
      } else {
        setShowValidationError(true);
      }
    } catch {
      setShowValidationError(true);
    }
  };

  const onSubmit = async () => {
    setHasAttemptedSubmit(true);

    try {
      const isValid = await performValidationWithoutGhosts();

      if (!isValid) {
        setShowValidationError(true);
        return;
      }

      const currentValues = getValues();
      const allData = { ...formData, ...currentValues };
      const submissionData = { ...allData };
      delete submissionData.profile_picture;
      delete submissionData.resume;
      delete submissionData.logo;

      const submissionResponse =
        await submissionMutation.mutateAsync(submissionData);
      toast.success(
        submissionResponse?.detail || "Profile created successfully!"
      );

      const profilePicture = allData.profile_picture;
      const resume = allData.resume;
      const logo = allData.logo;
      const uploadTasks = [];

      if (profilePicture instanceof File) {
        uploadTasks.push(profilePictureUpload.mutateAsync(profilePicture));
      }
      if (resume instanceof File) {
        uploadTasks.push(resumeUpload.mutateAsync(resume));
      }
      if (logo instanceof File) {
        uploadTasks.push(logoUpload.mutateAsync(logo));
      }
      if (uploadTasks.length > 0) {
        const results = await Promise.allSettled(uploadTasks);
        const failed = results.find((r) => r.status === "rejected");
        if (failed) {
          toast.error("File upload failed");
          setSubmitError("File upload failed");
          return;
        }

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            const response = result.value;
            if (index === 0 && profilePicture instanceof File) {
              toast.success(response?.detail);
            } else if (index === 1 && resume instanceof File) {
              toast.success(response?.detail);
            } else if (index === 2 && logo instanceof File) {
              toast.success(response?.detail);
            }
          }
        });
      }

      router.push("/home");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        "Submission failed";
      toast.error(errorMessage);
      setSubmitError(errorMessage);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLastPage) {
      onNext();
    }
  };

  if (isLoading) return <Text p={8}>Loading onboarding...</Text>;
  if (error)
    return (
      <Text color="red.500" p={8}>
        {error}
      </Text>
    );
  if (!currentPage) return <Text>No onboarding page found.</Text>;

  const hasFormErrors = Object.keys(errors).length > 0;

  return (
    <Box p={6}>
      <Text fontSize="sm" color="gray.600" mb={4}>
        Required fields are marked with{" "}
        <Text as="span" color="red.500">
          *
        </Text>
      </Text>

      <Heading fontSize={{ base: "28px", md: "35px" }} mb={14}>
        {currentPage.guide}
      </Heading>

      <Box
        as="form"
        onSubmit={handleFormSubmit}
        maxW="588px"
        w="100%"
        ml={{ base: 0, md: "100px" }}
      >
        {currentPage.questions.map((question) => (
          <FieldRenderer
            key={question.field}
            question={question}
            register={register}
            control={control}
            errors={errors}
            clearErrors={clearErrors}
            unregister={unregister}
          />
        ))}

        {showValidationError && hasFormErrors && (
          <Alert.Root status="error" mb={4}>
            <Alert.Indicator />
            <Alert.Title>
              Please follow the instructions to fill the form.
            </Alert.Title>
          </Alert.Root>
        )}

        {submitError && (
          <Alert.Root status="error" mb={4}>
            <Alert.Indicator />
            <Alert.Title>{submitError}</Alert.Title>
          </Alert.Root>
        )}

        <Box
          display="flex"
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            maxW="588px"
            w="100%"
            display="flex"
            flexDirection="column"
            gap={10}
          >
            <Box mt={6} display="flex" alignItems="center" gap={8}>
              {!isFirstPage && (
                <Button
                  type="button"
                  onClick={goToPreviousPage}
                  variant="primary"
                  style={{ width: "271px", borderRadius: "0px" }}
                >
                  Previous
                </Button>
              )}

              {isLastPage ? (
                <Button
                  type="button"
                  onClick={onSubmit}
                  variant="primary"
                  style={{ width: "271px", borderRadius: "0px" }}
                  isLoading={submissionMutation.isPending}
                >
                  Submit
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  style={{ width: "271px", borderRadius: "0px" }}
                >
                  Next
                </Button>
              )}
            </Box>
            <Box>
              <ProgressTrack
                progressPercent={progressPercent}
                totalSteps={pages.length}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
