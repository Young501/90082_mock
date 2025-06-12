import { Input } from '@chakra-ui/react';
import { FieldProps } from '../FieldRenderer';

export const UrlField = ({ question, value, onChange }: FieldProps) => {
  const stringValue = typeof value === 'string' ? value : '';

  return (
    <Input
      id={question.field}
      type="url"
      value={stringValue}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};