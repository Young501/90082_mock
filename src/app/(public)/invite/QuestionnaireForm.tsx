import { Box, VStack, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  useEffect,
  useMemo,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { createPageSchema } from "@/utils/validationSchemas"; // Reuse existing schema creation function
import { FieldRenderer } from "@/app/(auth)/onboarding/FieldRenderer";
import { QuestionnaireFormProps } from "@/types/invite";

export interface QuestionnaireFormRef {
  validate: () => Promise<boolean>;
  getValues: () => Record<string, any>;
}

export const QuestionnaireForm = forwardRef<
  QuestionnaireFormRef,
  QuestionnaireFormProps
>(({ questions, onAnswersChange }, ref) => {
  const validationSchema = useMemo(
    () => createPageSchema(questions),
    [questions]
  );

  const defaultValues = useMemo(
    () =>
      questions.reduce(
        (acc, question) => {
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
            case "number":
              acc[question.field] = undefined;
              break;
            default:
              acc[question.field] = "";
          }
          return acc;
        },
        {} as Record<string, any>
      ),
    [questions]
  );

  const {
    register,
    control,
    watch,
    trigger,
    getValues,
    formState: { errors },
    clearErrors,
    unregister,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues,
  });

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const result = await trigger();
      return result;
    },
    getValues: () => getValues(),
  }));

  const watchedValues = watch();
  const previousValuesRef = useRef<Record<string, any>>({});

  useEffect(() => {
    const hasChanged =
      JSON.stringify(previousValuesRef.current) !==
      JSON.stringify(watchedValues);

    if (hasChanged) {
      previousValuesRef.current = watchedValues;
      onAnswersChange(watchedValues);
    }
  }, [watchedValues, onAnswersChange]);

  if (questions.length === 0) {
    return null;
  }

  return (
    <Box
      w="100%"
      bg="blue.50"
      borderRadius="16px"
      p={{ base: 6, md: 8 }}
      border="1px solid"
      borderColor="blue.200"
    >
      <VStack gap={{ base: 4, md: 6 }} align="start">
        <Text
          fontSize={{ base: "18px", md: "20px", lg: "24px" }}
          fontWeight="600"
          color="black"
          lineHeight="1.3"
        >
          Please answer the following questions:
        </Text>

        {questions.map((question) => (
          <Box key={question.field} w="100%">
            <FieldRenderer
              question={question}
              register={register}
              control={control}
              errors={errors}
              clearErrors={clearErrors}
              unregister={unregister}
            />
          </Box>
        ))}
      </VStack>
    </Box>
  );
});

QuestionnaireForm.displayName = "QuestionnaireForm";
