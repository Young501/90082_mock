import {
  Box,
  Grid,
  VStack,
  HStack,
  Text,
  Heading,
  SimpleGrid,
} from "@chakra-ui/react";
import { Page, Question } from "@/types/onboarding";
import { FieldRenderer } from "@/app/(auth)/onboarding/FieldRenderer";
import { UseFormRegister, Control, FieldErrors } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { SkillsPillField, CredentialsCheckboxField } from "@/components/fields";

interface PageTemplateProps {
  page: Page;
  register: UseFormRegister<any>;
  control: Control<any>;
  errors: FieldErrors<any>;
  clearErrors?: (name: string) => void;
  unregister?: (name: string) => void;
  userType?: string;
  onNext?: () => void;
  goToNextPage?: () => void;
  isLastPage?: boolean;
  isLoading?: boolean;
  isFirstPage?: boolean;
  goToPreviousPage?: () => void;
}

interface FieldGroupProps {
  questions: Question[];
  register: UseFormRegister<any>;
  control: Control<any>;
  errors: FieldErrors<any>;
  clearErrors?: (name: string) => void;
  unregister?: (name: string) => void;
  layout?: "vertical" | "horizontal" | "grid" | "card";
  columns?: number;
  spacing?: number;
  title?: string;
  bgColor?: string;
  borderColor?: string;
}

