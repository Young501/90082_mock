"use client";

import { Progress, Box, Heading, Text, HStack, VStack } from "@chakra-ui/react";
import { UseMutationResult } from "@tanstack/react-query";
import { Alert } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect, useCallback } from "react";
import {
  useProfilePictureUpload,
  useResumeUpload,
  useOrganisationLogoUploadV2,
  useStudentProfileUpdateV2,
  useUserMeUpdateV2,
  useOrganisationMemberUpdateV2,
  useOrganisationProfileUpdateV2,
  useOrganisationProfileCreateV2,
} from "@/services/shared";
import { useOnboardingLogic } from "@/hooks/useOnboardingLogic";
import { usePrefillData } from "@/hooks/usePrefillData";
import { createPageSchema } from "@/utils/validationSchemas";
import { flattenQuestions } from "@/utils/questionnaireParser";
import { FieldRenderer } from "./FieldRenderer";
import { OrgSubmissionProgress } from "./OrgSubmissionProgress";
import { Button } from "@/components/ui/Button";
import { AbnValidationStatus, Question } from "@/types/onboarding";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import ProgressTrack from "@/components/ProgressTrack";
import { useAuthStore } from "@/store/authStore";
import { ReviewPreview } from "./ReviewPreview";
import Loader from "@/components/ui/Loader";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { TriangleAlert } from "lucide-react";
import {
  getMemberGeocodeLocationFromFormData,
  getOrganisationGeocodeLocationFromFormData,
  getUserGeocodeLocationFromFormData,
} from "@/utils/geocode";

interface Props {
  userType: string;
}

const USER_SUBMIT_STRIP_FIELDS = [
  "profile_picture",
  "resume",
  "location_geocode_lookup",
];
const STUDENT_SUBMIT_STRIP_FIELDS = [
  "profile_picture",
  "resume",
  "location",
  "location_geocode_lookup",
];

