'use client';

import React, { createContext, useContext, useState } from 'react';
import { API_ENDPOINTS } from '@/utils/api';
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
  followup_question?: FollowupQuestionMap;
};

export type Page = {
  id: number;
  guide: string;
  questions: Question[];
  follow_by?: number;
};

type AnswerMap = {
  [field: string]: any;
};

type OnboardingContextType = {
  currentPageId: number;
  pages: Page[];
  answers: AnswerMap;
  currentPage?: Page;
  setAnswer: (field: string, value: any) => void;
  initPages: (pages: Page[]) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToPage: (id: number) => void;
  validateCurrentPage: () => boolean;
  reset: () => void;
  submitAnswers: (userType: string) => Promise<boolean>;
};

// ==== Creat Context ====

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// ==== Provider ====

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [pageStack, setPageStack] = useState<number[]>([]);
  const [currentPageId, setCurrentPageId] = useState<number>(-1);

  const currentPage = pages.find(p => p.id === currentPageId);

  const setAnswer = (field: string, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const initPages = (pages: Page[]) => {
    setPages(pages);
    if (pages.length > 0) setCurrentPageId(pages[0].id);
    setAnswers({});
    setPageStack([]);
  };

  const goToNextPage = () => {
    const page = pages.find(p => p.id === currentPageId);
    if (page?.follow_by) {
      setPageStack(prev => [...prev, currentPageId]);
      setCurrentPageId(page.follow_by);
    }
  };

  const goToPreviousPage = () => {
    setPageStack(prev => {
      const newStack = [...prev];
      const last = newStack.pop();
      if (last !== undefined) setCurrentPageId(last);
      return newStack;
    });
  };

  const goToPage = (targetId: number) => {
    setPageStack(prev => [...prev, currentPageId]);
    setCurrentPageId(targetId);
  };

  const validateCurrentPage = (): boolean => {
        if (!currentPage) return true;

        const missingFields = currentPage.questions.filter((q) => {
            const val = answers[q.field];
            return q.required && (val === undefined || val === '' || (Array.isArray(val) && val.length === 0));
        });

        if (missingFields.length > 0) {
            const fieldLabels = missingFields.map(f => `• ${f.label}`).join('\n');
            alert(`Please fill all required fields:\n\n${fieldLabels}`);
            return false;
        }

        return true;
    };

  const reset = () => {
    setAnswers({});
    setPages([]);
    setPageStack([]);
    setCurrentPageId(-1);
  };

  // used when press sumit button
  const submitAnswers = async (userType: string): Promise<boolean> => {
    if (!token) {
      console.error('No access token found.');
      return false;
    }

    try {
      const res = await fetch(API_ENDPOINTS.ONBOARDING_SUBMISSION(userType), {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Submit failed: ${res.status} - ${text}`);
      }

      return true;
    } catch (err) {
      console.error('Submit error:', err);
      return false;
    }
  };


  const contextValue: OnboardingContextType = {
    currentPageId,
    pages,
    answers,
    currentPage,
    setAnswer,
    initPages,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    validateCurrentPage,
    reset,
    submitAnswers
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
