import { useState, useMemo, useCallback, useEffect } from "react";
import {
  useOnboardingPages,
  useStudentProfileV2,
  useUserMeV2,
  useOrganisationMemberMeV2,
  useOrganisationProfileV2,
} from "@/services/shared";
import { Page } from "@/types/onboarding";
import {
  isStudentOnboardingComplete,
  isOrganisationMemberComplete,
  isOrganisationComplete,
} from "@/hooks/auth";
import { useOnboardingFlowStore } from "@/store/onboardingFlowStore";

const normalizePages = (rawPages: any[]): Page[] => {
  if (!Array.isArray(rawPages) || rawPages.length === 0) return [];
  return rawPages.map((p, i) => ({
    id: p.id,
    title: p.title,
    questions: p.questions ?? [],
  }));
};

export const useOnboardingLogic = (userType: string) => {
  const [currentPageId, setCurrentPageId] = useState<number>(1);
  const [currentPhase, setCurrentPhase] = useState<"user" | "organisation">(
    "user"
  );

  const { data: studentProfileV2, isLoading: isProfileLoading } =
    useStudentProfileV2(userType === "student");

  const { data: userMeV2, isLoading: isUserMeLoading } = useUserMeV2(
    userType === "student"
  );

  const {
    data: organisationMember,
    isLoading: isMemberLoading,
    isFetched: isMemberFetched,
  } = useOrganisationMemberMeV2(userType === "organisation");

  const {
    data: organisationProfile,
    isLoading: isOrgProfileLoading,
    isFetched: isOrgProfileFetched,
    isError: isOrgProfileError,
    error: orgProfileError,
  } = useOrganisationProfileV2(userType === "organisation");

  const shouldCreateOrganisationProfile =
    userType === "organisation" &&
    isOrgProfileFetched &&
    isOrgProfileError &&
    (orgProfileError as any)?.response?.status === 404;

  const memberComplete = isOrganisationMemberComplete(
    organisationMember ?? null
  );
  const orgComplete = isOrganisationComplete(organisationProfile ?? null);
  const isOrgMember = userType === "organisation" && orgComplete;

  const onboardingPhaseFromStore = useOnboardingFlowStore(
    (s) => s.onboardingPhase
  );
  const setOnboardingPhase = useOnboardingFlowStore((s) => s.setOnboardingPhase);

  const derivedPhase: "user" | "organisation" = useMemo(() => {
    if (userType !== "organisation") return "user";
    if (!memberComplete) return "user";
    if (!orgComplete) return "organisation";
    return "organisation";
  }, [userType, memberComplete, orgComplete]);

  // Use store phase when landing from auth redirect (before data loads); otherwise use derived
  const hasPhaseData =
    userType !== "organisation" ||
    (isMemberFetched && (!memberComplete || isOrgProfileFetched));
  const effectivePhase: "user" | "organisation" = useMemo(() => {
    if (hasPhaseData) return derivedPhase;
    return onboardingPhaseFromStore ?? "user";
  }, [hasPhaseData, derivedPhase, onboardingPhaseFromStore]);

  useEffect(() => {
    setCurrentPhase(effectivePhase);
    setCurrentPageId(1);
  }, [effectivePhase]);

  // Clear store phase once we have derived data
  useEffect(() => {
    if (hasPhaseData && onboardingPhaseFromStore != null) {
      setOnboardingPhase(null);
    }
  }, [hasPhaseData, onboardingPhaseFromStore, setOnboardingPhase]);

  const mergedStudentProfile =
    userType === "student" && studentProfileV2 && userMeV2
      ? { ...studentProfileV2, ...userMeV2 }
      : studentProfileV2;

  const shouldFetchOnboardingPages =
    userType !== "student" ||
    (mergedStudentProfile !== undefined &&
      !isStudentOnboardingComplete(mergedStudentProfile));

  const {
    data: pagesData,
    isLoading: isPagesLoading,
    error: queryError,
  } = useOnboardingPages(userType || "", shouldFetchOnboardingPages);

  const isLoading =
    (userType === "student" && (isProfileLoading || isUserMeLoading)) ||
    (userType === "student" && shouldFetchOnboardingPages && isPagesLoading) ||
    (userType === "organisation" &&
      (isMemberLoading ||
        isOrgProfileLoading ||
        !isMemberFetched ||
        !isOrgProfileFetched ||
        isPagesLoading)) ||
    (userType !== "student" && userType !== "organisation" && isPagesLoading);

  const pages: Page[] = useMemo(() => {
    const onboarding = pagesData?.onboarding_pages;
    if (!onboarding) return [];

    if (userType === "student") {
      return normalizePages(
        onboarding.student_onboarding ?? onboarding.user ?? []
      );
    }

    if (userType === "organisation") {
      const memberPages =
        onboarding.organisation_member_onboarding ?? onboarding.user ?? [];
      const orgPages =
        onboarding.organisation_onboarding ?? onboarding.organisation ?? [];

      if (isOrgMember) return normalizePages(memberPages);

      return normalizePages(currentPhase === "user" ? memberPages : orgPages);
    }

    if (userType === "coordinator") {
      return normalizePages(
        onboarding.coordinator_onboarding ?? onboarding.user ?? []
      );
    }

    return normalizePages(onboarding.user ?? []);
  }, [userType, currentPhase, pagesData, isOrgMember]);

  const currentPage = useMemo(() => {
    return pages.find((p: Page) => p.id === currentPageId);
  }, [pages, currentPageId]);

  const error = queryError?.message || null;

  // Organisation structure pages
  const organisationPageStructure = useMemo(() => {
    if (userType !== "organisation") return null;
    const onboarding = pagesData?.onboarding_pages;
    if (!onboarding) return null;
    const memberPages = normalizePages(
      onboarding.organisation_member_onboarding ?? onboarding.user ?? []
    );
    const orgPages = normalizePages(
      onboarding.organisation_onboarding ?? onboarding.organisation ?? []
    );

    if (isOrgMember) {
      return { totalSteps: memberPages.length, memberPages, orgPages: [] };
    }
    return {
      totalSteps: memberPages.length + orgPages.length,
      memberPages,
      orgPages,
    };
  }, [userType, pagesData?.onboarding_pages, isOrgMember]);

  const progressInfo = useMemo(() => {
    const currentPageIndex = pages.findIndex((p) => p.id === currentPageId);

    if (userType === "organisation" && organisationPageStructure) {
      const { totalSteps, memberPages } = organisationPageStructure;
      let currentStep: number;

      if (currentPhase === "user") {
        currentStep = currentPageIndex >= 0 ? currentPageIndex + 1 : 0;
      } else {
        currentStep =
          memberPages.length +
          (currentPageIndex >= 0 ? currentPageIndex + 1 : 0);
      }

      const progressPercent =
        totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

      return {
        currentPageIndex,
        progressPercent: Math.round(progressPercent),
        totalSteps,
        currentStep,
      };
    }

    const totalSteps = pages.length;
    const currentStep = currentPageIndex >= 0 ? currentPageIndex + 1 : 0;
    const progressPercent =
      totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

    return {
      currentPageIndex,
      progressPercent: Math.round(progressPercent),
      totalSteps,
      currentStep,
    };
  }, [pages, currentPageId, userType, currentPhase, organisationPageStructure]);

  const navigationInfo = useMemo(() => {
    const isFirstPage =
      userType === "organisation" && currentPhase === "organisation"
        ? false
        : currentPage?.id === 1;
    const isLastPage = currentPage?.id === pages[pages.length - 1]?.id;

    return {
      isFirstPage,
      isLastPage,
    };
  }, [currentPage, pages, userType, currentPhase]);

  const goToPreviousPage = useCallback(() => {
    const currentIndex = pages.findIndex((p: Page) => p.id === currentPageId);
    if (currentIndex > 0) {
      setCurrentPageId(pages[currentIndex - 1].id);
    }
  }, [pages, currentPageId]);

  const canGoBackToUserPhase = useMemo(() => {
    if (userType !== "organisation" || !organisationPageStructure) return false;
    if (currentPhase !== "organisation") return false;
    const currentIndex = pages.findIndex((p: Page) => p.id === currentPageId);
    return currentIndex === 0;
  }, [userType, organisationPageStructure, currentPhase, pages, currentPageId]);

  const goToNextPage = useCallback(() => {
    const currentIndex = pages.findIndex((p: Page) => p.id === currentPageId);
    if (currentIndex >= 0 && currentIndex < pages.length - 1) {
      setCurrentPageId(pages[currentIndex + 1].id);
    }
  }, [pages, currentPageId]);

  const goToPage = useCallback(
    (pageId: number) => {
      const page = pages.find((p: Page) => p.id === pageId);
      if (page) {
        setCurrentPageId(pageId);
      }
    },
    [pages]
  );

  const startOrganisationPhase = useCallback(() => {
    if (userType === "organisation") {
      setCurrentPhase("organisation");
      setCurrentPageId(1);
    }
  }, [userType]);

  const goToPhaseAndPage = useCallback(
    (phase: "user" | "organisation", pageId: number) => {
      if (userType === "organisation") {
        setCurrentPhase(phase);
        setCurrentPageId(pageId);
      }
    },
    [userType]
  );

  const isUserPhaseComplete = useMemo(() => {
    if (userType !== "organisation") return false;
    if (isOrgMember) return true;
    return currentPhase === "organisation";
  }, [userType, currentPhase, isOrgMember]);

  /** Prefilled form data from existing org member for user phase */
  const prefilledData = useMemo(() => {
    if (userType !== "organisation" || !organisationMember) return null;
    const member = organisationMember as Record<string, any>;
    const data: Record<string, any> = {};

    // User / organisation_member fields from member
    const memberFields = [
      "first_name",
      "last_name",
      "profile_picture_url",
      "profile_picture",
      "job_title",
    ] as const;
    memberFields.forEach((field) => {
      const val = member[field];
      if (val != null && (typeof val !== "string" || val.trim() !== "")) {
        data[field] = val;
      }
    });
    if (member.profile_picture_url && !data.profile_picture) {
      data.profile_picture = member.profile_picture_url;
    }

    return Object.keys(data).length > 0 ? data : null;
  }, [userType, organisationMember]);

  return {
    pages,
    currentPage,
    userType,
    isLoading,
    error,
    currentPhase,
    isUserPhaseComplete,
    isOrgMember,
    organisationMember,
    organisationProfile,
    shouldCreateOrganisationProfile,
    organisationPageStructure,
    canGoBackToUserPhase,
    ...progressInfo,
    ...navigationInfo,
    goToPreviousPage,
    goToNextPage,
    goToPage,
    goToPhaseAndPage,
    startOrganisationPhase,
    prefilledData,
  };
};