const ORGANISATION_STRIP_FIELDS = [
  "profile_picture",
  "resume",
  "logo",
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
    .filter(
      (q) =>
        q.model === "user" &&
        q.type !== "display" &&
        (q.type === "location_geocode_lookup" || !q.endpoint)
    )
    .map((q) => q.field);
  const studentProfileFields = allQuestions
    .filter(
      (q) =>
        q.model === "student_profile" && !q.endpoint && q.type !== "display"
    )
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

  for (const q of allQuestions) {
    if (
      q.model === "user" &&
      q.type === "location_geocode_lookup" &&
      q.field !== "location"
    ) {
      delete userPayload[q.field];
    }
  }
  const userLocationPayload = getUserGeocodeLocationFromFormData(
    allData,
    allQuestions
  );
  if (userLocationPayload) {
    userPayload.location = userLocationPayload;
  }

  USER_SUBMIT_STRIP_FIELDS.forEach((f) => {
    delete userPayload[f];
  });
  STUDENT_SUBMIT_STRIP_FIELDS.forEach((f) => {
    delete studentPayload[f];
  });

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

async function submitCoordinatorOnboarding(
  allData: Record<string, any>,
  allQuestions: Question[],
  profilePictureUpload: UseMutationResult<any, any, File, unknown>,
  userMeUpdateV2: UseMutationResult<any, any, Record<string, any>, unknown>,
  setUserProfilePictureUrl: (url: string) => void
) {
  const userFields = allQuestions
    .filter((q) => q.model === "user" && q.type !== "display" && !q.endpoint)
    .map((q) => q.field);

  const userPayload: Record<string, any> = {};
  userFields.forEach((field) => {
    if (allData[field] !== undefined && allData[field] !== "") {
      userPayload[field] = allData[field];
    }
  });
  USER_SUBMIT_STRIP_FIELDS.forEach((f) => delete userPayload[f]);

  if (Object.keys(userPayload).length > 0) {
    await userMeUpdateV2.mutateAsync(userPayload);
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

  toast.success("Profile created successfully!");
}

const ORG_PAGE_ID_OFFSET = 1000;

async function submitOrganisationOnboardingV2(
  allData: Record<string, any>,
  allQuestions: Question[],
  options: {
    phase?: "user" | "organisation";
    isOrganisationMember?: boolean;
    isFinalSubmit?: boolean;
    shouldCreateOrganisationProfile?: boolean;
  },
  profilePictureUpload: UseMutationResult<any, any, File, unknown>,
  resumeUpload: UseMutationResult<any, any, File, unknown>,
  logoUpload: UseMutationResult<any, any, File, unknown>,
  userMeUpdateV2: UseMutationResult<any, any, Record<string, any>, unknown>,
  organisationMemberUpdateV2: UseMutationResult<
    any,
    any,
    Record<string, any>,
    unknown
  >,
  organisationProfileUpdateV2: UseMutationResult<
    any,
    any,
    Record<string, any>,
    unknown
  >,
  organisationProfileCreateV2: UseMutationResult<
    any,
    any,
    Record<string, any>,
    unknown
  >,
  setUserProfilePictureUrl: (url: string) => void,
  setLogoUrl: (url: string) => void
) {
  const {
    phase = "user",
    isOrganisationMember = false,
    isFinalSubmit = false,
    shouldCreateOrganisationProfile = false,
  } = options;
  const userFields = allQuestions
    .filter((q) => q.model === "user" && !q.endpoint && q.type !== "display")
    .map((q) => q.field);
  const organisationFields = allQuestions
    .filter(
      (q) =>
        q.model === "organisation" &&
        q.type !== "display" &&
        (q.type === "abn_lookup" ||
          q.type === "location_geocode_lookup" ||
          !q.endpoint)
    )
    .map((q) => q.field);

  const organisationMemberFields = allQuestions
    .filter(
      (q) =>
        q.model === "organisation_member" &&
        q.type !== "display" &&
        (q.type === "location_geocode_lookup" || !q.endpoint)
    )
    .map((q) => q.field);

  const userPayload: Record<string, any> = {};
  userFields.forEach((field) => {
    if (allData[field] !== undefined && allData[field] !== "") {
      userPayload[field] = allData[field];
    }
  });
  const organisationPayload: Record<string, any> = {};
  organisationFields.forEach((field) => {
    if (allData[field] !== undefined && allData[field] !== "") {
      organisationPayload[field] = allData[field];
    }
  });

  for (const q of allQuestions) {
    if (
      q.model === "organisation" &&
      q.type === "location_geocode_lookup" &&
      q.field !== "location"
    ) {
      delete organisationPayload[q.field];
    }
  }
  const organisationLocationPayload =
    getOrganisationGeocodeLocationFromFormData(allData, allQuestions);
  if (organisationLocationPayload) {
    organisationPayload.location = organisationLocationPayload;
  }

  const organisationMemberPayload: Record<string, any> = {};
  organisationMemberFields.forEach((field) => {
    if (allData[field] !== undefined && allData[field] !== "") {
      organisationMemberPayload[field] = allData[field];
    }
  });

  for (const q of allQuestions) {
    if (
      q.model === "organisation_member" &&
      q.type === "location_geocode_lookup" &&
      q.field !== "location"
    ) {
      delete organisationMemberPayload[q.field];
    }
  }
  const memberLocationPayload = getMemberGeocodeLocationFromFormData(
    allData,
    allQuestions
  );
  if (memberLocationPayload) {
    organisationMemberPayload.location = memberLocationPayload;
  }

  ORGANISATION_STRIP_FIELDS.forEach((f) => {
    delete userPayload[f];
    delete organisationPayload[f];
    delete organisationMemberPayload[f];
  });

  if (isFinalSubmit) {
    if (Object.keys(organisationPayload).length > 0) {
      if (shouldCreateOrganisationProfile) {
        await organisationProfileCreateV2.mutateAsync(organisationPayload);
      } else {
        await organisationProfileUpdateV2.mutateAsync(organisationPayload);
      }
    }

    if (Object.keys(userPayload).length > 0) {
      await userMeUpdateV2.mutateAsync(userPayload);
    }

    if (Object.keys(organisationMemberPayload).length > 0) {
      await organisationMemberUpdateV2.mutateAsync(organisationMemberPayload);
    }

    const profilePicture =
      allData.profile_picture ?? allData.profile_picture_url;
    if (profilePicture instanceof File) {
      try {
        const profileRes =
          await profilePictureUpload.mutateAsync(profilePicture);
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

    const logo = allData.logo ?? allData.logo_url;
    if (logo instanceof File) {
      try {
        const logoRes = await logoUpload.mutateAsync(logo);
        if (logoRes?.logo) {
          setLogoUrl(logoRes.logo);
        }
      } catch {
        toast.error("Logo upload failed. You can add it later.");
      }
    }

    toast.success("Profile created successfully!");
    return;
  }

  if (phase === "user") {
    if (Object.keys(userPayload).length > 0) {
      await userMeUpdateV2.mutateAsync(userPayload);
    }

    if (Object.keys(organisationPayload).length > 0) {
      await organisationProfileUpdateV2.mutateAsync(organisationPayload);
    }

    if (Object.keys(organisationMemberPayload).length > 0) {
      await organisationMemberUpdateV2.mutateAsync(organisationMemberPayload);
    }

    const profilePicture =
      allData.profile_picture ?? allData.profile_picture_url;
    if (profilePicture instanceof File) {
      try {
        const profileRes =
          await profilePictureUpload.mutateAsync(profilePicture);
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
    return;
  }

  if (phase === "organisation") {
    if (Object.keys(organisationPayload).length > 0) {
      await organisationProfileUpdateV2.mutateAsync(organisationPayload);
    }

    const logo = allData.logo ?? allData.logo_url;
    if (logo instanceof File) {
      try {
        const logoRes = await logoUpload.mutateAsync(logo);
        if (logoRes?.logo) {
          setLogoUrl(logoRes.logo);
        }
      } catch {
        toast.error("Logo upload failed. You can add it later.");
      }
    }

    toast.success("Organisation profile created successfully!");
  }
}

type OnboardingLogic = ReturnType<typeof useOnboardingLogic>;

interface OnboardingFormProps {
  userType: string;
  logic: OnboardingLogic;
  prefillData: Record<string, any>;
}

const OnboardingForm = ({
  userType,
  logic,
  prefillData,
}: OnboardingFormProps) => {
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
    isOrgMember,
    goToPreviousPage,
    goToNextPage,
    goToPage,
    goToPhaseAndPage,
    startOrganisationPhase,
    organisationPageStructure,
    canGoBackToUserPhase,
    totalSteps,
    currentStep,
    shouldCreateOrganisationProfile,
  } = logic;

  useEffect(() => {
    setAbnStatus("idle");
  }, [currentPage?.id]);

  const handleAbnValidationChange = useCallback(
    (status: AbnValidationStatus) => {
      setAbnStatus(status);
    },
    []
  );

  const [submitError, setSubmitError] = useState<string>("");
  const [showValidationError, setShowValidationError] =
    useState<boolean>(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);
  const [isOrgSubmitting, setIsOrgSubmitting] = useState<boolean>(false);
  const [showReviewPreview, setShowReviewPreview] = useState<boolean>(false);
  const [abnStatus, setAbnStatus] = useState<AbnValidationStatus>("idle");
  const studentProfileUpdateV2 = useStudentProfileUpdateV2();
  const userMeUpdateV2 = useUserMeUpdateV2();
  const organisationProfileUpdateV2 = useOrganisationProfileUpdateV2();
  const organisationProfileCreateV2 = useOrganisationProfileCreateV2();
  const organisationMemberUpdateV2 = useOrganisationMemberUpdateV2();
  const profilePictureUpload = useProfilePictureUpload();
  const resumeUpload = useResumeUpload();
  const logoUpload = useOrganisationLogoUploadV2();
  const schema = createPageSchema(currentPage?.questions || []);
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
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: false,
    defaultValues: prefillData,
  });

  const { setLogoUrl, userProfile } = useAuthStore();

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

  // Reset transient validation UI and clear stale errors when the page changes.
  useEffect(() => {
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
  }, [currentPage?.id, currentPage, clearErrors, getAllPossibleFields]);

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

  const handleBack = useCallback(() => {
    if (canGoBackToUserPhase && organisationPageStructure) {
      const memberPages = organisationPageStructure.memberPages;
      const lastMemberPage = memberPages[memberPages.length - 1];
      if (lastMemberPage) {
        goToPhaseAndPage("user", lastMemberPage.id);
      }
    } else {
      goToPreviousPage();
    }
  }, [
    canGoBackToUserPhase,
    organisationPageStructure,
    goToPhaseAndPage,
    goToPreviousPage,
  ]);

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

  const onContinueToOrg = async () => {
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
        setShowReviewPreview(false);
        // Member-phase answers persist in the form state (shouldUnregister: false),
        // so getValues() still carries them once we advance to the org phase.
        startOrganisationPhase();
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

      const allData = getValues();

      if (userType === "coordinator") {
        const allQuestions = flattenQuestions(
          pages.flatMap((p) => p.questions)
        );
        const { setUserProfilePictureUrl: setProfilePic } =
          useAuthStore.getState();
        await submitCoordinatorOnboarding(
          allData,
          allQuestions,
          profilePictureUpload,
          userMeUpdateV2,
          setProfilePic
        );
        router.push("/onboarding/success/");
        return;
      }

      if (userType === "student") {
        const allQuestions = flattenQuestions(
          pages.flatMap((p) => p.questions)
        );
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
        router.push("/onboarding/success/");
        return;
      }

      if (userType === "organisation") {
        const { setUserProfilePictureUrl: setProfilePic, setLogoUrl: setLogo } =
          useAuthStore.getState();

        const isFromReview = showReviewPreview;
        const allQuestions = flattenQuestions(
          isFromReview && organisationPageStructure
            ? [
                ...organisationPageStructure.memberPages.flatMap(
                  (p) => p.questions
                ),
                ...organisationPageStructure.orgPages.flatMap(
                  (p) => p.questions
                ),
              ]
            : pages.flatMap((p) => p.questions)
        );

        setIsOrgSubmitting(true);

        const MIN_DISPLAY_MS = 5 * 1100 + 400;
        await Promise.all([
          submitOrganisationOnboardingV2(
            allData,
            allQuestions,
            {
              isFinalSubmit: isFromReview,
              shouldCreateOrganisationProfile,
            },
            profilePictureUpload,
            resumeUpload,
            logoUpload,
            userMeUpdateV2,
            organisationMemberUpdateV2,
            organisationProfileUpdateV2,
            organisationProfileCreateV2,
            setProfilePic,
            setLogo
          ),
          new Promise<void>((resolve) => setTimeout(resolve, MIN_DISPLAY_MS)),
        ]);

        router.push("/onboarding/success/");
        return;
      }

      router.push("/onboarding/success/");
    } catch (error: any) {
      setIsOrgSubmitting(false);
      console.error(error);
      const data = error?.response?.data;
      let errorMessage: string;
      if (data?.detail) {
        errorMessage = data.detail;
      } else if (data?.error) {
        errorMessage = data.error;
      } else if (data && typeof data === "object") {
        const fieldErrors = Object.entries(data)
          .map(([field, errors]) => {
            const fieldLabel = field.replace(/_/g, " ");
            const messages = Array.isArray(errors)
              ? errors.join(", ")
              : String(errors);
            return `${fieldLabel}: ${messages}`;
          })
          .join("\n");
        errorMessage = fieldErrors || "Submission failed";
      } else {
        errorMessage = "Submission failed";
      }
      toast.error(errorMessage);
      setSubmitError(errorMessage);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLastPage) {
      onReviewClick();
    } else if (!isLastPage) {
      onNext();
    }
  };

  const loadingStates =
    studentProfileUpdateV2.isPending ||
    userMeUpdateV2.isPending ||
    organisationProfileUpdateV2.isPending ||
    organisationProfileCreateV2.isPending ||
    organisationMemberUpdateV2.isPending ||
    logoUpload.isPending ||
    profilePictureUpload.isPending ||
    resumeUpload.isPending;

  if (isOrgSubmitting) {
    return <OrgSubmissionProgress />;
  }

  if (showReviewPreview && isLastPage) {
    // The single form instance retains every page's answers (shouldUnregister:
    // false), so getValues() is the source of truth for the review.
    const reviewFormData = getValues();

    const reviewPages =
      userType === "organisation" && organisationPageStructure
        ? [
            ...organisationPageStructure.memberPages,
            ...organisationPageStructure.orgPages.map((p) => ({
              ...p,
              id: p.id + ORG_PAGE_ID_OFFSET,
            })),
          ]
        : pages;

    const handleReviewGoToPage = (pageId: number) => {
      setShowReviewPreview(false);
      if (
        userType === "organisation" &&
        organisationPageStructure &&
        pageId >= ORG_PAGE_ID_OFFSET
      ) {
        goToPhaseAndPage("organisation", pageId - ORG_PAGE_ID_OFFSET);
      } else if (
        userType === "organisation" &&
        organisationPageStructure &&
        pageId < ORG_PAGE_ID_OFFSET
      ) {
        goToPhaseAndPage("user", pageId);
      } else {
        goToPage(pageId);
      }
    };

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
            pages={reviewPages}
            goToPage={handleReviewGoToPage}
            onSubmit={onSubmit}
            onBack={() => {
              setShowReviewPreview(false);
            }}
            userType={userType}
            isLoading={loadingStates}
            university={userProfile?.university}
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

  const isUnsupportedUniversity =
    userType === "student" && !userProfile?.university;

  if (isUnsupportedUniversity) {
    return (
      <VStack
        w="100%"
        maxW="680px"
        mx="auto"
        p={8}
        bg="#FEF2F2"
        borderRadius="2xl"
        border="1px solid"
        borderColor="#FECACA"
        textAlign="center"
        alignItems="center"
        justifyContent="center"
        gap={4}
      >
        <Box bg="#FEE2E2" borderRadius="full" p={4} color="#DC2626">
          <TriangleAlert size={32} />
        </Box>
        <Heading fontSize="xl" fontWeight="600" color="#991B1B">
          University Not Supported
        </Heading>
        <Text fontSize="md" color="#B91C1C" textAlign="center">
          Your email domain does not belong to a university currently supported
          on UniConnected.
        </Text>
        <ButtonV2
          variant="primary"
          h={{ base: "48px", md: "64px" }}
          fontSize="md"
          fontWeight="500"
          w="100%"
          maxW={{ base: "100%", md: "137px" }}
          px={{ base: 4, md: 7 }}
          py={{ base: 4, md: 4.5 }}
          onClick={async () => {
            useAuthStore.getState().logout();
            router.push("/login/");
          }}
        >
          Back to Login
        </ButtonV2>
      </VStack>
    );
  }

  if (!currentPage) return <Text>No onboarding page found.</Text>;

  const hasFormErrors = Object.keys(errors).length > 0;

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
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      w="100%"
      mx="auto"
    >
      <Box w="100%" textAlign="left" mb={5}>
        <Heading fontSize="2xl" fontWeight="600" color="black" mb={4}>
          Create Your{" "}
          {userType === "student"
            ? "Student"
            : userType === "coordinator"
              ? "Coordinator"
              : "Organisation"}{" "}
          Profile
        </Heading>
        <HStack justify="space-between" w="100%" mb={2}>
          <Text fontSize="lg" color="#52525B">
            {currentPage.title}
          </Text>
          <Box bg="#F4F4F5" px={2} py={0.5} rounded="4px">
            <Text fontSize="sm" color="#27272A" fontWeight="700">
              Step {currentStep} of {totalSteps}
            </Text>
          </Box>
        </HStack>

        {totalSteps > 1 ? (
          <Box mb={2}>
            <ProgressTrack
              progressPercent={progressPercent}
              totalSteps={totalSteps}
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
        border="1px solid #E4E4E7"
        rounded="3xl"
        p={{ base: 4, md: 8 }}
      >
        {currentPage.questions.map((question) => (
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
            onFieldUnregistered={handleFieldUnregistered}
            organisationName={organisationName}
            university={userProfile?.university}
            onAbnValidationChange={handleAbnValidationChange}
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
                  onClick={handleBack}
                  disabled={loadingStates}
                >
                  Back
                </ButtonV2>
              )}

              {isLastPage ? (
                currentPhase === "user" &&
                !isOrgMember &&
                userType === "organisation" ? (
                  <ButtonV2
                    type="button"
                    onClick={onContinueToOrg}
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
                ) : (
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
                )
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

export const OnboardingSteps = ({ userType }: Props) => {
  const router = useRouter();
  const logic = useOnboardingLogic(userType);
  const { prefillData, isLoading: isPrefillLoading } = usePrefillData(userType);

  useEffect(() => {
    if (!logic.isLoading && logic.pages && logic.pages.length === 0) {
      toast.info("No onboarding required. Redirecting to Home");
      router.push("/home/");
    }
  }, [logic.isLoading, logic.pages, router]);

  // Gate the form mount until prefill data resolves so it can seed
  // useForm({ defaultValues }) once, instead of patching values via setValue.
  if (logic.isLoading || isPrefillLoading || prefillData === null) {
    return <Loader type="page" />;
  }

  return (
    <OnboardingForm userType={userType} logic={logic} prefillData={prefillData} />
  );
};
