import { useState, useMemo, useCallback } from "react";
import { useOnboardingPages } from "@/services/shared";
import { Page } from "@/types/onboarding";
import { useAuthStore } from "@/store/authStore";

export const useOnboardingLogic = (userType: string) => {
  const [currentPageId, setCurrentPageId] = useState<number>(1);
  const [currentPhase, setCurrentPhase] = useState<'user' | 'organisation'>('user');
  const { getIsOrganisationMemberOnboarding } = useAuthStore();

  const {
    data: pagesData,
    isLoading,
    error: queryError,
  } = useOnboardingPages(userType || "");

  const pages: Page[] = useMemo(() => {
    if (!pagesData?.onboarding_pages) return [];
    const userPages = pagesData.onboarding_pages?.user || [];
    const organisationUserPages = pagesData.onboarding_pages?.onboarding_pages?.user || [];
    const organisationPages = pagesData.onboarding_pages?.onboarding_pages?.organisation || [];
    
    const isOrganisationMember = getIsOrganisationMemberOnboarding();
    
    if (userType === "organisation") {
      if (isOrganisationMember) {
        return organisationUserPages;
      } else if (currentPhase === 'user') {
        return organisationUserPages;
      } else {
        return organisationPages;
      }
    }
    
    return userPages;
  }, [userType, pagesData, currentPhase, getIsOrganisationMemberOnboarding]);

  const currentPage = useMemo(() => {
    return pages.find((p: Page) => p.id === currentPageId);
  }, [pages, currentPageId]);

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
    const isLastPage = !currentPage?.follow_by;

    return {
      isFirstPage,
      isLastPage,
    };
  }, [currentPage]);

  const goToPreviousPage = useCallback(() => {
    const currentIndex = pages.findIndex((p: Page) => p.id === currentPageId);
    if (currentIndex > 0) {
      setCurrentPageId(pages[currentIndex - 1].id);
    }
  }, [pages, currentPageId]);

  const goToNextPage = useCallback(() => {
    const nextPageId = pages.find(
      (p: Page) => p.id === currentPageId
    )?.follow_by;
    if (nextPageId) {
      setCurrentPageId(nextPageId);
    }
  }, [pages, currentPageId]);

  const startOrganisationPhase = useCallback(() => {
    if (userType === "organisation") {
      setCurrentPhase('organisation');
      setCurrentPageId(1);
    }
  }, [userType]);

  const isUserPhaseComplete = useMemo(() => {
    if (userType !== "organisation") return false;
    const isOrganisationMember = getIsOrganisationMemberOnboarding();
    if (isOrganisationMember) return true;
    return currentPhase === 'organisation';
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
