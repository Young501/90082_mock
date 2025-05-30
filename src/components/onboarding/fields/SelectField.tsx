import { Select } from '@chakra-ui/select';
import { Question } from '@/components/onboarding/contexts/OnboardingContext';

type Props = {
  question: Question;
  value: any;
  onChange: (value: any) => void;
};

export const SelectField = ({ question, value, onChange }: Props) => {
  const options = question.options || (question as any).option || [];

  return (
    <Select
      id={question.field}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled hidden>
        -- Select an option --
      </option>

      {options.map((opt: string) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </Select>
  );
};
