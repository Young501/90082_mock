'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingPages, useAuth } from '@/api';

// ==== Define Type ====

type FollowupQuestionMap = {
  [selectedOption: string]: Question;
};

export type Question = {
  field: string;
  label: string;
  type: 'text' | 'select' | 'url' | 'multi-select' | 'file';
  required?: boolean;
  options?: string[];
  option?: string[];
  followup_question?: FollowupQuestionMap;
  upload_endpoint?: string;
};

export type Page = {
  id: number;
  guide: string;
  questions: Question[];
  follow_by?: number;
};

export type AnswerValue = string | number | string[] | File | undefined;

type AnswerMap = {
  [field: string]: AnswerValue;
};

export type ValidationResult = {
  isValid: boolean;
  missingFields: Question[];
};

type OnboardingContextType = {
  currentPageId: number;
  pages: Page[];
  answers: AnswerMap;
  currentPage?: Page;
  loading: boolean;
  error: string | null;
  setAnswer: (_field: string, _value: AnswerValue) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToPage: (_id: number) => void;
  validateCurrentPage: () => ValidationResult;
  reset: () => void;
};

// ==== Creat Context ====

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// ==== Provider ====

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentPageId, setCurrentPageId] = useState<number>(-1);
  const [isMounted, setIsMounted] = useState(false);

  const userType = user?.user_types?.[0];
  const { 
    data: pagesData, 
    isLoading, 
    error: queryError 
  } = useOnboardingPages(userType || '');
  
  const pages = pagesData?.onboarding_pages || [];
  const currentPage = pages.find((p: Page) => p.id === currentPageId);
  const error = queryError?.message || null;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!userType) {
      console.log('No userType found, redirecting to onboarding start');
      router.push('/onboarding');
      return;
    }

    if (pages.length > 0 && currentPageId === -1) {
      setCurrentPageId(pages[0].id);
      setAnswers({});
    }
  }, [userType, pages, currentPageId, router, isMounted]);

  const setAnswer = (field: string, value: string | number | string[] | File | undefined) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const goToNextPage = () => {
    const page = pages.find((p: Page) => p.id === currentPageId);
    if (page?.follow_by) {
      setCurrentPageId(page.follow_by);
    }
  };

  const goToPreviousPage = () => {
    const currentIndex = pages.findIndex((p: Page) => p.id === currentPageId);
    if (currentIndex > 0) {
      setCurrentPageId(pages[currentIndex - 1].id);
    }
  };

  const goToPage = (targetId: number) => {
    setCurrentPageId(targetId);
  };

  const validateCurrentPage = (): ValidationResult => {
    if (!currentPage) return { isValid: true, missingFields: [] };

    const getAllQuestionsToValidate = (questions: Question[]): Question[] => {
      const result: Question[] = [];

      const addQuestion = (q: Question) => {
        result.push(q);

        if (q.followup_question && answers[q.field]) {
          const values = Array.isArray(answers[q.field])
            ? answers[q.field] as string[] : [answers[q.field] as string];

          values.forEach(val => {
            const followup = q.followup_question![val];
            if (followup) addQuestion(followup);
          });
        }
      };

      questions.forEach(addQuestion);
      return result;
    };

    const allQuestions = getAllQuestionsToValidate(currentPage.questions);

    const missingFields = allQuestions.filter((q) => {
      const val = answers[q.field];
      return q.required &&
        (val === undefined ||
         val === '' ||
         (Array.isArray(val) && val.length === 0) ||
         (val instanceof File && !val));;
    });

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };

  const reset = () => {
    setAnswers({});
    setCurrentPageId(-1);
  };

  const contextValue: OnboardingContextType = {
    currentPageId,
    pages,
    answers,
    currentPage,
    loading: isLoading,
    error,
    setAnswer,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    validateCurrentPage,
    reset
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return ctx;
};
