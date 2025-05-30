import { Question } from '@/components/onboarding/contexts/OnboardingContext';
import { Field } from '@chakra-ui/react';
import { TextField } from './TextField';
import { UrlField } from './UrlField';
import { SelectField } from './SelectField';
import { MultiSelectField } from './MultiSelectField';

const FIELD_TYPE_MAP: Record<string, React.FC<any>> = {
    text: TextField,
    url: UrlField,
    select: SelectField,
    'multi-select': MultiSelectField,
    location:TextField,
    number:TextField
};

type Props = {
    question: Question;
    value: any;
    onChange: (value: any) => void;
};

export const FieldRenderer = ({ question, value, onChange }: Props) => {

    const Component = FIELD_TYPE_MAP[question.type];

    if (!Component) return null;

    return (
      <Field.Root id={question.field} invalid={question.required && (value === undefined || value === '' || (Array.isArray(value) && value.length === 0))}>
        <Field.Label>{question.label}</Field.Label>
        <Component question={question} value={value} onChange={onChange} />
        <Field.ErrorText>Field is required</Field.ErrorText>
      </Field.Root>
    );
};
