export interface QuestionnaireOption {
  value: string;
  label: string;
}

export interface ParsedQuestion {
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
    | "location_geocode_lookup";
  options?: QuestionnaireOption[];
  required?: boolean;
  is_filter?: boolean;
  max_selection?: number;
  [key: string]: any;
}

export function parseQuestionnaireOptions(options: any[]): QuestionnaireOption[] {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.map((option) => {
    if (typeof option === "string") {
      return {
        value: option,
        label: option,
      };
    }

    if (typeof option === "object" && option !== null) {
      if (option.value && option.label) {
        return {
          value: option.value,
          label: option.label,
        };
      }
      if (option.value) {
        return {
          value: option.value,
          label: option.value,
        };
      }
      if (option.label) {
        return {
          value: option.label,
          label: option.label,
        };
      }
    }

    const stringValue = String(option);
    return {
      value: stringValue,
      label: stringValue,
    };
  });
}

export function parseQuestion(question: any): ParsedQuestion {
  const parsed: ParsedQuestion = {
    field: question.field,
    label: question.label,
    type: question.type,
    required: question.required,
    is_filter: question.is_filter,
    max_selection: question.max_selection,
  };

  if (question.filter_label) {
    parsed.filter_label = question.filter_label;
  }

  if (question.options || question.option) {
    const options = question.options || question.option;
    parsed.options = parseQuestionnaireOptions(options);
  }

  Object.keys(question).forEach((key) => {
    if (!["field", "label", "filter_label", "type", "options", "option", "required", "is_filter", "max_selection"].includes(key)) {
      parsed[key] = question[key];
    }
  });

  return parsed;
}

export function parseFlatQuestionnaire(questionnaire: Record<string, any[]>): Record<string, ParsedQuestion[]> {
  const parsed: Record<string, ParsedQuestion[]> = {};

  Object.keys(questionnaire).forEach((userType) => {
    if (Array.isArray(questionnaire[userType])) {
      parsed[userType] = questionnaire[userType].map(parseQuestion);
    }
  });

  return parsed;
}

export function parseNestedQuestionnaire(onboardingData: any): ParsedQuestion[] {
  const parsed: ParsedQuestion[] = [];

  if (onboardingData?.onboarding_pages && Array.isArray(onboardingData.onboarding_pages)) {
    onboardingData.onboarding_pages.forEach((page: any) => {
      if (page.questions && Array.isArray(page.questions)) {
        page.questions.forEach((question: any) => {
          parsed.push(parseQuestion(question));
        });
      }
    });
  }

  return parsed;
}

export function getDisplayLabel(question: ParsedQuestion | { label: string; filter_label?: string }, isFilter: boolean = false): string {
  if (isFilter && question.filter_label) {
    return question.filter_label;
  }
  return question.label;
}
