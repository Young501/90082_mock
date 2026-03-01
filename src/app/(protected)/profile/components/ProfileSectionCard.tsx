"use client";

import { Box, Text, Heading, Flex, HStack, Tag } from "@chakra-ui/react";
import { PenLine, FileText, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { Page, Question } from "@/types/onboarding";
import { formatAnswerForDisplay } from "@/utils/formatAnswer";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { useTaxonomyLabels } from "@/hooks/useTaxonomyLabels";
import { useAuthStore } from "@/store/authStore";

const SKIP_TYPES = ["display"];

function ImagePreview({ src, isFile }: { src: string; isFile: boolean }) {
  return (
    <Box
      w="72px"
      h="72px"
      borderRadius="md"
      overflow="hidden"
      flexShrink={0}
      bg="#F4F4F5"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Preview"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </Box>
  );
}

function getPreviewUrl(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string" && value.startsWith("http")) return value;
  if (value instanceof File) return URL.createObjectURL(value);
  return null;
}

function TaxonomyLabelsDisplay({
  question,
  value,
  formData,
  university,
}: {
  question: Question;
  value: string | string[];
  formData: Record<string, unknown>;
  university?: { slug?: string; name?: string } | null;
}) {
  const labels = useTaxonomyLabels(question, value, formData, university);
  if (labels.length === 0) return null;
  return (
    <Flex wrap="wrap" gap={2}>
      {labels.map((label, i) => (
        <Tag.Root
          key={`${question.field}-${i}`}
          variant="subtle"
          borderRadius="md"
          px={2}
          py="4px"
          h="26px"
          bg="#F4F4F5"
          boxShadow="0px 0px 1px 0px #27272A inset"
        >
          <Tag.Label fontSize="sm" lineHeight="unset" color="#27272A">
            {label}
          </Tag.Label>
        </Tag.Root>
      ))}
    </Flex>
  );
}

function collectQuestions(
  questions: Question[],
  parentValues: Record<string, unknown>
): Question[] {
  const result: Question[] = [];
  for (const q of questions) {
    if (SKIP_TYPES.includes(q.type)) continue;
    result.push(q);
    if (q.followup_question && parentValues[q.field]) {
      const raw = parentValues[q.field];
      const values = Array.isArray(raw) ? raw : [raw];
      (values as unknown[]).forEach((val: unknown) => {
        const key = typeof val === "boolean" ? String(val) : (val as string);
        const followup = q.followup_question?.[key];
        if (followup) {
          result.push(...collectQuestions([followup], parentValues));
        }
      });
    }
  }
  return result;
}

function renderFieldValue(
  question: Question,
  value: unknown,
  formData: Record<string, unknown>,
  university?: { slug?: string; name?: string } | null
) {
  const isEmpty =
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0);
  if (isEmpty) {
    return <Text color="#A1A1AA">—</Text>;
  }

  console.log("review question", question);
  console.log("review value", value);
  console.log("review formData", formData);

  if (question.type === "file-image") {
    const src = getPreviewUrl(value);
    if (src) {
      return <ImagePreview src={src} isFile={value instanceof File} />;
    }
    return <Text color="#A1A1AA">Image uploaded</Text>;
  }

  if (
    question.type === "taxonomy-multiselect" ||
    question.type === "taxonomy-select"
  ) {
    return (
      <TaxonomyLabelsDisplay
        question={question}
        value={value as string | string[]}
        formData={formData}
        university={university}
      />
    );
  }

  if (question.type === "file-document") {
    const display = formatAnswerForDisplay(question, value);
    return (
      <HStack gap={2}>
        <FileText size={18} color="#71717A" />
        <Flex direction="column" gap={0}>
          <Text fontSize="sm" fontWeight="500">
            {value instanceof File ? value.name : display}
          </Text>
          {value instanceof File && (
            <Text fontSize="xs" color="#71717A">
              {Math.round(value.size / 1024)} KB
            </Text>
          )}
        </Flex>
      </HStack>
    );
  }

  if (question.type === "url") {
    const href = typeof value === "string" ? value : String(value);
    const display = href.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return (
      <Link
        href={href.startsWith("http") ? href : `https://${href}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          gap: 8,
          backgroundColor: "#F4F4F5",
          padding: 12,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <LinkIcon size={16} color="#71717A" />
        <Text
          fontSize="md"
          color="black"
          _hover={{ textDecoration: "underline" }}
        >
          {display}
        </Text>
      </Link>
    );
  }

  if (question.type === "abn_lookup") {
    return (
      <Text fontSize="sm" color="#3F3F46" fontWeight="500">
        {value as number}
      </Text>
    );
  }

  const display = formatAnswerForDisplay(question, value);

  if (question.type === "textarea") {
    return (
      <Text
        fontSize="sm"
        color="#3F3F46"
        lineClamp={3}
        title={typeof display === "string" ? display : undefined}
      >
        {display}
      </Text>
    );
  }

  return (
    <Text fontSize="sm" color="#3F3F46">
      {display}
    </Text>
  );
}

export interface ProfileSectionCardProps {
  page: Page;
  formData: Record<string, unknown>;
  onEdit: () => void;
  university?: { slug?: string; name?: string } | null;
}

export function ProfileSectionCard({
  page,
  formData,
  onEdit,
  university,
}: ProfileSectionCardProps) {
  const userType = useAuthStore((state) => state.getUserType());
  const questions = collectQuestions(page.questions, formData);
  if (questions.length === 0) return null;

  return (
    <Box
      borderRadius="12px"
      border="1px solid"
      borderColor="#E4E4E7"
      overflow="hidden"
    >
      <Flex
        justify="space-between"
        align="center"
        p={4}
        borderBottom="1px solid"
        borderColor="#E4E4E7"
      >
        <Heading fontSize="md" fontWeight="600" color="black">
          {page.title}
        </Heading>
        <ButtonV2
          size="sm"
          borderRadius="xl"
          variant="ghost"
          border="1px solid"
          borderColor={userType === "organisation" ? "#D3EFEA" : "#D6EDFB"}
          px={4}
          py={3}
          fontSize="sm"
          color="profile.500"
          onClick={onEdit}
        >
          <PenLine
            size={14}
            style={{ marginRight: 6 }}
            color="var(--chakra-colors-profile-500)"
          />
          Edit
        </ButtonV2>
      </Flex>

      <Box
        display="grid"
        gridTemplateColumns={{
          base: "1fr",
          md: "repeat(auto-fill, minmax(200px, 1fr))",
        }}
        gap={4}
        p={4}
        bg="#FAFAFA"
      >
        {questions.map((question) => {
          const value = formData[question.field];
          const isImageField = question.type === "file-image";

          return (
            <Box
              key={question.field}
              gridColumn={isImageField ? "1 / -1" : undefined}
            >
              <Text
                fontSize="xs"
                fontWeight="500"
                color="#71717A"
                mb={1}
                textTransform="uppercase"
                letterSpacing="wider"
              >
                {question.filter_label || question.label}
              </Text>
              {renderFieldValue(question, value, formData, university)}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
