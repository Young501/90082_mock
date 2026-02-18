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

    console.log("onboarding", onboarding);

    if (userType === "student" && onboarding.student_onboarding) {
      return normalizePages(onboarding.student_onboarding);
    }

    const userPages = onboarding.user ?? [];
    const organisationPages = onboarding.organisation ?? [];

    const isOrgMember = getIsOrganisationMemberOnboarding();
    const showOrgPages =
      userType === "organisation" && !isOrgMember && currentPhase !== "user";

    return showOrgPages ? organisationPages : userPages;
  }, [userType, currentPhase, pagesData, getIsOrganisationMemberOnboarding]);

  console.log("pages", pages);

  const currentPage = useMemo(() => {
    return pages.find((p: Page) => p.id === currentPageId);
  }, [pages, currentPageId]);

  console.log("currentPage", currentPage);

  const error = queryError?.message || null;

  const progressInfo = useMemo(() => {
    const currentPageIndex = pages.findIndex((p) => p.id === currentPageId);
    const progressPercent =
      pages.length > 0 ? ((currentPageIndex + 1) / pages.length) * 100 : 0;

    return {
      currentPageIndex,
      progressPercent: Math.round(progressPercent),
    };
  }, [pages, currentPageId]);

  const navigationInfo = useMemo(() => {
    const isFirstPage = currentPage?.id === 1;
    const isLastPage = currentPage?.id === pages[pages.length - 1]?.id;

    console.log("isLastPage", isLastPage);
    console.log("currentPage", currentPage);

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
    startOrganisationPhase,
  };
};
