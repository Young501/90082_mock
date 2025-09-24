import { useState, useEffect } from "react";

const QUESTIONNAIRE_STORAGE_KEY = "questionnaire_answers_";

export function useQuestionnaireAnswers(opportunityId: string | null) {
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, any>>({});

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
          console.error("Failed to parse stored questionnaire answers:", e);
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

  const updateAnswers = (answers: Record<string, any>) => {
    setQuestionnaireAnswers(answers);
  };

  const clearAnswers = () => {
    if (opportunityId) {
      const storageKey = `${QUESTIONNAIRE_STORAGE_KEY}${opportunityId}`;
      sessionStorage.removeItem(storageKey);
      setQuestionnaireAnswers({});
    }
  };

  return {
    questionnaireAnswers,
    updateAnswers,
    clearAnswers,
  };
}