// import { useState, useMemo, useCallback } from "react";
// import { useOnboardingPages } from "@/services/userTypes";
// import { Page } from "@/types/onboarding";
// import { useAuthStore } from "@/store";

// export const useOnboardingLogic = () => {
//   const { user } = useAuthStore();
//   const [currentPageId, setCurrentPageId] = useState<number>(1);

//   const userType = user?.user_types?.[0];
//   const {
//     data: pagesData,
//     isLoading,
//     error: queryError,
//   } = useOnboardingPages(userType || "");

//   const pages: Page[] = useMemo(() => {
//     return pagesData?.onboarding_pages || [];
//   }, [pagesData?.onboarding_pages]);

//   const currentPage = useMemo(() => {
//     return pages.find((p: Page) => p.id === currentPageId);
//   }, [pages, currentPageId]);

//   const error = queryError?.message || null;

//   const progressInfo = useMemo(() => {
//     const currentPageIndex = pages.findIndex((p) => p.id === currentPageId);
//     const progressPercent =
//       pages.length > 0 ? ((currentPageIndex + 1) / pages.length) * 100 : 0;

//     return {
//       currentPageIndex,
//       progressPercent: Math.round(progressPercent),
//     };
//   }, [pages, currentPageId]);

//   const navigationInfo = useMemo(() => {
//     const isFirstPage = currentPage?.id === 1;
//     const isThirdPage = currentPage?.id === 3;
//     const isLastPage = !currentPage?.follow_by;

//     return {
//       isFirstPage,
//       isLastPage,
//       isThirdPage,
//     };
//   }, [currentPage]);

//   const goToPreviousPage = useCallback(() => {
//     const currentIndex = pages.findIndex((p: Page) => p.id === currentPageId);
//     if (currentIndex > 0) {
//       setCurrentPageId(pages[currentIndex - 1].id);
//     }
//   }, [pages, currentPageId]);

//   const goToNextPage = useCallback(() => {
//     const nextPageId = pages.find(
//       (p: Page) => p.id === currentPageId
//     )?.follow_by;
//     if (nextPageId) {
//       setCurrentPageId(nextPageId);
//     }
//   }, [pages, currentPageId]);

//   return {
//     pages,
//     currentPage,
//     userType,
//     isLoading,
//     error,
//     ...progressInfo,
//     ...navigationInfo,
//     goToPreviousPage,
//     goToNextPage,
//   };
// };

import { useState, useMemo, useCallback } from "react";
import { useOnboardingPages } from "@/services/userTypes";
import { Page } from "@/types/onboarding";
import { useAuthStore } from "@/store";

export const useOnboardingLogic = () => {
  const { user } = useAuthStore();
  const [currentPageId, setCurrentPageId] = useState<number>(1);

  const userType = user?.user_types?.[0];
  const {
    data: pagesData,
    isLoading,
    error: queryError,
  } = useOnboardingPages(userType || "");

  const pages: Page[] = useMemo(() => {
    return pagesData?.onboarding_pages || [];
  }, [pagesData?.onboarding_pages]);

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

  return {
    pages,
    currentPage,
    userType,
    isLoading,
    error,
    ...progressInfo,
    ...navigationInfo,
    goToPreviousPage,
    goToNextPage,
  };
};
