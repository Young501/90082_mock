'use client';

import { Portal, Select, createListCollection } from '@chakra-ui/react';
import { FieldProps } from '../FieldRenderer';

export const MultiSelectField = ({ question, value, onChange }: FieldProps) => {
  const options = (question.options || question.option || []).map((o: string) => ({
    label: o,
    value: o,
  }));

  const collection = createListCollection({
    items: options,
  });

  return (
    <Select.Root
      multiple
      collection={collection}
      value={
        Array.isArray(value)
          ? value
          : value !== undefined
            ? [String(value)]
            : undefined
      }
      onValueChange={details => onChange(details.value)}
      width="100%"
      size="md"
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="Select option(s)" />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {options.map((opt) => (
              <Select.Item item={opt} key={opt.value}>
                {opt.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
};
