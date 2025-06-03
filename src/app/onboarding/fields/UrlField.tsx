import { Input } from '@chakra-ui/react';
import { FieldProps } from '../FieldRenderer';

export const UrlField = ({ question, value, onChange }: FieldProps) => (
  <Input
    id={question.field}
    type="url"
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
  />
);