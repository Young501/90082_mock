import { Question } from "@/types/onboarding";

export interface InviteAcceptRequest {
  token: string;
  questionnaire_answers?: Record<string, any>;
}

export interface InviteAcceptResponse {
  detail: string;
}

export interface Opportunity {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  created_by: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  questionnaire: Record<string, Question[]>;
}

export interface QuestionnaireFormProps {
  questions: Question[];
  onAnswersChange: (answers: Record<string, any>) => void;
}

export type { Question } from "@/types/onboarding";
