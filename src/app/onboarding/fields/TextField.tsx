import { Input } from '@chakra-ui/react';
import { FieldProps } from '../FieldRenderer';

export const TextField = ({ question, value, onChange }: FieldProps) => (
  <Input
    id={question.field}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
  />
);