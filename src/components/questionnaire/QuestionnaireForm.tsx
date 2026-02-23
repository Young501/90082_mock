import { Box, VStack, Heading, Text, HStack } from "@chakra-ui/react";
import { useForm, useWatch } from "react-hook-form";
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

export interface QuestionnaireSection {
  id: number;
  title: string;
  questions: Question[];
  title_icon?: string;
}

export interface QuestionnaireFormProps {
  sections: QuestionnaireSection[];
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
>(({ sections, onAnswersChange, initialValues = {} }, ref) => {
  const allQuestions = useMemo(
    () => sections.flatMap((section) => section.questions),
    [sections]
  );

  const validationSchema = useMemo(
    () => createPageSchema(allQuestions),
    [allQuestions]
  );

  const defaultValues = useMemo(
    () =>
      allQuestions.reduce(
        (acc, question) => {
          if (initialValues[question.field] !== undefined) {
            acc[question.field] = initialValues[question.field];
          } else {
            switch (question.type) {
              case "taxonomy-multiselect":
                acc[question.field] = [];
                break;
              case "taxonomy-select":
                acc[question.field] = "";
                break;
              case "textarea":
                acc[question.field] = "";
                break;
              default:
                acc[question.field] = undefined;
            }
          }
          return acc;
        },
        {} as Record<string, any>
      ),
    [allQuestions, initialValues]
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
    setError,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues,
    mode: "onChange",
  });

  const previousValuesRef = useRef<string>("");
  const isInitialRender = useRef(true);

  // Reset form when initialValues change (e.g., when navigating back from review with saved answers)
  useEffect(() => {
    if (Object.keys(initialValues).length === 0) {
      return;
    }
    const currentValues = getValues();
    const currentValuesString = JSON.stringify(currentValues);
    const defaultValuesString = JSON.stringify(defaultValues);
    if (currentValuesString !== defaultValuesString) {
      reset(defaultValues);
    }
  }, [initialValues, defaultValues, reset, getValues]);

  useEffect(() => {
    const subscription = watch((values) => {
      const currentValuesString = JSON.stringify(values);
      if (isInitialRender.current) {
        isInitialRender.current = false;
        previousValuesRef.current = currentValuesString;
        return;
      }
      if (currentValuesString !== previousValuesRef.current) {
        previousValuesRef.current = currentValuesString;
        onAnswersChange(values);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onAnswersChange]);

  const organisationName = useWatch({
    control,
    name: "name",
  });

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
    <Box
      border="1px solid #E4E4E7"
      borderRadius="3xl"
      p={{ base: 4, md: 8 }}
      bg="white"
    >
      <VStack gap={4} align="stretch">
        {sections.map((section) => (
          <Box key={section.id}>
            <Box mb={4}>
              <HStack gap={2}>
                {section.title_icon && (
                  <Text fontSize="lg">
                    <i className={section.title_icon} />
                  </Text>
                )}
                <Heading fontSize="lg" fontWeight="600" color="#18181B">
                  {section.title}
                </Heading>
              </HStack>
            </Box>
            <VStack gap={2} align="stretch">
              {section.questions.map((question, index) => (
                <Box key={`${question.field}-${index}`}>
                  <FieldRenderer
                    question={question}
                    register={register}
                    control={control}
                    errors={errors}
                    setError={setError}
                    clearErrors={clearErrors}
                    unregister={unregister}
                    onFieldUnregistered={handleFieldUnregistered}
                    organisationName={organisationName}
                  />
                </Box>
              ))}
            </VStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
});

QuestionnaireForm.displayName = "QuestionnaireForm";
