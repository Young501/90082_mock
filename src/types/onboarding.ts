export type AnswerValue = string | number | string[] | File | undefined;

export type AbnValidationStatus =
  | "idle"
  | "pending"
  | "valid"
  | "invalid"
  | "error";

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
  filter_label?: string;
  type:
    | "text"
    | "select"
    | "url"
    | "multi-select"
    | "file"
    | "location"
    | "number"
    | "range"
    | "textarea"
    | "tag-select"
    | "checkbox-group"
    | "boolean-checkbox"
    | "card-select"
    | "location_geocode_lookup"
    | "abn_lookup"
    | "email";

  required?: boolean;
  icon?: string;
  description?: string;
  options?: string[] | Array<{ label: string; value: string }>;
  option?: string[] | Array<{ label: string; value: string }>;
  max_selection?: number;
  max_selections?: number;
  "max-selection"?: number;
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
