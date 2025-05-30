import { Input } from '@chakra-ui/react';
import { Question } from '@/components/onboarding/contexts/OnboardingContext';

type Props = {
    question: Question;
    value: any;
    onChange: (value: any) => void;
};

export const TextField = ({ question, value, onChange }: Props) => (
  <Input
    id={question.field}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
  />
);