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
  type: 'text' | 'select' | 'url' | 'multi-select' | 'file' | 'location' | 'number';
  required?: boolean;
  options?: string[];
  option?: string[];
  max_selection?: number;
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
  hasAttemptedValidation: boolean;
  fieldErrors: { [field: string]: string[] };
  setAnswer: (_field: string, _value: AnswerValue) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToPage: (_id: number) => void;
  validateCurrentPage: () => ValidationResult;
  setHasAttemptedValidation: (_value: boolean) => void;
  setFieldErrors: (_errors: { [field: string]: string[] }) => void;
  validateField: (_field: string, _value: AnswerValue, _question: Question) => string[];
  getAllQuestionsFromPage: (_page: Page) => Question[];
  findQuestionByField: (_field: string) => Question | undefined;
  getAllQuestionsRecursively: (_questions: Question[]) => Question[];
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

  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [field: string]: string[] }>({});

  const validateField = (field: string, value: AnswerValue, question: Question): string[] => {
    const errors: string[] = [];

    if (question.required &&
        (value === undefined ||
         value === '' ||
         (Array.isArray(value) && value.length === 0))) {
      errors.push('This field is required');
    }

    if (question.type === 'url' && value && typeof value === 'string') {
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        errors.push('URL must start with http:// or https://');
      }
    }

    if (question.type === 'multi-select' && Array.isArray(value) && question.max_selection) {
      if (value.length > question.max_selection) {
        errors.push(`Maximum ${question.max_selection} selections allowed`);
      }
    }

    return errors;
  };

  const getAllQuestionsFromPage = (page: Page): Question[] => {
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

    page.questions.forEach(addQuestion);
    return result;
  };

  const findQuestionByField = (field: string): Question | undefined => {
    const findInQuestions = (questions: Question[]): Question | undefined => {
      for (const q of questions) {
        if (q.field === field) return q;
        if (q.followup_question) {
          for (const followup of Object.values(q.followup_question)) {
            const found = findInQuestions([followup]);
            if (found) return found;
          }
        }
      }
      return undefined;
    };

    return currentPage?.questions ? findInQuestions(currentPage.questions) : undefined;
  };

  const getAllQuestionsRecursively = (questions: Question[]): Question[] => {
    return questions.flatMap(q => {
      let result = [q];
      if (q.followup_question) {
        Object.values(q.followup_question).forEach(followup => {
          result = [...result, ...getAllQuestionsRecursively([followup])];
        });
      }
      return result;
    });
  };

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

  const setAnswer = (field: string, value: string | number | string[] | File | undefined) => {
    setAnswers(prev => ({ ...prev, [field]: value }));

    if (hasAttemptedValidation) {
      const question = findQuestionByField(field);
      if (question) {
        const errors = validateField(field, value, question);
        setFieldErrors(prev => ({ ...prev, [field]: errors }));
      }
    }
  };

  const goToNextPage = () => {
    const page = pages.find(p => p.id === currentPageId);
    if (page?.follow_by) {
      setHasAttemptedValidation(false);
      setFieldErrors({});
      setCurrentPageId(page.follow_by);
    }
  };

  const goToPreviousPage = () => {
    const currentIndex = pages.findIndex(p => p.id === currentPageId);
    if (currentIndex > 0) {
      setHasAttemptedValidation(false);
      setFieldErrors({});
      setCurrentPageId(pages[currentIndex - 1].id);
    }
  };

  const goToPage = (targetId: number) => {
    setCurrentPageId(targetId);
  };

  const validateCurrentPage = (): ValidationResult => {
    if (!currentPage) return { isValid: true, missingFields: [] };

    const allQuestions = getAllQuestionsFromPage(currentPage);

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
    hasAttemptedValidation,
    fieldErrors,
    setAnswer,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    validateCurrentPage,
    setHasAttemptedValidation,
    setFieldErrors,
    validateField,
    getAllQuestionsFromPage,
    findQuestionByField,
    getAllQuestionsRecursively,
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
