import { Box, Text } from "@chakra-ui/react";
import {
  UseFormRegister,
  Control,
  FieldErrors,
  useWatch,
  UseFormSetError,
} from "react-hook-form";
import {
  InputField,
  UrlInputField,
  SelectField,
  FileField,
  ImageUploadField,
  DocumentUploadField,
  CheckboxField,
  BooleanCheckboxField,
  SkillsPillField,
  SliderField,
  CardSelectField,
  TextAreaField,
  GeocodeAutocompleteInput,
  AbnLookupField,
  TaxonomySelectField,
  TaxonomyMultiselectField,
} from "@/components/fields";
import { AbnValidationStatus, Question } from "@/types/onboarding";
import { useMemo, useEffect, useRef, useCallback } from "react";
import { parseQuestionnaireOptions } from "@/utils/questionnaireParser";

interface FieldRendererProps {
  question: Question;
  register: UseFormRegister<any>;
  control: Control<any>;
  errors: FieldErrors<any>;
  setError: UseFormSetError<any>;
  clearErrors?: (name: string) => void;
  unregister?: (name: string) => void;
  onFieldUnregistered?: (fieldName: string) => void;
  onParentValueChange?: (fieldName: string, newValue: any) => void;
  fileUploadKey?: number;
  organisationName?: string;
  onAbnValidationChange?: (status: AbnValidationStatus) => void;
  onFileRemove?: (fieldName: string) => void;
  removedFiles?: Set<string>;
  universitySlug?: string | null;
}

const FILE_FIELD_TYPES: Record<string, "image" | "resume"> = {
  profile_picture: "image",
  resume: "resume",
  logo_url: "image",
};

export const FieldRenderer = ({
  question,
  register,
  control,
  errors,
  setError,
  clearErrors,
  unregister,
  onFieldUnregistered,
  onParentValueChange,
  fileUploadKey,
  organisationName,
  onAbnValidationChange,
  onFileRemove,
  removedFiles,
  universitySlug,
}: FieldRendererProps) => {
  const error = errors[question.field]?.message as string | undefined;
  const taxonomyParentField = question.taxonomy_query?.parent ?? "__none__";
  const taxonomyParentValue = useWatch({
    control,
    name: taxonomyParentField,
  });
  // const fieldOptions = question.options || question.option || [];
  const rawFieldOptions = question.options || question.option || [];
  const fieldOptions = parseQuestionnaireOptions(rawFieldOptions).map(
    (opt) => ({
      label: opt.label || opt.value,
      value: opt.value,
    })
  );

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
  }, [
    fieldValue,
    question,
    clearErrors,
    unregister,
    getAllChildFields,
    onFieldUnregistered,
    onParentValueChange,
  ]);

  const renderField = () => {
    if (question.type === "url") {
      return (
        <UrlInputField
          name={question.field}
          label={question.label}
          control={control}
          error={error}
          required={question.required}
          placeholder={question.placeholder ?? "yourwebsite.com"}
        />
      );
    }

    if (question.type === "text" || question.type === "email") {
      return (
        <InputField
          label={question.label}
          register={register(question.field)}
          error={error}
          required={question.required}
          placeholder={question.placeholder}
          icon={question.icon}
          type={question.type}
        />
      );
    }

    if (question.type === "abn_lookup") {
      return (
        <AbnLookupField
          name={question.field}
          label={question.label}
          control={control}
          required={question.required}
          error={error}
          organisationName={organisationName}
          setError={setError}
          clearErrors={clearErrors}
          onStatusChange={onAbnValidationChange}
          icon={question.icon}
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
          placeholder={question.placeholder ?? "Start typing city or address"}
          label={question.label}
          value={fieldValue}
          icon={question.icon}
          onChange={(value) => {}}
          onSelect={(result) => {}}
        />
      );
    }

    if (question.type === "display") {
      return (
        <InputField
          label={question.filter_label || question.label}
          register={register(question.field)}
          error={error}
          inputProps={{
            readOnly: true,
            bg: "#F4F4F5",
            cursor: "default",
          }}
        />
      );
    }

    if (question.type === "taxonomy-select" && question.taxonomy_query) {
      return (
        <TaxonomySelectField
          name={question.field}
          label={question.label}
          control={control}
          taxonomyQuery={question.taxonomy_query}
          parentValue={
            taxonomyParentField !== "__none__" ? taxonomyParentValue : null
          }
          universitySlug={universitySlug}
          error={error}
          required={question.required}
          filterLabel={question.filter_label}
        />
      );
    }

    if (question.type === "taxonomy-multiselect" && question.taxonomy_query) {
      return (
        <TaxonomyMultiselectField
          name={question.field}
          label={question.label}
          control={control}
          taxonomyQuery={question.taxonomy_query}
          parentValue={
            taxonomyParentField !== "__none__" ? taxonomyParentValue : null
          }
          universitySlug={universitySlug}
          error={error}
          required={question.required}
          maxSelection={question.max_selection}
          filterLabel={question.filter_label}
        />
      );
    }

    if (question.type === "number") {
      const numLabel = question.filter_label || question.label;
      return (
        <InputField
          label={numLabel}
          register={register(question.field)}
          error={error}
          required={question.required}
          type="number"
          placeholder={question.placeholder}
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

    if (question.type === "file-image") {
      return (
        <ImageUploadField
          key={`${question.field}-${fileUploadKey || 0}`}
          name={question.field}
          label={question.label}
          control={control}
          error={error}
          required={question.required}
          description={
            question.field === "profile_picture"
              ? "profile_picture"
              : question.field === "logo_url"
                ? "logo_url"
                : undefined
          }
          onRemove={
            onFileRemove ? () => onFileRemove(question.field) : undefined
          }
        />
      );
    }

    if (question.type === "file-document") {
      return (
        <DocumentUploadField
          key={`${question.field}-${fileUploadKey || 0}`}
          name={question.field}
          label={question.label}
          control={control}
          error={error}
          required={question.required}
          onRemove={
            onFileRemove ? () => onFileRemove(question.field) : undefined
          }
        />
      );
    }

    // if (question.type === "file") {
    //   const fileType = FILE_FIELD_TYPES[question.field] ?? "image";
    //   return (
    //     <FileField
    //       key={`${question.field}-${fileUploadKey || 0}`}
    //       name={question.field}
    //       label={question.label}
    //       control={control}
    //       fileType={fileType}
    //       error={error}
    //       required={question.required}
    //       labelPosition="top"
    //       description={
    //         question.field === "profile_picture" ||
    //         question.field === "logo_url" ||
    //         question.field === "resume"
    //           ? question.field
    //           : undefined
    //       }
    //       onRemove={
    //         onFileRemove ? () => onFileRemove(question.field) : undefined
    //       }
    //     />
    //   );
    // }

    if (question.type === "textarea") {
      return (
        <TextAreaField
          register={register(question.field)}
          error={error}
          required={question.required}
          placeholder={question.placeholder ?? question.label}
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
            setError={setError}
            clearErrors={clearErrors}
            unregister={unregister}
            onFieldUnregistered={onFieldUnregistered}
            onParentValueChange={onParentValueChange}
            fileUploadKey={fileUploadKey}
            organisationName={organisationName}
            onAbnValidationChange={onAbnValidationChange}
            onFileRemove={onFileRemove}
            removedFiles={removedFiles}
          />
        </Box>
      ))}
    </Box>
  );
};
