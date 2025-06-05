'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS, apiRequest } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';

// ==== Define Type ====

type FollowupQuestionMap = {
  [selectedOption: string]: Question;
};

export type Question = {
  field: string;
  label: string;
  type: 'text' | 'select' | 'url' | 'multi-select';
  required?: boolean;
  options?: string[];
  option?: string[];
  followup_question?: FollowupQuestionMap;
};

export type Page = {
  id: number;
  guide: string;
  questions: Question[];
  follow_by?: number;
};

export type AnswerValue = string | number | string[] | undefined;

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
  const [pages, setPages] = useState<Page[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentPageId, setCurrentPageId] = useState<number>(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const userType = user?.user_types?.[0];
  const currentPage = pages.find(p => p.id === currentPageId);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchPages = async () => {
      if (!isMounted) return;

      if (!userType) {
        console.log('No userType found, redirecting to onboarding start');
        router.push('/onboarding');
        return;
      }

      try {
        const res = await apiRequest({ endpoint: API_ENDPOINTS.ONBOARDING_PAGES(userType) });

        if (!res.ok) {
          const statusText = res.statusText || 'Unknown error';
          throw new Error(`Failed to fetch onboarding steps: ${res.status} ${statusText}`);
        }

        const data = await res.json();
        const fetchedPages: Page[] = data.onboarding_pages;

        setPages(fetchedPages);
        if (fetchedPages.length > 0) {
          setCurrentPageId(fetchedPages[0].id);
        }
        setAnswers({});
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    if (currentPageId === -1) {
      fetchPages();
    } else {
      setLoading(false);
    }
  }, [userType, currentPageId, router, isMounted]);


  const setAnswer = (field: string, value: string | number | string[] | undefined) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const goToNextPage = () => {
    const page = pages.find(p => p.id === currentPageId);
    if (page?.follow_by) {
      setCurrentPageId(page.follow_by);
    }
  };

  const goToPreviousPage = () => {
    const currentIndex = pages.findIndex(p => p.id === currentPageId);
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
        (val === undefined || val === '' || (Array.isArray(val) && val.length === 0));
    });

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };

  const reset = () => {
    setAnswers({});
    setPages([]);
    setCurrentPageId(-1);
  };


  const contextValue: OnboardingContextType = {
    currentPageId,
    pages,
    answers,
    currentPage,
    loading,
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
