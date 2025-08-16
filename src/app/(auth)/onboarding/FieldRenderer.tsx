import { Box } from "@chakra-ui/react";
import {
  UseFormRegister,
  Control,
  FieldErrors,
  useWatch,
} from "react-hook-form";
import {
  InputField,
  SelectField,
  FileField,
  CheckboxField,
  BooleanCheckboxField,
  SkillsPillField,
  SliderField,
  CardSelectField,
  TextAreaField,
  GeocodeAutocompleteInput,
} from "@/components/fields";
import { Question } from "@/types/onboarding";
import { useMemo, useEffect, useRef, useCallback } from "react";
import { parseQuestionnaireOptions } from "@/utils/questionnaireParser";

interface FieldRendererProps {
  question: Question;
  register: UseFormRegister<any>;
  control: Control<any>;
  errors: FieldErrors<any>;
  clearErrors?: (name: string) => void;
  unregister?: (name: string) => void;
  onFieldUnregistered?: (fieldName: string) => void;
  onParentValueChange?: (fieldName: string, newValue: any) => void;
}

const FILE_FIELD_TYPES = {
  profile_picture_url: "image",
  resume_url: "resume",
  logo_url: "image",
} as const;

export const FieldRenderer = ({
  question,
  register,
  control,
  errors,
  clearErrors,
  unregister,
  onFieldUnregistered,
  onParentValueChange,
}: FieldRendererProps) => {
  const error = errors[question.field]?.message as string | undefined;
  // const fieldOptions = question.options || question.option || [];
  const rawFieldOptions = question.options || question.option || [];
  const fieldOptions = parseQuestionnaireOptions(rawFieldOptions).map(opt => ({
    label: opt.label || opt.value,
    value: opt.value,
  }));

  const previousFieldValue = useRef<any>(undefined);

  const fieldValue = useWatch({
    control,
    name: question.field,
  });

  const followupQuestions = useMemo(() => {
    if (!question.followup_question || !fieldValue) return [];

    const values = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
    return values
      .map((val) => {
        const key = typeof val === "boolean" ? val.toString() : (val as string);
        return question.followup_question![key];
      })
      .filter(Boolean);
  }, [question.followup_question, fieldValue]);

  const getAllChildFields = useCallback((q: Question): string[] => {
    const fields: string[] = [];
    if (q.followup_question) {
      Object.values(q.followup_question).forEach((followup) => {
        fields.push(followup.field);
        fields.push(...getAllChildFields(followup));
      });
    }
    return fields;
  }, []);

  useEffect(() => {
    if (!question.followup_question || !clearErrors || !unregister) return;

    const prevValue = previousFieldValue.current;
    const currentValue = fieldValue;

    if (prevValue !== undefined && prevValue !== currentValue) {
      const prevValues = Array.isArray(prevValue) ? prevValue : [prevValue];
      const currentValues = Array.isArray(currentValue)
        ? currentValue
        : [currentValue];

      const removedValues = prevValues.filter(
        (val) => !currentValues.includes(val)
      );

      if (removedValues.length > 0 && onParentValueChange) {
        setTimeout(() => {
          onParentValueChange(question.field, currentValue);
        }, 50);
        return;
      }

      const fieldsToRemove: string[] = [];
      removedValues.forEach((val) => {
        const followup = question.followup_question![val as string];
        if (followup) {
          fieldsToRemove.push(followup.field);
          const childFields = getAllChildFields(followup);
          fieldsToRemove.push(...childFields);
        }
      });

      if (fieldsToRemove.length > 0) {
        const timeoutId = setTimeout(() => {
          fieldsToRemove.forEach((childField) => {
            unregister(childField);
            clearErrors(childField);
            if (onFieldUnregistered) {
              onFieldUnregistered(childField);
            }
          });
        }, 100);

        return () => clearTimeout(timeoutId);
      }
    }

    previousFieldValue.current = currentValue;
  }, [fieldValue, question, clearErrors, unregister, getAllChildFields, onFieldUnregistered, onParentValueChange]);

  const renderField = () => {
    if (
      question.type === "text" ||
      question.type === "location" ||
      question.type === "url"
    ) {
      return (
        <InputField
          register={register(question.field)}
          error={error}
          required={question.required}
          placeholder={`${question.label}`}
          icon={question.icon}
          inputProps={{
            h: "60px",
            borderRadius: "0px",
            border: "1px solid",
            borderColor: "#2CA9DF",
            bg: "white",
            fontSize: "16px",
            px: 6,
          }}
        />
      );
    }

    if (question.type === "location_geocode_lookup") {
      return (
        <GeocodeAutocompleteInput
          name={question.field}
          control={control}
          error={error}
          required={question.required}
          placeholder={question.label}
          label={question.label}
          value={fieldValue}
          icon={question.icon}
          onChange={(value) => {
          }}
          onSelect={(result) => {
          }}
        />
      );
    }

    if (question.type === "number") {
      return (
        <InputField
          label={question.filter_label || question.label}
          register={register(question.field)}
          error={error}
          required={question.required}
          type="number"
          placeholder={`Enter ${question.filter_label || question.label.toLowerCase()}`}
        />
      );
    }

    if (question.type === "range") {
      return (
        <SliderField
          name={question.field}
          label={question.label}
          control={control}
          min={question.min}
          max={question.max}
          unit={question.unit}
          required={question.required}
        />
      );
    }

    if (question.type === "select") {
      return (
        <SelectField
          name={question.field}
          control={control}
          label={question.label}
          options={fieldOptions}
          error={error}
          required={question.required}
        />
      );
    }

    if (question.type === "multi-select") {
      return (
        <SelectField
          name={question.field}
          label={question.label}
          control={control}
          options={fieldOptions}
          error={error}
          required={question.required}
          multiple={true}
          maxSelection={question.max_selection}
        />
      );
    }

    if (question.type === "tag-select") {
      return (
        <SkillsPillField
          name={question.field}
          label={question.label}
          options={fieldOptions}
          control={control}
          allowCustom={question.allow_custom}
          required={question.required}
        />
      );
    }

    if (question.type === "boolean-checkbox") {
      return (
        <BooleanCheckboxField
          name={question.field}
          label={question.label}
          control={control}
          required={question.required}
          description={question.description}
        />
      );
    }

    if (question.type === "checkbox-group") {
      return (
        <CheckboxField
          name={question.field}
          label={question.label}
          options={fieldOptions}
          control={control}
          required={question.required}
          maxSelection={question.max_selection}
        />
      );
    }

    if (question.type === "card-select") {
      return (
        <CardSelectField
          name={question.field}
          label={question.label}
          options={fieldOptions}
          control={control}
          required={question.required}
          maxSelection={question.max_selection}
        />
      );
    }

    if (question.type === "file") {
      const fileType =
        FILE_FIELD_TYPES[question.field as keyof typeof FILE_FIELD_TYPES];
      if (!fileType) {
        return null;
      }
      return (
        <FileField
          name={question.field}
          label={question.label}
          control={control}
          fileType={fileType}
          error={error}
          required={question.required}
          labelPosition="bottom"
          description={
            question.field === "profile_picture_url" ||
            question.field === "logo_url" ||
            question.field === "resume_url"
              ? question.field
              : undefined
          }
        />
      );
    }

    if (question.type === "textarea") {
      return (
        <TextAreaField
          register={register(question.field)}
          error={error}
          required={question.required}
          placeholder={question.label}
          icon={question.icon}
          label={question.label}
        />
      );
    }

    return null;
  };

  return (
    <Box mb={4}>
      {renderField()}

      {followupQuestions.map((followupQuestion) => (
        <Box key={followupQuestion.field} ml={4} mt={2}>
          <FieldRenderer
            question={followupQuestion}
            register={register}
            control={control}
            errors={errors}
            clearErrors={clearErrors}
            unregister={unregister}
            onFieldUnregistered={onFieldUnregistered}
            onParentValueChange={onParentValueChange}
          />
        </Box>
      ))}
    </Box>
  );
};
