import { Select as ChakraReactSelect } from 'chakra-react-select';
import { Question } from '@/components/onboarding/contexts/OnboardingContext';

type Props = {
    question: Question;
    value: any;
    onChange: (value: any) => void;
};

export const MultiSelectField = ({ question, value, onChange }: Props) => {
  const options = question.options || (question as any).option || [];
  return (
    <ChakraReactSelect
      inputId={question.field}
      isMulti
      options={options.map((o: string) => ({ label: o, value: o }))}
      value={(value || []).map((v: string) => ({ label: v, value: v }))}
      onChange={(selected) => {
        const arr = Array.isArray(selected) ? selected.map((s) => s.value) : [];
        onChange(arr);
      }}
    />
  );
};