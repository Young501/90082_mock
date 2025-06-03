import { Question } from '@/app/onboarding/OnboardingContext';
import { Field } from '@chakra-ui/react';
import { TextField } from './fields/TextField';
import { UrlField } from './fields/UrlField';
import { SelectField } from './fields/SelectField';
import { MultiSelectField } from './fields/MultiSelectField';

export type FieldProps = {
  question: Question;
  value: string | number | string[] | undefined;
  onChange: (_value: string | number | string[]) => void;
};

const FIELD_TYPE_MAP: Record<string, React.FC<FieldProps>> = {
  text: TextField,
  url: UrlField,
  select: SelectField,
  'multi-select': MultiSelectField,
  location:TextField,
  number:TextField
};

export const FieldRenderer = ({ question, value, onChange }: FieldProps) => {

  const Component = FIELD_TYPE_MAP[question.type];

  if (!Component) return null;

  const isInvalid =
    question.required &&
    (value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0));

  return (
    <Field.Root id={question.field} invalid={isInvalid}>
      <Field.Label>{question.label}</Field.Label>
      <Component question={question} value={value} onChange={onChange} />
      {isInvalid && <Field.ErrorText>Field is required</Field.ErrorText>}
    </Field.Root>
  );
};
