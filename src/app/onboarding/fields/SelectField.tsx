import { Portal, Select, createListCollection } from "@chakra-ui/react";
import { FieldProps } from "../FieldRenderer";

export const SelectField = ({ question, value, onChange }: FieldProps) => {
  const options = (question.options || question.option || []).map(
    (o: string) => ({
      label: o,
      value: o,
    })
  );

  const collection = createListCollection({ items: options });

  return (
    <Select.Root
      collection={collection}
      value={value === undefined ? [] : [String(value)]}
      onValueChange={(details) => onChange(details.value[0])}
      multiple={false}
      width="100%"
      size="md"
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="-- Select an option --" />
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
