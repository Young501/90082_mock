"use client";

import { Progress, Box, Heading, Text } from "@chakra-ui/react";
import { Alert } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect, useCallback } from "react";
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
import { useAuthStore } from "@/store/authStore";

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
  } = useOnboardingLogic();

  useEffect(() => {
    if (!isLoading && pages) {
      if (!pages || pages.length === 0) {
        toast.info("No onboarding required. Redirecting to Home");
        router.push("/discover/");
        return;
      }
    }
  }, [isLoading, pages, router]);

  const [submitError, setSubmitError] = useState<string>("");
  const [showValidationError, setShowValidationError] =
    useState<boolean>(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formKey, setFormKey] = useState<number>(0);
  const [parentValues, setParentValues] = useState<Record<string, any>>({});
  const submissionMutation = useOnboardingSubmission(userType);
  const profilePictureUpload = useProfilePictureUpload();
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
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
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

    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  const performValidationWithoutGhosts = async (): Promise<boolean> => {
    if (!currentPage) return false;

    await cleanupInvisibleFields();

    const currentValues = getValues();
    const visibleFields = getCurrentVisibleFields(
      currentPage.questions,
      currentValues
    );

    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const isValid = await trigger(visibleFields);
      return isValid;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    const currentValues = getValues();
    setFormData((prev) => ({ ...prev, ...currentValues }));

    setShowValidationError(false);
    setHasAttemptedSubmit(false);
    setSubmitError("");

    if (currentPage?.id) {
      setTimeout(() => {
        if (currentPage) {
          const allPossibleFields = getAllPossibleFields(currentPage.questions);
          allPossibleFields.forEach((field) => {
            clearErrors(field);
          });
        }
      }, 50);
    }
  }, [currentPage?.id, getValues, currentPage, clearErrors]);

  useEffect(() => {
    if (currentPage && Object.keys(formData).length > 0) {
      const timeoutId = setTimeout(() => {
        Object.entries(formData).forEach(([field, value]) => {
          if (value !== undefined) {
            setValue(field, value, { shouldValidate: false });
          }
        });
      }, 150);

      return () => clearTimeout(timeoutId);
    }
  }, [setValue, formData, currentPage]);

  useEffect(() => {
    if (formKey > 0 && Object.keys(formData).length > 0) {
      const timeoutId = setTimeout(() => {
        Object.entries(formData).forEach(([field, value]) => {
          if (value !== undefined) {
            setValue(field, value, { shouldValidate: false });
          }
        });
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [formKey, setValue, formData]);

  useEffect(() => {
    if (hasAttemptedSubmit) {
      const hasErrors = Object.keys(errors).length > 0;
      setShowValidationError(hasErrors);
    }
  }, [errors, hasAttemptedSubmit]);

  useEffect(() => {
    if (currentPage) {
      const subscription = watch((value, { name, type }) => {
        if (name && type === 'change') {
          trigger(name);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, trigger, currentPage]);

  const handleFieldUnregistered = useCallback((fieldName: string) => {
    setTimeout(() => {
      const currentValues = getValues();
      const visibleFields = getCurrentVisibleFields(
        currentPage?.questions || [],
        currentValues
      );
      trigger(visibleFields);
    }, 100);
  }, [getValues, currentPage, trigger]);

  const handleParentValueChange = useCallback((fieldName: string, newValue: any) => {
    const currentParentValue = parentValues[fieldName];
    if (currentParentValue !== newValue) {
      setParentValues(prev => ({ ...prev, [fieldName]: newValue }));
      
      const currentValues = getValues();
      const newFormData: Record<string, any> = {};
      
      Object.entries(currentValues).forEach(([key, value]) => {
        if (key !== fieldName && !isFollowupOf(key, fieldName, currentPage?.questions || [])) {
          newFormData[key] = value;
        }
      });
      
      newFormData[fieldName] = newValue;
      
      setFormData(newFormData);
      
      if (currentPage) {
        const fieldsToClear = getFollowupFields(fieldName, currentPage.questions);
        setTimeout(() => {
          fieldsToClear.forEach((field) => {
            unregister(field);
            clearErrors(field);
          });
        }, 50);
      }
      
      setTimeout(() => {
        setFormKey(prev => prev + 1);
        reset();
      }, 100);
    }
  }, [parentValues, getValues, currentPage, unregister, clearErrors, reset]);

  const isFollowupOf = useCallback((fieldName: string, parentField: string, questions: Question[]): boolean => {
    for (const question of questions) {
      if (question.field === parentField && question.followup_question) {
        for (const followup of Object.values(question.followup_question)) {
          if (followup.field === fieldName) {
            return true;
          }
          if (followup.followup_question) {
            for (const nestedFollowup of Object.values(followup.followup_question)) {
              if (nestedFollowup.field === fieldName) {
                return true;
              }
            }
          }
        }
      }
      if (question.followup_question) {
        for (const followup of Object.values(question.followup_question)) {
          if (isFollowupOf(fieldName, parentField, [followup])) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const getFollowupFields = useCallback((parentField: string, questions: Question[]): string[] => {
    const fields: string[] = [];
    
    for (const question of questions) {
      if (question.field === parentField && question.followup_question) {
        for (const followup of Object.values(question.followup_question)) {
          fields.push(followup.field);
          if (followup.followup_question) {
            for (const nestedFollowup of Object.values(followup.followup_question)) {
              fields.push(nestedFollowup.field);
            }
          }
        }
      }
      if (question.followup_question) {
        for (const followup of Object.values(question.followup_question)) {
          fields.push(...getFollowupFields(parentField, [followup]));
        }
      }
    }
    
    return fields;
  }, []);

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
      delete submissionData.profile_picture_url;
      delete submissionData.resume_url;
      delete submissionData.logo_url;
      delete submissionData.location;
      delete submissionData.location_geocode_lookup;

      const { setUserFirstName, setUserLastName, setUserProfilePictureUrl } = useAuthStore.getState();
      setUserFirstName(submissionData.first_name || "");
      setUserLastName(submissionData.last_name || "");

      const submissionResponse =
        await submissionMutation.mutateAsync(submissionData);
      toast.success(
        submissionResponse?.detail || "Profile created successfully!"
      );

      const profilePicture = allData.profile_picture_url;
      const resume = allData.resume_url;
      const logo = allData.logo_url;
      const uploadPromises = [];

      try {
        if (profilePicture instanceof File) {
          const profilePromise = profilePictureUpload
            .mutateAsync(profilePicture)
            .then((response) => {
              if (response?.profile_picture_url) {
                setUserProfilePictureUrl(response.profile_picture_url);
              }
              return response;
            });
          uploadPromises.push(profilePromise);
        }

        if (resume instanceof File) {
          uploadPromises.push(resumeUpload.mutateAsync(resume));
        }

        if (logo instanceof File) {
          uploadPromises.push(logoUpload.mutateAsync(logo));
        }

        if (uploadPromises.length > 0) {
          const results = await Promise.allSettled(uploadPromises);
          const failed = results.find((r) => r.status === "rejected");
          if (failed) {
            toast.error("Some files failed to upload");
          } else {
            results.forEach((result, index) => {
              if (result.status === "fulfilled") {
                const response = result.value;
                toast.success(response?.detail || "File uploaded successfully");
              }
            });
          }
        }
      } catch (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("File upload failed, but profile was saved");
      }

      router.push("/onboarding/success");
    } catch (error: any) {
      console.error(error);
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
    <Box
      p={6}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      w="100%"
      mx="auto"
    >
      <Box w="100%" maxW="588px" textAlign="left" mb={8}>
        <Heading fontSize={{ base: "28px", md: "35px" }} mb={4}>
          {currentPage.guide}
        </Heading>
        <Text fontSize="sm" color="gray.600" mb={4} ml={1}>
          Required fields are marked with{" "}
          <Text as="span" color="red.500">
            *
          </Text>
        </Text>
      </Box>

      <Box as="form" onSubmit={handleFormSubmit} w="100%" maxW="588px" key={formKey}>
        {currentPage.questions.map((question) => (
          <FieldRenderer
            key={`${formKey}-${question.field}`}
            question={question}
            register={register}
            control={control}
            errors={errors}
            clearErrors={clearErrors}
            unregister={unregister}
            onFieldUnregistered={handleFieldUnregistered}
            onParentValueChange={handleParentValueChange}
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
          <Box w="100%" display="flex" flexDirection="column" gap={10}>
            <Box
              mt={6}
              display="flex"
              alignItems="center"
              justifyContent={!isFirstPage ? "space-between" : "flex-end"}
              gap={{ base: 4, md: 0 }}
            >
              {!isFirstPage && (
                <Button
                  type="button"
                  onClick={goToPreviousPage}
                  variant="primary"
                  w={{ base: "calc(50% - 8px)", md: "271px" }}
                  style={{ borderRadius: "0px" }}
                >
                  Previous
                </Button>
              )}

              {isLastPage ? (
                <Button
                  type="button"
                  onClick={onSubmit}
                  variant="primary"
                  w={{
                    base: !isFirstPage ? "calc(50% - 8px)" : "100%",
                    md: "271px",
                  }}
                  style={{ borderRadius: "0px" }}
                  isLoading={submissionMutation.isPending}
                >
                  Submit
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  w={{
                    base: !isFirstPage ? "calc(50% - 8px)" : "100%",
                    md: "271px",
                  }}
                  style={{ borderRadius: "0px" }}
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
