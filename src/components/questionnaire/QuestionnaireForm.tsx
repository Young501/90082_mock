import { Box, VStack } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  useEffect,
  useMemo,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import { createPageSchema } from "@/utils/validationSchemas";
import { FieldRenderer } from "@/app/(auth)/onboarding/FieldRenderer";
import { Question } from "@/types/onboarding";

export interface QuestionnaireFormProps {
  questions: Question[];
  onAnswersChange: (answers: Record<string, any>) => void;
  initialValues?: Record<string, any>;
}

export interface QuestionnaireFormRef {
  validate: () => Promise<boolean>;
  getValues: () => Record<string, any>;
}

export const QuestionnaireForm = forwardRef<
  QuestionnaireFormRef,
  QuestionnaireFormProps
>(({ questions, onAnswersChange, initialValues = {} }, ref) => {
  const validationSchema = useMemo(
    () => createPageSchema(questions),
    [questions]
  );

  const defaultValues = useMemo(
    () =>
      questions.reduce(
        (acc, question) => {
          // Use initial value if available, otherwise use default
          if (initialValues[question.field] !== undefined) {
            acc[question.field] = initialValues[question.field];
          } else {
            switch (question.type) {
              case "multi-select":
              case "tag-select":
                acc[question.field] = [];
                break;
              case "checkbox-group":
                acc[question.field] = question.max_selection === 1 ? "" : [];
                break;
              case "card-select":
                acc[question.field] = question.max_selection === 1 ? "" : [];
                break;
              case "boolean-checkbox":
                acc[question.field] = undefined;
                break;
              case "range":
                acc[question.field] =
                  question.min !== undefined ? question.min : 0;
                break;
              default:
                acc[question.field] = "";
            }
          }
          return acc;
        },
        {} as Record<string, any>
      ),
    [questions, initialValues]
  );

  const {
    register,
    control,
    watch,
    formState: { errors },
    trigger,
    getValues,
    clearErrors,
    unregister,
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues,
    mode: "onChange",
  });

  const watchedValues = watch();
  const previousValuesRef = useRef<string>("");
  const isInitialRender = useRef(true);

  // Reset form when initialValues change (e.g., when navigating back from review with saved answers)
  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      reset(defaultValues);
    }
  }, [initialValues, defaultValues, reset]);

  useEffect(() => {
    const currentValuesString = JSON.stringify(watchedValues);

    // Skip the first render to avoid triggering with initial values
    if (isInitialRender.current) {
      isInitialRender.current = false;
      previousValuesRef.current = currentValuesString;
      return;
    }

    // Only call onAnswersChange if values actually changed
    if (currentValuesString !== previousValuesRef.current) {
      previousValuesRef.current = currentValuesString;
      onAnswersChange(watchedValues);
    }
  }, [watchedValues, onAnswersChange]);

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const result = await trigger();
      return result;
    },
    getValues: () => {
      return getValues();
    },
  }));

  const handleFieldUnregistered = (fieldName: string) => {
    const currentValues = getValues();
    const { [fieldName]: _, ...restValues } = currentValues;
    onAnswersChange(restValues);
  };

  return (
    <Box>
      <VStack gap={6} align="stretch">
        {questions.map((question, index) => (
          <Box key={`${question.field}-${index}`}>
            <FieldRenderer
              question={question}
              register={register}
              control={control}
              errors={errors}
              clearErrors={clearErrors}
              unregister={unregister}
              onFieldUnregistered={handleFieldUnregistered}
            />
          </Box>
        ))}
      </VStack>
    </Box>
  );
});

QuestionnaireForm.displayName = "QuestionnaireForm";
