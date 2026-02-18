"use client";

import { useEffect } from "react";
import {
  Box,
  Text,
  Heading,
  Flex,
  VStack,
  HStack,
  Tag,
  Button,
} from "@chakra-ui/react";
import { PenLine, FileText, Link as LinkIcon } from "lucide-react";
import { Page, Question } from "@/types/onboarding";
import { formatAnswerForDisplay } from "@/utils/formatAnswer";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import Link from "next/link";

const SKIP_TYPES = ["abn_lookup", "display"];

function ImagePreview({ src, isFile }: { src: string; isFile: boolean }) {
  useEffect(() => {
    if (isFile && src.startsWith("blob:")) {
      return () => URL.revokeObjectURL(src);
    }
  }, [src, isFile]);

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

function getPreviewUrl(value: any): string | null {
  if (!value) return null;
  if (typeof value === "string" && value.startsWith("http")) return value;
  if (value instanceof File) return URL.createObjectURL(value);
  return null;
}

interface ReviewPreviewProps {
  formData: Record<string, any>;
  pages: Page[];
  goToPage: (pageId: number) => void;
  onSubmit: () => void;
  onBack: () => void;
  userType: string;
  isLoading?: boolean;
}

export function ReviewPreview({
  formData,
  pages,
  goToPage,
  onSubmit,
  onBack,
  userType,
  isLoading = false,
}: ReviewPreviewProps) {
  const collectQuestions = (
    questions: Question[],
    parentValues: Record<string, any> = formData
  ): Question[] => {
    const result: Question[] = [];
    for (const q of questions) {
      if (SKIP_TYPES.includes(q.type)) continue;
      result.push(q);
      if (q.followup_question && parentValues[q.field]) {
        const values = Array.isArray(parentValues[q.field])
          ? parentValues[q.field]
          : [parentValues[q.field]];
        values.forEach((val: string) => {
          const key = typeof val === "boolean" ? String(val) : val;
          const followup = q.followup_question?.[key];
          if (followup) {
            result.push(...collectQuestions([followup], parentValues));
          }
        });
      }
    }
    return result;
  };

  const renderFieldValue = (question: Question, value: any) => {
    const isEmpty =
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);
    if (isEmpty) {
      return <Text color="#A1A1AA">—</Text>;
    }

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
      const arr = Array.isArray(value) ? value : [value];
      const labels = arr.map((v) => formatAnswerForDisplay(question, v));
      return (
        <Flex wrap="wrap" gap={2}>
          {labels.map((label, i) => (
            <Tag.Root
              key={`${question.field}-${i}`}
              size="sm"
              variant="subtle"
              borderRadius="md"
              px={2}
              py="2px"
              h="24px"
              bg="#F4F4F5"
              boxShadow="0px 0px 1px 0px #27272A inset"
            >
              <Tag.Label fontSize="sm" color="#27272A">
                {label}
              </Tag.Label>
            </Tag.Root>
          ))}
        </Flex>
      );
    }

    if (question.type === "file-document") {
      const display = formatAnswerForDisplay(question, value);
      return (
        <HStack gap={2}>
          <FileText size={18} color="#71717A" />
          <VStack align="flex-start" gap={0}>
            <Text fontSize="sm" fontWeight="500">
              {value instanceof File ? value.name : display}
            </Text>
            {value instanceof File && (
              <Text fontSize="xs" color="#71717A">
                {Math.round(value.size / 1024)} KB
              </Text>
            )}
          </VStack>
        </HStack>
      );
    }

    if (question.type === "url") {
      const href = typeof value === "string" ? value : String(value);
      const display = href.replace(/^https?:\/\//, "").replace(/\/$/, "");

      return (
        <Link
          style={{
            display: "flex",
            gap: 2,
            backgroundColor: "#F4F4F5",
            padding: 3,
            borderRadius: "xs",
            alignItems: "center",
          }}
          href={href.startsWith("http") ? href : `https://${href}`}
          target="_blank"
          rel="noopener noreferrer"
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
  };

  return (
    <Box w="100%">
      <Heading fontSize="2xl" fontWeight="600" color="black" mb={2}>
        Review Your Details
      </Heading>
      <Text fontSize="md" color="#52525B" mb={8}>
        Please review the information you have provided, as this is how
        organisations and coordinators will see your profile. You can still make
        edits at any time in your account settings after submitting.
      </Text>

      <VStack align="stretch" gap={6}>
        {pages.map((page) => {
          const questions = collectQuestions(page.questions);
          if (questions.length === 0) return null;

          const hasProfileImage = questions.some(
            (q) => q.type === "file-image" && formData[q.field]
          );

          return (
            <Box
              key={page.id}
              borderRadius="12px"
              border="1px solid"
              borderColor="#E4E4E7"
            >
              <Flex
                justify="space-between"
                align="center"
                p={4}
                borderBottom="1px solid"
                borderColor="#E4E4E7"
              >
                <Heading fontSize="md" fontWeight="400" color="black">
                  {page.title}
                </Heading>
                <ButtonV2
                  size="sm"
                  borderRadius="xl"
                  variant="ghost"
                  border="1px solid"
                  borderColor="#D6EDFB"
                  px={4}
                  py={3}
                  fontSize="sm"
                  color="#1679AB"
                  onClick={() => goToPage(page.id)}
                >
                  <PenLine
                    size={14}
                    style={{ marginRight: 6 }}
                    color="#1679AB"
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
                      {renderFieldValue(question, value)}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </VStack>

      <Flex mt={10} gap={4} justify="center" flexWrap="wrap">
        <ButtonV2
          variant="primary"
          h="64px"
          fontSize="lg"
          w="100%"
          px="28px"
          py="18px"
          isLoading={isLoading}
          disabled={isLoading}
          onClick={onSubmit}
          loading={isLoading}
        >
          Submit and Create your profile
        </ButtonV2>
      </Flex>
    </Box>
  );
}
