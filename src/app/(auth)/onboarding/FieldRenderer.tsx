import { Box, Text } from "@chakra-ui/react";
import {
  UseFormRegister,
  Control,
  FieldErrors,
  useWatch,
  UseFormSetError,
  UseFormSetValue,
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
  setValue?: UseFormSetValue<any>;
  clearErrors?: (name: string) => void;
  unregister?: (name: string) => void;
  onFieldUnregistered?: (fieldName: string) => void;
  fileUploadKey?: number;
  organisationName?: string;
  onAbnValidationChange?: (status: AbnValidationStatus) => void;
  onFileRemove?: (fieldName: string) => void;
  removedFiles?: Set<string>;
  university?: {
    slug?: string;
    name?: string;
  } | null;
  knownFieldNames?: Set<string>;
}

const EMPTY_OPTION_FIELD_TYPES = [
  "select",
  "multi-select",
  "tag-select",
  "checkbox-group",
  "card-select",
] as const;

export const FieldRenderer = ({
  question,
  register,
  control,
  errors,
  setError,
  setValue,
  clearErrors,
  unregister,
  onFieldUnregistered,
  fileUploadKey,
  organisationName,
  onAbnValidationChange,
  onFileRemove,
  removedFiles,
  university,
  knownFieldNames,
}: FieldRendererProps) => {
  const universitySlug = university?.slug;
  const universityName = university?.name;

  const error = errors[question.field]?.message as string | undefined;
  // taxonomy_query.parent is either the name of another question field
  // (dynamic hierarchy — use its current value) or a fixed taxonomy code
  // constant used to scope options (e.g. "teaching_secondary_internship").
  // When knownFieldNames isn't supplied, preserve prior behaviour and treat
  // it as a field reference.
  const taxonomyParentRaw = question.taxonomy_query?.parent ?? "__none__";
  const isTaxonomyParentFieldRef =
    taxonomyParentRaw !== "__none__" &&
    (!knownFieldNames || knownFieldNames.has(taxonomyParentRaw));
  const taxonomyParentField = isTaxonomyParentFieldRef
    ? taxonomyParentRaw
    : "__none__";
  const taxonomyParentValue = useWatch({
    control,
    name: taxonomyParentField,
  });
  const resolvedTaxonomyParentValue =
    taxonomyParentRaw === "__none__"
      ? null
      : isTaxonomyParentFieldRef
        ? taxonomyParentValue
        : taxonomyParentRaw;
  const rawFieldOptions = question.options || question.option || [];
  const fieldOptions = parseQuestionnaireOptions(rawFieldOptions).map(
    (opt) => ({
      label: opt.label || opt.value,
      value: opt.value,
    })
  );

  const previousFieldValue = useRef<any>(undefined);
  const previousTaxonomyParentValue = useRef<any>(undefined);

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
        if (followup.field) fields.push(followup.field);
        fields.push(...getAllChildFields(followup));
      });
    }
    return fields;
  }, []);

  // Clear field value when hidden due to empty options (static option fields)
  useEffect(() => {
    if (
      (EMPTY_OPTION_FIELD_TYPES as readonly string[]).includes(question.type) &&
      fieldOptions.length === 0 &&
      setValue
    ) {
      const emptyValue = question.type === "multi-select" ? [] : "";
      setValue(question.field, emptyValue, { shouldValidate: false });
      clearErrors?.(question.field);
    }
  }, [
    question.type,
    question.field,
    fieldOptions.length,
    setValue,
    clearErrors,
  ]);

  // Clear taxonomy-dependent field value when parent changes
  useEffect(() => {
    if (
      taxonomyParentField === "__none__" ||
      !setValue ||
      (question.type !== "taxonomy-select" &&
        question.type !== "taxonomy-multiselect")
    ) {
      return;
    }
    const prevParent = previousTaxonomyParentValue.current;
    const currParent = taxonomyParentValue;
    if (prevParent !== undefined && prevParent !== currParent) {
      const emptyValue = question.type === "taxonomy-multiselect" ? [] : "";
      setValue(question.field, emptyValue, { shouldValidate: false });
      clearErrors?.(question.field);
    }
    previousTaxonomyParentValue.current = currParent;
  }, [
    taxonomyParentField,
    taxonomyParentValue,
    question.field,
    question.type,
    setValue,
    clearErrors,
  ]);

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
          placeholder={question.placeholder}
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
      // Informative text display (e.g. follow-up notices) — use description as body
      if (question.description) {
        return (
          <Box
            display="flex"
            gap={2}
            alignItems="flex-start"
            px={3}
            py={2}
            borderLeft="3px solid"
            borderColor="#2AA8E0"
            bg="#F8FCFE"
            borderRadius="0 6px 6px 0"
          >
            <Text fontSize="xs" color="#52525B" lineHeight="1.5">
              {question.label && (
                <Text as="span" fontWeight="600" color="#1A6E9E" mr={1}>
                  {question.label}:
                </Text>
              )}
              {question.description}
            </Text>
          </Box>
        );
      }

      const displayValue =
        question.field === "university" && universityName
          ? universityName
          : "—";
      return (
        <Box mb={2}>
          <Text fontSize="sm" fontWeight="500" color="#71717A" mb={1}>
            {question.filter_label || question.label}
          </Text>
          <Box
            h="48px"
            px={6}
            py={3}
            borderRadius="sm"
            border="1px solid"
            borderColor="#E4E4E7"
            bg="#F4F4F5"
            display="flex"
            alignItems="center"
          >
            <Text fontSize="md" color="#3F3F46">
              {displayValue}
            </Text>
          </Box>
        </Box>
      );
    }

    if (question.type === "taxonomy-select" && question.taxonomy_query) {
      return (
        <TaxonomySelectField
          name={question.field}
          label={question.label}
          control={control}
          taxonomyQuery={question.taxonomy_query}
          parentValue={resolvedTaxonomyParentValue}
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
          parentValue={resolvedTaxonomyParentValue}
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
              : question.field === "logo" || question.field === "logo_url"
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

    if (question.type === "textarea") {
      return (
        <TextAreaField
          register={register(question.field)}
          error={error}
          maxLength={question?.max_length}
          required={question.required}
          placeholder={question.placeholder ?? question.label}
          icon={question.icon}
          label={question.label}
        />
      );
    }

    return null;
  };

  const fieldContent = renderField();
  if (!fieldContent && followupQuestions.length === 0) {
    return null;
  }

  return (
    <Box mb={4}>
      {fieldContent}

      {followupQuestions.map((followupQuestion, i) => (
        <Box
          key={followupQuestion.field ?? `followup-${i}`}
          ml={followupQuestion.type === "display" ? 0 : 4}
          mt={2}
        >
          <FieldRenderer
            question={followupQuestion}
            register={register}
            control={control}
            errors={errors}
            setError={setError}
            setValue={setValue}
            clearErrors={clearErrors}
            unregister={unregister}
            onFieldUnregistered={onFieldUnregistered}
            fileUploadKey={fileUploadKey}
            organisationName={organisationName}
            onAbnValidationChange={onAbnValidationChange}
            onFileRemove={onFileRemove}
            removedFiles={removedFiles}
            university={university}
            knownFieldNames={knownFieldNames}
          />
        </Box>
      ))}
    </Box>
  );
};
