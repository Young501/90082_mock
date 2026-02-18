"use client";

import { Progress, Box, Heading, Text, HStack } from "@chakra-ui/react";
import { UseMutationResult } from "@tanstack/react-query";
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
  useStudentProfileUpdateV2,
  useUserMeUpdateV2,
  useStudentProfileV2,
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
import { ReviewPreview } from "./ReviewPreview";
import Loader from "@/components/ui/Loader";
import { ButtonV2 } from "@/components/ui/ButtonV2";

interface Props {
  userType: string;
}

const STUDENT_ENDPOINT_FIELDS = [
  "profile_picture",
  "resume",
  "location",
  "location_geocode_lookup",
];

async function submitStudentOnboardingV2(
  allData: Record<string, any>,
  allQuestions: Question[],
  profilePictureUpload: UseMutationResult<any, any, File, unknown>,
  resumeUpload: UseMutationResult<any, any, File, unknown>,
  userMeUpdateV2: UseMutationResult<any, any, Record<string, any>, unknown>,
  studentProfileUpdateV2: UseMutationResult<
    any,
    any,
    Record<string, any>,
    unknown
  >,
  setUserProfilePictureUrl: (url: string) => void
) {
  const userFields = allQuestions
    .filter((q) => q.model === "user" && !q.endpoint)
    .map((q) => q.field);
  const studentProfileFields = allQuestions
    .filter((q) => q.model === "student_profile" && !q.endpoint)
    .map((q) => q.field);

  const userPayload: Record<string, any> = {};
  userFields.forEach((field) => {
    if (allData[field] !== undefined && allData[field] !== "") {
      userPayload[field] = allData[field];
    }
  });
  const studentPayload: Record<string, any> = {};
  studentProfileFields.forEach((field) => {
    if (allData[field] !== undefined && allData[field] !== "") {
      studentPayload[field] = allData[field];
    }
  });

  STUDENT_ENDPOINT_FIELDS.forEach((f) => {
    delete userPayload[f];
    delete studentPayload[f];
  });

  if (allData.location) {
    userPayload.location = allData.location;
  }

  if (Object.keys(userPayload).length > 0) {
    await userMeUpdateV2.mutateAsync(userPayload);
  }

  if (Object.keys(studentPayload).length > 0) {
    await studentProfileUpdateV2.mutateAsync(studentPayload);
  }

  const profilePicture = allData.profile_picture ?? allData.profile_picture_url;
  if (profilePicture instanceof File) {
    try {
      const profileRes = await profilePictureUpload.mutateAsync(profilePicture);
      if (profileRes?.profile_picture_url) {
        setUserProfilePictureUrl(profileRes.profile_picture_url);
      }
    } catch {
      toast.error("Profile picture upload failed. You can add it later.");
    }
  }

  const resume = allData.resume ?? allData.resume_url;
  if (resume instanceof File) {
    try {
      await resumeUpload.mutateAsync(resume);
    } catch {
      toast.error("Resume upload failed. You can add it later.");
    }
  }

  toast.success("Profile created successfully!");
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
    goToPage,
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
  const [showReviewPreview, setShowReviewPreview] = useState<boolean>(false);
  const [userPhaseData, setUserPhaseData] = useState<Record<string, any>>({});
  const [abnStatus, setAbnStatus] = useState<AbnValidationStatus>("idle");
  const submissionMutation = useOnboardingSubmission(userType);
  const profileUpdateMutation = useProfileUpdate(userType);
  const studentProfileUpdateV2 = useStudentProfileUpdateV2();
  const userMeUpdateV2 = useUserMeUpdateV2();
  const { data: studentProfileV2 } = useStudentProfileV2();
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
    shouldUnregister: false,
  });

  const {
    setTempOrganisationUser,
    clearTempOrganisationUser,
    getIsOrganisationMemberOnboarding,
    getTempOrganisation,
    setLogoUrl,
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

  // Pre-populate display fields (e.g. university) from student profile v2
  useEffect(() => {
    if (
      userType === "student" &&
      studentProfileV2 &&
      currentPage?.questions.some((q) => q.type === "display")
    ) {
      currentPage.questions.forEach((q) => {
        if (q.type === "display" && q.model === "student_profile") {
          const val = (studentProfileV2 as Record<string, any>)[q.field];
          if (val != null) {
            const displayVal =
              typeof val === "object" && val?.label != null
                ? val.label
                : String(val);
            setValue(q.field, displayVal, { shouldValidate: false });
          }
        }
      });
    }
  }, [userType, studentProfileV2, currentPage, setValue]);

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
      setSubmitError((prev) => (prev === ABN_BLOCK_MESSAGE ? "" : prev));
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

  const onReviewClick = async () => {
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

      if (isValid && !abnBlocked) {
        setShowValidationError(false);
        setSubmitError("");
        setShowReviewPreview(true);
      } else {
        if (abnBlocked) {
          setSubmitError(ABN_BLOCK_MESSAGE);
        }
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

      if (userType === "student") {
        const allQuestions = pages.flatMap((p) => p.questions);
        const { setUserProfilePictureUrl: setProfilePic } =
          useAuthStore.getState();
        await submitStudentOnboardingV2(
          allData,
          allQuestions,
          profilePictureUpload,
          resumeUpload,
          userMeUpdateV2,
          studentProfileUpdateV2,
          setProfilePic
        );
        router.push("/onboarding/success");
        return;
      }

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
          const logoPromise = logoUpload.mutateAsync(logo).then((response) => {
            // TODO: we need return LGOGURL on upload logo endpoint instead of setting it in the store
            if (response?.logo_url) {
              setLogoUrl(response.logo_url);
            }
            return response;
          });
          uploadPromises.push(logoPromise);
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

  const loadingStates =
    submissionMutation.isPending ||
    profileUpdateMutation.isPending ||
    studentProfileUpdateV2.isPending ||
    userMeUpdateV2.isPending ||
    isLoadingOrganisationPrompt ||
    logoUpload.isPending ||
    profilePictureUpload.isPending ||
    resumeUpload.isPending;

  if (showCreateOrganisationPrompt && !getIsOrganisationMemberOnboarding()) {
    return (
      <CreateOrganisationPrompt
        onContinue={handleCreateOrganisation}
        userPhaseData={userPhaseData}
        userType={userType}
      />
    );
  }

  if (showReviewPreview && isLastPage) {
    const reviewFormData = { ...formData, ...getValues() };
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        w="100%"
        mx="auto"
      >
        <Box w="100%">
          <ReviewPreview
            formData={reviewFormData}
            pages={pages}
            goToPage={(pageId) => {
              setShowReviewPreview(false);
              goToPage(pageId);
            }}
            onSubmit={onSubmit}
            onBack={() => setShowReviewPreview(false)}
            userType={userType}
            isLoading={loadingStates}
          />
        </Box>
      </Box>
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
  const universitySlug =
    userType === "student" && studentProfileV2?.university
      ? typeof studentProfileV2.university === "string"
        ? studentProfileV2.university
        : ((studentProfileV2.university as { code?: string })?.code ?? null)
      : null;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      w="100%"
      mx="auto"
    >
      <Box w="100%" textAlign="left" mb={5}>
        <Heading fontSize="2xl" fontWeight="600" color="black" mb={4}>
          Create Your {userType === "student" ? "Student" : "Organisation"}{" "}
          Profile
        </Heading>
        <HStack justify="space-between" w="100%" mb={2}>
          <Text fontSize="lg" color="#52525B">
            {currentPage.title}
          </Text>
          <Box bg="#F4F4F5" px={2} py={0.5} rounded="4px">
            <Text fontSize="sm" color="#27272A" fontWeight="700">
              Step {currentPage.id} of {totalSteps()}
            </Text>
          </Box>
        </HStack>

        {pages.length > 1 ? (
          <Box mb={2}>
            <ProgressTrack
              progressPercent={progressPercent}
              totalSteps={totalSteps()}
            />
          </Box>
        ) : (
          <Box h="20px" />
        )}
        <Text fontSize="sm" color="#52525B">
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
        key={formKey}
        border="1px solid #E4E4E7"
        rounded="3xl"
        p={{ base: 4, md: 8 }}
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
            universitySlug={universitySlug}
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
              justifyContent={{
                base: isFirstPage ? "flex-start" : "center",
                md: !isFirstPage ? "flex-end" : "flex-start",
              }}
              gap={{ base: 4, md: 4 }}
            >
              {!isFirstPage && (
                <ButtonV2
                  type="button"
                  variant="secondary"
                  h="64px"
                  w={{ base: "calc(50% - 8px)", md: "fit-content" }}
                  px="28px"
                  py="18px"
                  fontSize="lg"
                  onClick={goToPreviousPage}
                  disabled={loadingStates}
                >
                  Back
                </ButtonV2>
              )}

              {isLastPage ? (
                <ButtonV2
                  type="button"
                  onClick={onReviewClick}
                  variant="primary"
                  h="64px"
                  fontSize="lg"
                  w={{
                    base: !isFirstPage ? "calc(50% - 8px)" : "100%",
                    md: !isFirstPage ? "fit-content" : "100%",
                  }}
                  px="28px"
                  py="18px"
                  isLoading={loadingStates}
                  disabled={loadingStates || isAbnBlocking || hasFormErrors}
                >
                  Review
                </ButtonV2>
              ) : (
                <ButtonV2
                  type="submit"
                  variant="primary"
                  h="64px"
                  fontSize="lg"
                  w={{
                    base: !isFirstPage ? "calc(50% - 8px)" : "100%",
                    md: !isFirstPage ? "fit-content" : "100%",
                  }}
                  px="28px"
                  py="18px"
                  isLoading={loadingStates}
                  disabled={loadingStates || isAbnBlocking || hasFormErrors}
                >
                  Next
                </ButtonV2>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
