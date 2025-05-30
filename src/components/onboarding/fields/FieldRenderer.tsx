import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Question } from '@/components/onboarding/contexts/OnboardingContext';
import { Box } from '@chakra-ui/react';
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
      <Box mb={4}>
			<FormControl isRequired={question.required}>
				<FormLabel htmlFor={question.field}>{question.label}</FormLabel>
				<Component question={question} value={value} onChange={onChange} />
			</FormControl>
      </Box>
    );
};
