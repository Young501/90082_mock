import { useMemo } from "react";
import { useTaxonomy } from "@/services/shared";
import { Question } from "@/types/onboarding";
import { TaxonomyQueryParams } from "@/types/shared";


export function useTaxonomyLabels(
  question: Question,
  value: string | string[] | undefined,
  formData: Record<string, any>,
  university?: { slug?: string; name?: string } | null
): string[] {
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
        ? university?.slug
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

  return useMemo(
    () => codes.map((code) => codeToLabel.get(code) ?? code),
    [codes, codeToLabel]
  );
}
