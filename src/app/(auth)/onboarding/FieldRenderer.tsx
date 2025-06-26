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
  SkillsPillField,
  SliderField,
  CardSelectField,
} from "@/components/fields";
import { Question } from "@/types/onboarding";
import { useMemo, useEffect, useRef, useCallback } from "react";

interface FieldRendererProps {
  question: Question;
  register: UseFormRegister<any>;
  control: Control<any>;
  errors: FieldErrors<any>;
  clearErrors?: (name: string) => void;
  unregister?: (name: string) => void;
}

const FILE_FIELD_TYPES = {
  profile_picture: "image",
  resume: "resume",
  logo: "image",
} as const;

export const FieldRenderer = ({
  question,
  register,
  control,
  errors,
  clearErrors,
  unregister,
}: FieldRendererProps) => {
  const error = errors[question.field]?.message as string | undefined;
  const fieldOptions = question.options || question.option || [];

  const previousFieldValue = useRef<any>(undefined);

  const fieldValue = useWatch({
    control,
    name: question.field,
  });

  const followupQuestions = useMemo(() => {
    if (!question.followup_question || !fieldValue) return [];

    const values = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
    return values
      .map((val) => question.followup_question![val as string])
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
      const allChildFields = getAllChildFields(question);

      const timeoutId = setTimeout(() => {
        allChildFields.forEach((childField) => {
          unregister(childField);
          clearErrors(childField);
        });
      }, 0);

      return () => clearTimeout(timeoutId);
    }

    previousFieldValue.current = currentValue;
  }, [fieldValue, question, clearErrors, unregister, getAllChildFields]);

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
          placeholder={`Enter ${question.label.toLowerCase()}`}
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

    if (question.type === "number") {
      if (question.min !== undefined && question.max !== undefined) {
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

      return (
        <InputField
          label={question.label}
          register={register(question.field)}
          error={error}
          required={question.required}
          type="number"
          placeholder={`Enter ${question.label.toLowerCase()}`}
        />
      );
    }

    // if (question.type === "url") {
    //   return (
    //     <InputField
    //       label={question.label}
    //       register={register(question.field)}
    //       error={error}
    //       required={question.required}
    //       type="url"
    //       placeholder="https://example.com"
    //     />
    //   );
    // }

    if (question.type === "select") {
      return (
        <SelectField
          name={question.field}
          control={control}
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

    if (question.type === "checkbox-group") {
      return (
        <CheckboxField
          name={question.field}
          label={question.label}
          options={fieldOptions}
          control={control}
          required={question.required}
          maxSelections={question.max_selections || question["max-selection"]}
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
          maxSelections={question.max_selections}
        />
      );
    }

    if (question.type === "file") {
      const fileType =
        FILE_FIELD_TYPES[question.field as keyof typeof FILE_FIELD_TYPES];
      if (!fileType) {
        console.error(
          `File field '${question.field}' is not defined in FILE_FIELD_TYPES`
        );
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
            question.field === "profile_picture" ||
            question.field === "logo" ||
            question.field === "resume"
              ? question.field
              : undefined
          }
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
          />
        </Box>
      ))}
    </Box>
  );
};
