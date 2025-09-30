import { useState, useEffect, useCallback } from "react";

const QUESTIONNAIRE_STORAGE_KEY = "questionnaire_answers_";

export function useQuestionnaireAnswers(opportunityId: string | null) {
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<
    Record<string, any>
  >({});

  // Load answers from sessionStorage on mount or when opportunityId changes
  useEffect(() => {
    if (opportunityId) {
      const storageKey = `${QUESTIONNAIRE_STORAGE_KEY}${opportunityId}`;
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsedAnswers = JSON.parse(stored);
          setQuestionnaireAnswers(parsedAnswers);
        } catch (e) {
          // Failed to parse stored data, log error and reset to empty state
          console.error(
            "Failed to parse questionnaire answers from sessionStorage:",
            e,
            "Stored value:",
            stored
          );
          setQuestionnaireAnswers({});
        }
      } else {
        setQuestionnaireAnswers({});
      }
    }
  }, [opportunityId]);

  // Save answers to sessionStorage when they change
  useEffect(() => {
    if (opportunityId && Object.keys(questionnaireAnswers).length > 0) {
      const storageKey = `${QUESTIONNAIRE_STORAGE_KEY}${opportunityId}`;
      sessionStorage.setItem(storageKey, JSON.stringify(questionnaireAnswers));
    }
  }, [opportunityId, questionnaireAnswers]);

  const updateAnswers = useCallback((answers: Record<string, any>) => {
    setQuestionnaireAnswers(answers);
  }, []);

  const clearAnswers = useCallback(() => {
    if (opportunityId) {
      const storageKey = `${QUESTIONNAIRE_STORAGE_KEY}${opportunityId}`;
      sessionStorage.removeItem(storageKey);
      setQuestionnaireAnswers({});
    }
  }, [opportunityId]);

  return {
    questionnaireAnswers,
    updateAnswers,
    clearAnswers,
  };
}
