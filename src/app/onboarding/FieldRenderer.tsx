import { Question } from '@/app/onboarding/OnboardingContext';
import { Box, Field } from '@chakra-ui/react';
import { TextField } from './fields/TextField';
import { UrlField } from './fields/UrlField';
import { SelectField } from './fields/SelectField';
import { MultiSelectField } from './fields/MultiSelectField';
import { FileField } from './fields/FileField';

export type FieldProps = {
  question: Question;
  value: string | number | string[] | File | undefined;
  onChange: (_value: string | number | string[] | File) => void;
  allAnswers?: { [field: string]: string | number | string[] | File | undefined };
  onAnswerChange?: (_field: string, _value: string | number | string[] | File | undefined) => void;
};

const FIELD_TYPE_MAP: Record<string, React.FC<FieldProps>> = {
  text: TextField,
  url: UrlField,
  select: SelectField,
  'multi-select': MultiSelectField,
  location:TextField,
  number:TextField,
  file: FileField
};

export const FieldRenderer = (
  { question, value, onChange, allAnswers, onAnswerChange }: FieldProps
) => {
  const Component = FIELD_TYPE_MAP[question.type];

  if (!Component) return null;

  const isInvalid =
    question.required &&
    (value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0));

  const getFollowupQuestions = () => {
    if (!question.followup_question || !value) return [];

    const values = Array.isArray(value) ? value : [value];
    return values
      .map(val => question.followup_question![val as string])
      .filter(Boolean);
  };

  const followupQuestions = getFollowupQuestions();


  return (
    <Box mb={4}>
      <Field.Root id={question.field} invalid={isInvalid}>
        <Field.Label>{question.label}</Field.Label>
        <Component
          question={question}
          value={value}
          onChange={onChange}
          allAnswers={allAnswers}
          onAnswerChange={onAnswerChange}
        />
        {isInvalid && <Field.ErrorText>Field is required</Field.ErrorText>}
      </Field.Root>

      {/* Render followup questions */}
      {followupQuestions.map((followupQuestion) => (
        <Box key={followupQuestion.field} ml={4} mt={2}>
          <FieldRenderer
            question={followupQuestion}
            value={allAnswers?.[followupQuestion.field]}
            onChange={(newValue) => onAnswerChange?.(followupQuestion.field, newValue)}
            allAnswers={allAnswers}
            onAnswerChange={onAnswerChange}
          />
        </Box>
      ))}
    </Box>
  );
};
