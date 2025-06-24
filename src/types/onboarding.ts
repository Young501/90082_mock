export type AnswerValue = string | number | string[] | File | undefined;

export interface AnswerMap {
  [field: string]: AnswerValue;
}

export interface ValidationState {
  hasAttemptedValidation: boolean;
  fieldErrors: Record<string, string[]>;
}

export interface NavigationState {
  currentPageId: number;
  pages: Page[];
  currentPage?: Page;
}

export interface FollowupQuestionMap {
  [selectedOption: string]: Question;
}

export interface Question {
  field: string;
  label: string;
  type:
    | "text"
    | "select"
    | "url"
    | "multi-select"
    | "file"
    | "location"
    | "number"
    | "textarea";
  required?: boolean;
  options?: string[];
  option?: string[];
  max_selection?: number;
  followup_question?: FollowupQuestionMap;
  upload_endpoint?: string;
  is_filter?: boolean;
  allow_custom?: boolean;
  min?: number;
  max?: number;
  unit?: string;
}

export interface Page {
  id: number;
  guide: string;
  questions: Question[];
  follow_by?: number;
}

export interface OnboardingContextType {
  currentPageId: number;
  pages: Page[];
  answers: AnswerMap;
  currentPage?: Page;
  loading: boolean;
  error: string | null;
  hasAttemptedValidation: boolean;
  fieldErrors: Record<string, string[]>;
  setAnswer: (field: string, value: AnswerValue) => void;
  setFieldError: (field: string, errors: string[]) => void;
  goToPreviousPage: () => void;
  handleNext: () => boolean;
  handleSubmit: (
    userType: string,
    token: string
  ) => Promise<{ success: boolean; error?: string }>;
  reset: () => void;
}
