import { Input } from '@chakra-ui/react';
import { Question } from '@/components/onboarding/contexts/OnboardingContext';

type Props = {
    question: Question;
    value: any;
    onChange: (value: any) => void;
};

export const UrlField = ({ question, value, onChange }: Props) => (
  <Input
    id={question.field}
    type="url"
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
  />
);