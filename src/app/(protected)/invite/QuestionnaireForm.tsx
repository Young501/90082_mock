import { Box, VStack, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect, useMemo, useRef } from "react";
import { CheckboxField } from "@/components/fields/CheckboxField";
import { QuestionnaireFormProps } from "@/types/invite";

export const QuestionnaireForm = ({
  questions,
  onAnswersChange,
}: QuestionnaireFormProps) => {
  const validationSchema = useMemo(
    () =>
      yup.object().shape(
        questions.reduce(
          (acc, question) => {
            if (question.required) {
              acc[question.field] = yup
                .array()
                .min(1, `${question.question} is required`);
            }
            return acc;
          },
          {} as Record<string, any>
        )
      ),
    [questions]
  );

  const defaultValues = useMemo(
    () =>
      questions.reduce(
        (acc, question) => {
          acc[question.field] = [];
          return acc;
        },
        {} as Record<string, any>
      ),
    [questions]
  );

  const {
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues,
  });

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
          <CheckboxField
            key={question.field}
            name={question.field}
            label={question.question}
            options={question.options || []}
            control={control}
            required={question.required}
          />
        ))}
      </VStack>
    </Box>
  );
};
