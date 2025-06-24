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

interface PageTemplateProps {
  page: Page;
  register: UseFormRegister<any>;
  control: Control<any>;
  errors: FieldErrors<any>;
  clearErrors?: (name: string) => void;
  unregister?: (name: string) => void;
  userType?: string;
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
          <HStack spacing={spacing} align="start">
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
          <SimpleGrid columns={columns} spacing={spacing}>
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
            <VStack spacing={spacing} align="stretch">
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
          <VStack spacing={spacing} align="stretch">
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
    <VStack spacing={6} align="stretch">
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
}: PageTemplateProps) => {
  const leftFields = page.questions.filter((q) =>
    ["first_name", "last_name", "status"].includes(q.field)
  );
  const rightFields = page.questions.filter((q) =>
    ["profile_picture", "location"].includes(q.field)
  );

  return (
    <HStack align="start" spacing={12} w="100%">
      <VStack flex={1} align="stretch" spacing={6}>
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
      </VStack>
      <VStack flex={1} align="center" spacing={6}>
        <FieldGroup
          questions={rightFields}
          register={register}
          control={control}
          errors={errors}
          clearErrors={clearErrors}
          unregister={unregister}
          layout="vertical"
          spacing={4}
        />
      </VStack>
    </HStack>
  );
};

export const StudentCourseTemplate = ({
  page,
  register,
  control,
  errors,
  clearErrors,
  unregister,
}: PageTemplateProps) => {
  return (
    <VStack spacing={8} align="stretch">
      <FieldGroup
        questions={page.questions}
        register={register}
        control={control}
        errors={errors}
        clearErrors={clearErrors}
        unregister={unregister}
        layout="card"
        title="Academic Information"
        bgColor="blue.50"
        borderColor="blue.200"
        spacing={6}
      />
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
}: PageTemplateProps) => {
  const skillsField = page.questions.find((q) => q.field === "skills");
  const credentialsField = page.questions.find(
    (q) => q.field === "credentials"
  );

  return (
    <VStack spacing={8} align="stretch">
      {skillsField && (
        <FieldGroup
          questions={[skillsField]}
          register={register}
          control={control}
          errors={errors}
          clearErrors={clearErrors}
          unregister={unregister}
          layout="card"
          title="Skills & Experience"
          bgColor="green.50"
          borderColor="green.200"
        />
      )}

      {credentialsField && (
        <FieldGroup
          questions={[credentialsField]}
          register={register}
          control={control}
          errors={errors}
          clearErrors={clearErrors}
          unregister={unregister}
          layout="card"
          title="Certifications"
          bgColor="green.50"
          borderColor="green.200"
        />
      )}
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
}: PageTemplateProps) => {
  const locationFields = page.questions.filter((q) =>
    ["preferred_location", "within_distance_km"].includes(q.field)
  );
  const fileFields = page.questions.filter((q) => ["resume"].includes(q.field));
  const socialFields = page.questions.filter((q) =>
    ["homepage", "linkedln", "insta", "bluesky"].includes(q.field)
  );

  return (
    <VStack spacing={8} align="stretch">
      {locationFields.length > 0 && (
        <FieldGroup
          questions={locationFields}
          register={register}
          control={control}
          errors={errors}
          clearErrors={clearErrors}
          unregister={unregister}
          layout="card"
          title="Location Preferences"
          bgColor="purple.50"
          borderColor="purple.200"
        />
      )}

      {fileFields.length > 0 && (
        <FieldGroup
          questions={fileFields}
          register={register}
          control={control}
          errors={errors}
          clearErrors={clearErrors}
          unregister={unregister}
          layout="card"
          title="Documents"
          bgColor="orange.50"
          borderColor="orange.200"
        />
      )}

      {socialFields.length > 0 && (
        <FieldGroup
          questions={socialFields}
          register={register}
          control={control}
          errors={errors}
          clearErrors={clearErrors}
          unregister={unregister}
          layout="grid"
          columns={2}
          title="Social Links"
          bgColor="teal.50"
          borderColor="teal.200"
        />
      )}
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
    <VStack spacing={8} align="stretch">
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
    <VStack spacing={8} align="stretch">
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
    <VStack spacing={8} align="stretch">
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
