import { useState, useMemo, useCallback } from "react";
import { useOnboardingPages, useStudentProfileV2 } from "@/services/shared";
import { Page } from "@/types/onboarding";
import { useAuthStore } from "@/store/authStore";
import { isStudentOnboardingComplete } from "@/hooks/auth";

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
  const { getIsOrganisationMemberOnboarding } = useAuthStore();
  const { data: studentProfileV2, isLoading: isProfileLoading } =
    useStudentProfileV2(userType === "student");

  const shouldFetchOnboardingPages =
    userType !== "student" ||
    (studentProfileV2 !== undefined &&
      !isStudentOnboardingComplete(studentProfileV2));

  const {
    data: pagesData,
    isLoading: isPagesLoading,
    error: queryError,
  } = useOnboardingPages(userType || "", shouldFetchOnboardingPages);

  const isLoading =
    (userType === "student" && isProfileLoading) ||
    (userType === "student" && shouldFetchOnboardingPages && isPagesLoading) ||
    (userType !== "student" && isPagesLoading);

  const pages: Page[] = useMemo(() => {
    const onboarding = pagesData?.onboarding_pages;
    if (!onboarding) return [];

    if (userType === "student") {
      return normalizePages(onboarding.student_onboarding ?? onboarding.user ?? []);
    }

    if (userType === "organisation") {
      const isOrgMember = getIsOrganisationMemberOnboarding();

      // v2 format: organisation_member_onboarding = personal info phase, organisation_onboarding = org details phase
      const memberPages =
        onboarding.organisation_member_onboarding ?? onboarding.user ?? [];
      const orgPages =
        onboarding.organisation_onboarding ?? onboarding.organisation ?? [];

      // Org members only complete the personal info phase
      if (isOrgMember) return normalizePages(memberPages);

      // New org owners go through personal info first, then org details
      return normalizePages(currentPhase === "user" ? memberPages : orgPages);
    }

    return normalizePages(onboarding.user ?? []);
  }, [userType, currentPhase, pagesData, getIsOrganisationMemberOnboarding]);


  const currentPage = useMemo(() => {
    return pages.find((p: Page) => p.id === currentPageId);
  }, [pages, currentPageId]);

  const error = queryError?.message || null;

  // Organisation structure: member phase + org phase for owners; org members only have member phase
  const organisationPageStructure = useMemo(() => {
    if (userType !== "organisation") return null;
    const onboarding = pagesData?.onboarding_pages;
    if (!onboarding) return null;

    const isOrgMember = getIsOrganisationMemberOnboarding();
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
  }, [
    userType,
    pagesData?.onboarding_pages,
    getIsOrganisationMemberOnboarding,
  ]);

  const progressInfo = useMemo(() => {
    const currentPageIndex = pages.findIndex((p) => p.id === currentPageId);

    if (userType === "organisation" && organisationPageStructure) {
      const { totalSteps, memberPages } = organisationPageStructure;
      let currentStep: number;

      if (currentPhase === "user") {
        currentStep = currentPageIndex >= 0 ? currentPageIndex + 1 : 0;
      } else {
        currentStep =
          memberPages.length + (currentPageIndex >= 0 ? currentPageIndex + 1 : 0);
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
  }, [
    pages,
    currentPageId,
    userType,
    currentPhase,
    organisationPageStructure,
  ]);

  const navigationInfo = useMemo(() => {
    const isFirstPage = currentPage?.id === 1;
    const isLastPage = currentPage?.id === pages[pages.length - 1]?.id;


    return {
      isFirstPage,
      isLastPage,
    };
  }, [currentPage, pages]);

  const goToPreviousPage = useCallback(() => {
    const currentIndex = pages.findIndex((p: Page) => p.id === currentPageId);
    if (currentIndex > 0) {
      setCurrentPageId(pages[currentIndex - 1].id);
    }
  }, [pages, currentPageId]);

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

  const isUserPhaseComplete = useMemo(() => {
    if (userType !== "organisation") return false;
    const isOrganisationMember = getIsOrganisationMemberOnboarding();
    if (isOrganisationMember) return true;
    return currentPhase === "organisation";
  }, [userType, currentPhase, getIsOrganisationMemberOnboarding]);

  return {
    pages,
    currentPage,
    userType,
    isLoading,
    error,
    currentPhase,
    isUserPhaseComplete,
    ...progressInfo,
    ...navigationInfo,
    goToPreviousPage,
    goToNextPage,
    goToPage,
    startOrganisationPhase,
  };
};
