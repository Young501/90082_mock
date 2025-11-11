"use client";

import { Progress, Box, Heading, Text } from "@chakra-ui/react";
import { Alert } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect, useCallback } from "react";
import {
  useOnboardingSubmission,
  useProfileUpdate,
  useProfilePictureUpload,
  useResumeUpload,
  useLogoUpload,
} from "@/services/shared";
import { useOnboardingLogic } from "@/hooks/useOnboardingLogic";
import { createPageSchema } from "@/utils/validationSchemas";
import { FieldRenderer } from "./FieldRenderer";
import { Button } from "@/components/ui/Button";
import { AbnValidationStatus, Question } from "@/types/onboarding";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import ProgressTrack from "@/components/ProgressTrack";
import { useAuthStore } from "@/store/authStore";
import { CreateOrganisationPrompt } from "./CreateOrganisationPrompt";
import Loader from "@/components/ui/Loader";

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
    currentPhase,
    isUserPhaseComplete,
    goToPreviousPage,
    goToNextPage,
    startOrganisationPhase,
  } = useOnboardingLogic(userType);

  useEffect(() => {
    if (!isLoading && pages) {
      if (!pages || pages.length === 0) {
        toast.info("No onboarding required. Redirecting to Home");
        router.push("/discover/");
        return;
      }
    }
  }, [isLoading, pages, router]);

  useEffect(() => {
    setAbnStatus("idle");
  }, [currentPage?.id]);

  const [submitError, setSubmitError] = useState<string>("");
  const [showValidationError, setShowValidationError] =
    useState<boolean>(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formKey, setFormKey] = useState<number>(0);
  const [parentValues, setParentValues] = useState<Record<string, any>>({});
  const [showCreateOrganisationPrompt, setShowCreateOrganisationPrompt] =
    useState<boolean>(false);
  const [userPhaseData, setUserPhaseData] = useState<Record<string, any>>({});
  const [abnStatus, setAbnStatus] =
    useState<AbnValidationStatus>("idle");
  const submissionMutation = useOnboardingSubmission(userType);
  const profileUpdateMutation = useProfileUpdate(userType);
  const profilePictureUpload = useProfilePictureUpload();
  const resumeUpload = useResumeUpload(userType);
  const logoUpload = useLogoUpload(userType);
  const schema = createPageSchema(currentPage?.questions || []);
  const [isLoadingOrganisationPrompt, setIsLoadingOrganisationPrompt] =
    useState<boolean>(false);
  const ABN_BLOCK_MESSAGE = "Please verify your ABN before continuing.";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    trigger,
    setValue,
    getValues,
    setError,
    clearErrors,
    unregister,
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const {
    setTempOrganisationUser,
    clearTempOrganisationUser,
    getIsOrganisationMemberOnboarding,
    getTempOrganisation,
  } = useAuthStore();

  const getProfilePictureUrl = useCallback(
    (profilePicture: any): string | null => {
      if (!profilePicture) return null;
      if (typeof profilePicture === "string") return profilePicture;
      if (profilePicture instanceof File) {
        return URL.createObjectURL(profilePicture);
      }
      return null;
    },
    []
  );

  const getAllPossibleFields = useCallback(
    (questions: Question[]): string[] => {
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
    },
    []
  );

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

  const getChildFields = useCallback((question: Question): string[] => {
    const fields: string[] = [];
    if (question.followup_question) {
      Object.values(question.followup_question).forEach((followup) => {
        fields.push(followup.field);
        fields.push(...getChildFields(followup));
      });
    }
    return fields;
  }, []);

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
  }, [
    currentPage?.id,
    getValues,
    currentPage,
    clearErrors,
    getAllPossibleFields,
  ]);

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
    if (abnStatus === "valid" || abnStatus === "idle") {
      setSubmitError((prev) =>
        prev === ABN_BLOCK_MESSAGE ? "" : prev
      );
    }
  }, [abnStatus, ABN_BLOCK_MESSAGE]);

  useEffect(() => {
    if (currentPage) {
      const subscription = watch((value, { name, type }) => {
        if (name && type === "change") {
          trigger(name);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, trigger, currentPage]);

  useEffect(() => {
    const isOrganisationMember = getIsOrganisationMemberOnboarding();
    if (
      userType === "organisation" &&
      currentPhase === "user" &&
      Object.keys(formData).length > 0 &&
      !isOrganisationMember
    ) {
      const tempUserData = {
        first_name: formData.first_name || "",
        last_name: formData.last_name || "",
        email: formData.email || "",
        profile_picture_url: getProfilePictureUrl(formData.profile_picture_url),
        user_types: [userType],
      };
      setTempOrganisationUser(tempUserData);
    } else if (
      userType !== "organisation" ||
      currentPhase !== "user" ||
      isOrganisationMember
    ) {
      const currentTempUser = useAuthStore.getState().tempOrganisationUser;
      clearTempOrganisationUser();
    }
  }, [
    formData,
    userType,
    currentPhase,
    setTempOrganisationUser,
    clearTempOrganisationUser,
    getProfilePictureUrl,
    getIsOrganisationMemberOnboarding,
  ]);

  useEffect(() => {
    return () => {
      if (userType === "organisation") {
        const currentTempUser = useAuthStore.getState().tempOrganisationUser;
        clearTempOrganisationUser();
      }
    };
  }, [userType, clearTempOrganisationUser]);

  useEffect(() => {
    const currentTempUser = useAuthStore.getState().tempOrganisationUser;
    if (
      currentTempUser?.profile_picture_url &&
      currentTempUser.profile_picture_url.startsWith("blob:")
    ) {
      const profileUrl = currentTempUser.profile_picture_url;
      return () => {
        if (profileUrl && profileUrl.startsWith("blob:")) {
          URL.revokeObjectURL(profileUrl);
        }
      };
    }
  }, []);

  const isFollowupOf = useCallback(
    (
      fieldName: string,
      parentField: string,
      questions: Question[]
    ): boolean => {
      for (const question of questions) {
        if (question.field === parentField && question.followup_question) {
          for (const followup of Object.values(question.followup_question)) {
            if (followup.field === fieldName) {
              return true;
            }
            if (followup.followup_question) {
              for (const nestedFollowup of Object.values(
                followup.followup_question
              )) {
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
    },
    []
  );

  const getFollowupFields = useCallback(
    (parentField: string, questions: Question[]): string[] => {
      const fields: string[] = [];

      for (const question of questions) {
        if (question.field === parentField && question.followup_question) {
          for (const followup of Object.values(question.followup_question)) {
            fields.push(followup.field);
            if (followup.followup_question) {
              for (const nestedFollowup of Object.values(
                followup.followup_question
              )) {
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
    },
    []
  );

  const handleFieldUnregistered = useCallback(
    (fieldName: string) => {
      setTimeout(() => {
        const currentValues = getValues();
        const visibleFields = getCurrentVisibleFields(
          currentPage?.questions || [],
          currentValues
        );
        trigger(visibleFields);
      }, 100);
    },
    [getValues, currentPage, trigger]
  );

  const handleParentValueChange = useCallback(
    (fieldName: string, newValue: any) => {
      const currentParentValue = parentValues[fieldName];
      if (currentParentValue !== newValue) {
        setParentValues((prev) => ({ ...prev, [fieldName]: newValue }));

        const currentValues = getValues();
        const newFormData: Record<string, any> = {};

        Object.entries(currentValues).forEach(([key, value]) => {
          if (
            key !== fieldName &&
            !isFollowupOf(key, fieldName, currentPage?.questions || [])
          ) {
            newFormData[key] = value;
          }
        });

        newFormData[fieldName] = newValue;

        setFormData(newFormData);

        if (currentPage) {
          const fieldsToClear = getFollowupFields(
            fieldName,
            currentPage.questions
          );
          setTimeout(() => {
            fieldsToClear.forEach((field) => {
              unregister(field);
              clearErrors(field);
            });
          }, 50);
        }

        setTimeout(() => {
          setFormKey((prev) => prev + 1);
          reset();
        }, 100);
      }
    },
    [
      parentValues,
      getValues,
      currentPage,
      unregister,
      clearErrors,
      reset,
      getFollowupFields,
      isFollowupOf,
    ]
  );

  const onNext = async () => {
    setHasAttemptedSubmit(true);

    try {
      const isValid = await performValidationWithoutGhosts();
      const hasAbnLookup = currentPage?.questions.some(
        (question) => question.type === "abn_lookup"
      );
      const abnBlocked =
        !!hasAbnLookup &&
        (abnStatus === "pending" ||
          abnStatus === "invalid" ||
          abnStatus === "error");

      if (isValid) {
        if (abnBlocked) {
          setSubmitError(ABN_BLOCK_MESSAGE);
          setShowValidationError(true);
          return;
        }

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

      const hasAbnLookup = currentPage?.questions.some(
        (question) => question.type === "abn_lookup"
      );
      const abnBlocked =
        !!hasAbnLookup &&
        (abnStatus === "pending" ||
          abnStatus === "invalid" ||
          abnStatus === "error");

      if (abnBlocked) {
        setSubmitError(ABN_BLOCK_MESSAGE);
        setShowValidationError(true);
        return;
      }

      const currentValues = getValues();
      const allData = { ...formData, ...currentValues };
      const isOrganisationMember = getIsOrganisationMemberOnboarding();

      if (
        userType === "organisation" &&
        currentPhase === "user" &&
        !isOrganisationMember
      ) {
        setUserPhaseData(allData);

        const tempUserData = {
          first_name: allData.first_name || "",
          last_name: allData.last_name || "",
          profile_picture_url: getProfilePictureUrl(
            allData.profile_picture_url
          ),
        };
        setTempOrganisationUser(tempUserData);

        setIsLoadingOrganisationPrompt(true);
        setTimeout(() => {
          setShowCreateOrganisationPrompt(true);
          setIsLoadingOrganisationPrompt(false);
        }, 2000);
        return;
      }

      let submissionData = { ...allData };
      delete submissionData.profile_picture_url;
      delete submissionData.resume_url;
      delete submissionData.logo_url;
      delete submissionData.location;
      delete submissionData.location_geocode_lookup;

      if (
        userType === "organisation" &&
        currentPhase === "organisation" &&
        !isOrganisationMember
      ) {
        const organisationData = { ...submissionData };
        delete organisationData.profile_picture_url;
        delete organisationData.resume_url;
        delete organisationData.logo_url;
        delete organisationData.location;
        delete organisationData.location_geocode_lookup;
        delete organisationData.first_name;
        delete organisationData.last_name;
        delete organisationData.email;
        delete organisationData.user_types;

        submissionData = {
          organisation: organisationData,
        };
      }

      if (isOrganisationMember) {
        submissionData.organisation = {};
      }

      const { setUserFirstName, setUserLastName, setUserProfilePictureUrl } =
        useAuthStore.getState();
      setUserFirstName(submissionData.first_name || "");
      setUserLastName(submissionData.last_name || "");

      let submissionResponse;
      if (
        userType === "organisation" &&
        currentPhase === "organisation" &&
        !isOrganisationMember
      ) {
        submissionResponse =
          await profileUpdateMutation.mutateAsync(submissionData);
        toast.success(
          submissionResponse?.detail ||
            "Organisation profile updated successfully!"
        );
      } else {
        submissionResponse =
          await submissionMutation.mutateAsync(submissionData);
        toast.success(
          submissionResponse?.detail || "Profile created successfully!"
        );
      }

      const profilePicture =
        allData.profile_picture_url || submissionData.profile_picture_url;
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

      if (userType === "organisation") {
        clearTempOrganisationUser();
        const { setIsOrganisationMemberOnboarding } = useAuthStore.getState();
        setIsOrganisationMemberOnboarding(false);
        router.push("/onboarding/success");
      } else {
        router.push("/onboarding/success");
      }
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

  const handleCreateOrganisation = () => {
    setShowCreateOrganisationPrompt(false);
    startOrganisationPhase();
    setFormData({});
    setFormKey(0);
    reset();
  };

  if (showCreateOrganisationPrompt && !getIsOrganisationMemberOnboarding()) {
    return (
      <CreateOrganisationPrompt
        onContinue={handleCreateOrganisation}
        userPhaseData={userPhaseData}
        userType={userType}
      />
    );
  }

  if (isLoading) return <Loader type="page" />;
  if (error)
    return (
      <Text color="red.500" p={8}>
        {error}
      </Text>
    );
  if (!currentPage) return <Text>No onboarding page found.</Text>;

  const hasFormErrors = Object.keys(errors).length > 0;

  const loadingStates =
    submissionMutation.isPending ||
    profileUpdateMutation.isPending ||
    isLoadingOrganisationPrompt ||
    logoUpload.isPending ||
    profilePictureUpload.isPending ||
    resumeUpload.isPending;

  const totalSteps = () => {
    if (pages.length === 1) {
      return 2;
    }
    return pages.length;
  };

  const hasAbnLookupField = currentPage.questions.some(
    (question) => question.type === "abn_lookup"
  );
  const isAbnBlocking =
    hasAbnLookupField &&
    (abnStatus === "pending" ||
      abnStatus === "invalid" ||
      abnStatus === "error");
  const organisationName = watch("name");

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

      <Box
        as="form"
        onSubmit={handleFormSubmit}
        w="100%"
        maxW="588px"
        key={formKey}
      >
        {currentPage.questions.map((question) => (
          <FieldRenderer
            key={`${formKey}-${question.field}`}
            question={question}
            register={register}
            control={control}
            errors={errors}
            setError={setError}
            clearErrors={clearErrors}
            unregister={unregister}
            onFieldUnregistered={handleFieldUnregistered}
            onParentValueChange={handleParentValueChange}
            organisationName={organisationName}
            onAbnValidationChange={(status) => {
              if (question.type === "abn_lookup") {
                setAbnStatus(status);
              }
            }}
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
                  disabled={loadingStates}
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
                  isLoading={loadingStates}
                  disabled={loadingStates || isAbnBlocking || hasFormErrors}
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
                  isLoading={loadingStates}
                  disabled={loadingStates || isAbnBlocking || hasFormErrors}
                >
                  Next
                </Button>
              )}
            </Box>
            {pages.length > 1 ? (
              <Box>
                <ProgressTrack
                  progressPercent={progressPercent}
                  totalSteps={totalSteps()}
                />
              </Box>
            ) : (
              <Box h="20px" />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
