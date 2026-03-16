import { Question } from "@/types/onboarding";
export interface QuestionnaireSection {
  id: number;
  title: string;
  questions: Question[];
  title_icon?: string;
}

export const getQuestionnaireKey = (
  type: string | undefined
): string | undefined => {
  if (!type) return undefined;
  if (type === "student") return "student_opportunity_questionnaire";
  if (type === "organisation") return "organisation_opportunity_questionnaire";
  return undefined;
};

export const getQuestionnaireSections = (
  questionnaire: any,
  userType: string | undefined
): QuestionnaireSection[] => {
  if (!questionnaire) return [];
  const questionnaireKey = getQuestionnaireKey(userType);
  if (!questionnaireKey) return [];
  const questionnaireData = questionnaire[questionnaireKey];
  return Array.isArray(questionnaireData)
    ? (questionnaireData as unknown as QuestionnaireSection[])
    : [];
};
