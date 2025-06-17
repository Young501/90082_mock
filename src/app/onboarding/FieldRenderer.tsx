import { Question } from "@/app/onboarding/OnboardingContext";
import { Box, Field } from "@chakra-ui/react";
import { TextField } from "./fields/TextField";
import { UrlField } from "./fields/UrlField";
import { SelectField } from "./fields/SelectField";
import { MultiSelectField } from "./fields/MultiSelectField";
import { FileField } from "./fields/FileField";
import { useOnboarding } from "@/app/onboarding/OnboardingContext";

export type FieldProps = {
  question: Question;
  value: string | number | string[] | File | undefined;
  onChange: (_value: string | number | string[] | File) => void;
  allAnswers?: {
    [field: string]: string | number | string[] | File | undefined;
  };
  onAnswerChange?: (
    _field: string,
    _value: string | number | string[] | File | undefined
  ) => void;
};

const FIELD_TYPE_MAP: Record<string, React.FC<FieldProps>> = {
  text: TextField,
  url: UrlField,
  select: SelectField,
  "multi-select": MultiSelectField,
  location: TextField,
  number: TextField,
  file: FileField,
};

export const FieldRenderer = ({
  question,
  value,
  onChange,
  allAnswers,
  onAnswerChange,
}: FieldProps) => {
  const { hasAttemptedValidation, fieldErrors } = useOnboarding();
  const Component = FIELD_TYPE_MAP[question.type];

  if (!Component) return null;

  const currentErrors = fieldErrors[question.field] || [];
  const shouldShowErrors = hasAttemptedValidation && currentErrors.length > 0;

  const getFollowupQuestions = () => {
    if (!question.followup_question || !value) return [];

    const values = Array.isArray(value) ? value : [value];
    return values
      .map((val) => question.followup_question![val as string])
      .filter(Boolean);
  };

  const followupQuestions = getFollowupQuestions();

  return (
    <Box mb={4}>
      <Field.Root id={question.field} invalid={shouldShowErrors}>
        <Field.Label>
          {question.label}
          {question.required && (
            <span style={{ color: "red", marginLeft: "4px" }}>*</span>
          )}
        </Field.Label>
        <Component
          question={question}
          value={value}
          onChange={onChange}
          allAnswers={allAnswers}
          onAnswerChange={onAnswerChange}
        />
        {shouldShowErrors && (
          <Field.ErrorText>
            {currentErrors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </Field.ErrorText>
        )}
      </Field.Root>

      {/* Render followup questions */}
      {followupQuestions.map((followupQuestion) => (
        <Box key={followupQuestion.field} ml={4} mt={2}>
          <FieldRenderer
            question={followupQuestion}
            value={allAnswers?.[followupQuestion.field]}
            onChange={(newValue) =>
              onAnswerChange?.(followupQuestion.field, newValue)
            }
            allAnswers={allAnswers}
            onAnswerChange={onAnswerChange}
          />
        </Box>
      ))}
    </Box>
  );
};