const FieldGroup = ({
  questions,
  register,
  control,
  errors,
  clearErrors,
  unregister,
  layout = "vertical",
  columns = 2,
  spacing = 4,
  title,
  bgColor = "white",
  borderColor = "gray.200",
}: FieldGroupProps) => {
  const renderFields = () => {
    switch (layout) {
      case "horizontal":
        return (
          <HStack gap={spacing} align="start">
            {questions.map((question) => (
              <Box key={question.field} flex="1">
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
          </HStack>
        );

      case "grid":
        return (
          <SimpleGrid columns={columns} gap={spacing}>
            {questions.map((question) => (
              <FieldRenderer
                key={question.field}
                question={question}
                register={register}
                control={control}
                errors={errors}
                clearErrors={clearErrors}
                unregister={unregister}
              />
            ))}
          </SimpleGrid>
        );

      case "card":
        return (
          <Box
            border="1px solid"
            borderColor={borderColor}
            borderRadius="lg"
            p={6}
            bg={bgColor}
            shadow="sm"
          >
            <VStack gap={spacing} align="stretch">
              {questions.map((question) => (
                <FieldRenderer
                  key={question.field}
                  question={question}
                  register={register}
                  control={control}
                  errors={errors}
                  clearErrors={clearErrors}
                  unregister={unregister}
                />
              ))}
            </VStack>
          </Box>
        );

      default:
        return (
          <VStack gap={spacing} align="stretch">
            {questions.map((question) => (
              <FieldRenderer
                key={question.field}
                question={question}
                register={register}
                control={control}
                errors={errors}
                clearErrors={clearErrors}
                unregister={unregister}
              />
            ))}
          </VStack>
        );
    }
  };

  return (
    <Box mb={6}>
      {title && (
        <Heading size="md" mb={2}>
          {title}
        </Heading>
      )}
      {renderFields()}
    </Box>
  );
};

export const DefaultTemplate = ({
  page,
  register,
  control,
  errors,
  clearErrors,
  unregister,
}: PageTemplateProps) => {
  return (
    <VStack gap={6} align="stretch">
      {page.questions.map((question) => (
        <FieldRenderer
          key={question.field}
          question={question}
          register={register}
          control={control}
          errors={errors}
          clearErrors={clearErrors}
          unregister={unregister}
        />
      ))}
    </VStack>
  );
};

export const StudentProfileTemplate = ({
  page,
  register,
  control,
  errors,
  clearErrors,
  unregister,
  onNext,
  isLastPage,
  isLoading,
}: PageTemplateProps) => {
  const leftFields = page.questions.filter((q) =>
    ["first_name", "last_name", "status", "location"].includes(q.field)
  );
  const rightFields = page.questions.filter((q) =>
    ["profile_picture"].includes(q.field)
  );

  return (
    <VStack gap={8} align="stretch" h="100%" w="100%">
      <HStack align="start" gap={12} w="100%" h="100%">
        <VStack flex={1} align="stretch" gap={68} maxW="588px" h="100%">
          <FieldGroup
            questions={leftFields}
            register={register}
            control={control}
            errors={errors}
            clearErrors={clearErrors}
            unregister={unregister}
            layout="vertical"
            spacing={4}
          />
          {/* {onNext && (
            <Box
              display="flex"
              justifyContent="flex-start"
              w="100%"
              h="100%"
              alignSelf="flex-end"
            >
              <Button
                type="button"
                onClick={onNext}
                variant="primary"
                isLoading={isLoading}
                style={{ width: "271px", borderRadius: "0px" }}
              >
                {isLastPage ? "Submit" : "Next"}
              </Button>
            </Box>
          )} */}
        </VStack>

        <VStack flex={1} align="center" gap={6} position="relative" top={-70}>
          <FieldGroup
            questions={rightFields}
            register={register}
            control={control}
            errors={errors}
            clearErrors={clearErrors}
            unregister={unregister}
            layout="vertical"
            spacing={16}
          />
        </VStack>
      </HStack>
    </VStack>
  );
};

export const StudentCourseTemplate = ({
  page,
  register,
  control,
  errors,
  clearErrors,
  unregister,
  onNext,
  isLastPage,
  isLoading,
  isFirstPage,
  goToPreviousPage,
}: PageTemplateProps) => {
  const leftFields = page.questions.filter((q) =>
    ["course_name"].includes(q.field)
  );
  const rightFields = page.questions.filter((q) =>
    ["course_progression"].includes(q.field)
  );

  return (
    <VStack gap={8} align="stretch" h="100%" w="100%">
      <HStack align="start" gap={12} w="100%" h="100%">
        <VStack flex={1} align="stretch" gap={6} maxW="588px" h="100%">
          <FieldGroup
            questions={leftFields}
            register={register}
            control={control}
            errors={errors}
            clearErrors={clearErrors}
            unregister={unregister}
            title="Faculty"
            spacing={6}
          />
        </VStack>

        <VStack flex={1} align="stretch" gap={6} position="relative" top={0}>
          <FieldGroup
            questions={rightFields}
            register={register}
            control={control}
            errors={errors}
            clearErrors={clearErrors}
            unregister={unregister}
            title="Course Progression"
            spacing={6}
          />
        </VStack>
      </HStack>
    </VStack>
  );
};

export const StudentSkillsTemplate = ({
  page,
  register,
  control,
  errors,
  clearErrors,
  unregister,
  onNext,
  isLastPage,
  isLoading,
  isFirstPage,
  goToPreviousPage,
}: PageTemplateProps) => {
  const skillsField = page.questions.find((q) => q.field === "skills");
  const credentialsField = page.questions.find(
    (q) => q.field === "credentials"
  );

  return (
    <VStack gap={8} align="stretch" h="100%" w="100%">
      <VStack gap={6} align="stretch" maxW="588px" h="100%">
        {credentialsField && (
          <Box bg="white">
            <CredentialsCheckboxField
              name={credentialsField.field}
              label={credentialsField.label}
              options={credentialsField.options || []}
              control={control}
              required={credentialsField.required}
            />
          </Box>
        )}

        {skillsField && (
          <Box bg="white">
            <SkillsPillField
              name={skillsField.field}
              label={skillsField.label}
              options={skillsField.options || []}
              control={control}
              allowCustom={skillsField.allow_custom}
              required={skillsField.required}
            />
          </Box>
        )}
      </VStack>
    </VStack>
  );
};

export const StudentDiscoveryTemplate = ({
  page,
  register,
  control,
  errors,
  clearErrors,
  unregister,
  onNext,
  isLastPage,
  isLoading,
  isFirstPage,
  goToPreviousPage,
}: PageTemplateProps) => {
  const fileFields = page.questions.filter((q) => ["resume"].includes(q.field));
  const locationFields = page.questions.filter((q) =>
    ["preferred_location", "within_distance_km"].includes(q.field)
  );
  const socialFields = page.questions.filter((q) =>
    ["homepage", "linkedln", "insta", "bluesky"].includes(q.field)
  );

  const rightSideFields = [...locationFields, ...socialFields];

  return (
    <VStack gap={8} align="stretch" h="100%" w="100%">
      <HStack align="start" gap={12} w="100%" h="100%">
        <VStack flex={1} align="stretch" gap={6} maxW="588px" h="100%">
          <Box
            border="2px dashed"
            borderColor="blue.300"
            borderRadius="lg"
            p={8}
            bg="blue.50"
            textAlign="center"
            minH="300px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {fileFields.length > 0 && (
              <FieldRenderer
                question={fileFields[0]}
                register={register}
                control={control}
                errors={errors}
                clearErrors={clearErrors}
                unregister={unregister}
              />
            )}
          </Box>

          <Box mt={4}>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              It will increase your chances of finding your opportunity if you
              do!
            </Text>
          </Box>
        </VStack>

        <VStack flex={1} align="stretch" gap={6}>
          <FieldGroup
            questions={rightSideFields}
            register={register}
            control={control}
            errors={errors}
            clearErrors={clearErrors}
            unregister={unregister}
            layout="vertical"
            spacing={6}
          />
        </VStack>
      </HStack>
    </VStack>
  );
};

export const PartnerProfileTemplate = ({
  page,
  register,
  control,
  errors,
  clearErrors,
  unregister,
}: PageTemplateProps) => {
  const nameFields = page.questions.filter((q) =>
    ["first_name", "last_name"].includes(q.field)
  );
  const otherFields = page.questions.filter(
    (q) => !["first_name", "last_name"].includes(q.field)
  );

  return (
    <VStack gap={8} align="stretch">
      <FieldGroup
        questions={nameFields}
        register={register}
        control={control}
        errors={errors}
        clearErrors={clearErrors}
        unregister={unregister}
        layout="horizontal"
        title="Personal Information"
        bgColor="gray.50"
        borderColor="gray.300"
      />

      <FieldGroup
        questions={otherFields}
        register={register}
        control={control}
        errors={errors}
        clearErrors={clearErrors}
        unregister={unregister}
        layout="vertical"
        spacing={6}
      />
    </VStack>
  );
};

export const PartnerOrganizationTemplate = ({
  page,
  register,
  control,
  errors,
  clearErrors,
  unregister,
}: PageTemplateProps) => {
  const basicFields = page.questions.filter((q) =>
    ["company_name", "logo", "abn_acn"].includes(q.field)
  );
  const detailsFields = page.questions.filter((q) =>
    ["company_size", "about", "sector", "industry"].includes(q.field)
  );

  return (
    <VStack gap={8} align="stretch">
      <FieldGroup
        questions={basicFields}
        register={register}
        control={control}
        errors={errors}
        clearErrors={clearErrors}
        unregister={unregister}
        layout="card"
        title="Company Information"
        bgColor="blue.50"
        borderColor="blue.200"
      />

      <FieldGroup
        questions={detailsFields}
        register={register}
        control={control}
        errors={errors}
        clearErrors={clearErrors}
        unregister={unregister}
        layout="grid"
        columns={2}
        title="Company Details"
        bgColor="blue.50"
        borderColor="blue.200"
      />
    </VStack>
  );
};

export const PartnerDiscoveryTemplate = ({
  page,
  register,
  control,
  errors,
  clearErrors,
  unregister,
}: PageTemplateProps) => {
  return (
    <VStack gap={8} align="stretch">
      <FieldGroup
        questions={page.questions}
        register={register}
        control={control}
        errors={errors}
        clearErrors={clearErrors}
        unregister={unregister}
        layout="grid"
        columns={2}
        title="Company Social Links"
        bgColor="purple.50"
        borderColor="purple.200"
      />
    </VStack>
  );
};

export const getPageTemplate = (guide: string, userType?: string) => {
  const guideLower = guide.toLowerCase();

  if (userType === "student") {
    if (guideLower.includes("bit about you")) {
      return StudentProfileTemplate;
    }
    if (guideLower.includes("current degree")) {
      return StudentCourseTemplate;
    }
    if (guideLower.includes("skills and credentials")) {
      return StudentSkillsTemplate;
    }
    if (guideLower.includes("help others discover")) {
      return StudentDiscoveryTemplate;
    }
  }

  if (userType === "partner") {
    if (guideLower.includes("bit about you")) {
      return PartnerProfileTemplate;
    }
    if (guideLower.includes("organization")) {
      return PartnerOrganizationTemplate;
    }
    if (guideLower.includes("help others discover")) {
      return PartnerDiscoveryTemplate;
    }
  }

  return DefaultTemplate;
};
