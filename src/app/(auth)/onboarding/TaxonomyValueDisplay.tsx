"use client";

import { useMemo } from "react";
import { Flex, Tag } from "@chakra-ui/react";
import { useTaxonomy } from "@/services/shared";
import { Question } from "@/types/onboarding";
import { TaxonomyQueryParams } from "@/types/shared";

interface TaxonomyValueDisplayProps {
  question: Question;
  value: string | string[];
  formData: Record<string, any>;
  university?: { slug?: string; name?: string } | null;
}

export function TaxonomyValueDisplay({
  question,
  value,
  formData,
  university,
}: TaxonomyValueDisplayProps) {
  const taxonomyQuery = question.taxonomy_query;
  const codes = useMemo(() => {
    const arr = Array.isArray(value) ? value : value ? [value] : [];
    return arr
      .map((v: unknown) =>
        typeof v === "object" && v != null && "code" in v
          ? (v as { code: string }).code
          : v
      )
      .filter((v): v is string => typeof v === "string" && v !== "");
  }, [value]);

  const params = useMemo((): TaxonomyQueryParams | null => {
    if (!taxonomyQuery?.type) return null;
    const parentField = taxonomyQuery.parent ?? "__none__";
    const parentValue =
      parentField === "__none__"
        ? null
        : formData[parentField] ?? null;
    const parentCode =
      typeof parentValue === "object" && parentValue?.code != null
        ? parentValue.code
        : typeof parentValue === "string"
          ? parentValue
          : null;
    const universitySlug =
      taxonomyQuery.university === "dynamic"
        ? university?.slug ?? "unimelb"
        : taxonomyQuery.university ?? null;

    return {
      type: taxonomyQuery.type,
      parent: parentCode,
      university: universitySlug,
    };
  }, [taxonomyQuery, formData, university?.slug]);

  const { data: nodes = [] } = useTaxonomy(params);

  const codeToLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const node of nodes as Array<{ code: string; label: string }>) {
      map.set(node.code, node.label);
    }
    return map;
  }, [nodes]);

  const labels = useMemo(
    () => codes.map((code) => codeToLabel.get(code) ?? code),
    [codes, codeToLabel]
  );

  if (codes.length === 0) {
    return null;
  }

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
