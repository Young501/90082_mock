import { Question } from "@/types/onboarding";

export interface QuestionnaireOption {
  value: string;
  label: string;
}

export function parseQuestionnaireOptions(
  options: any[]
): QuestionnaireOption[] {
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

export function flattenQuestions(questions: Question[]): Question[] {
  return questions.flatMap((q) => [
    q,
    ...flattenQuestions(Object.values(q.followup_question ?? {})),
  ]);
}

export function getDisplayLabel(
  question: Question | { label: string; filter_label?: string },
  isFilter: boolean = false
): string {
  if (isFilter && question.filter_label) {
    return question.filter_label;
  }
  return question.label;
}
