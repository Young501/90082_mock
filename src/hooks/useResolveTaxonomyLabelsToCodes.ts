import { useCallback, useState } from "react";
import { apiRequest, API_ENDPOINTS } from "@/api";
import { Question } from "@/types/onboarding";
import { TaxonomyNode } from "@/types/shared";
import { findOptionByValueOrLabel } from "@/utils/taxonomyLabelMatch";

interface QuestionnaireSection {
  id: number;
  title: string;
  questions: Question[];
  title_icon?: string;
}

async function fetchTaxonomy(params: {
  type: string;
  parent?: string | null;
  university?: string | null;
}): Promise<TaxonomyNode[]> {
  const queryParams: Record<string, string> = { type: params.type };
  if (
    params.university != null &&
    params.university !== "" &&
    params.university !== "dynamic"
  ) {
    queryParams.university = params.university;
  }
  if (params.parent != null && params.parent !== "") {
    queryParams.parent = params.parent;
  }
  const response = await apiRequest<unknown[]>({
    endpoint: API_ENDPOINTS.TAXONOMY,
    params: queryParams,
  });
  return (response ?? []) as TaxonomyNode[];
}

/**
 * Resolves label-based questionnaire answers to code-based answers by fetching
 * taxonomy options and matching labels. Use when opening the edit dialog so
 * taxonomy fields receive codes and can properly display selected values.
 */
export function useResolveTaxonomyLabelsToCodes() {
  const [isResolving, setIsResolving] = useState(false);

  const resolve = useCallback(
    async (
      sections: QuestionnaireSection[],
      rawAnswers: Record<string, any>,
      universitySlug?: string | null
    ): Promise<Record<string, any>> => {
      const taxonomyFields = sections.flatMap((s) =>
        s.questions.filter(
          (q) =>
            (q.type === "taxonomy-select" || q.type === "taxonomy-multiselect") &&
            q.taxonomy_query?.type
        )
      );

      if (taxonomyFields.length === 0) {
        return { ...rawAnswers };
      }

      // Dedupe by type+parent+university for efficient fetching
      const fetchKeys = new Map<
        string,
        { type: string; parent: string | null; university: string | null }
      >();
      for (const q of taxonomyFields) {
        const tq = q.taxonomy_query!;
        const university =
          tq.university === "dynamic"
            ? universitySlug ?? "unimelb"
            : tq.university ?? null;
        const parent = tq.parent ?? null;
        const key = `${tq.type}|${parent}|${university}`;
        if (!fetchKeys.has(key)) {
          fetchKeys.set(key, { type: tq.type, parent, university });
        }
      }

      setIsResolving(true);
      try {
        const results = await Promise.all(
          Array.from(fetchKeys.values()).map((p) => fetchTaxonomy(p))
        );
        const optionsByKey = new Map<string, { value: string; label: string }[]>();
        let i = 0;
        for (const [key, params] of fetchKeys) {
          const nodes = results[i++] as TaxonomyNode[];
          optionsByKey.set(
            key,
            nodes.map((n) => ({ value: n.code, label: n.label }))
          );
        }

        const resolved: Record<string, any> = { ...rawAnswers };
        for (const q of taxonomyFields) {
          const tq = q.taxonomy_query!;
          const university =
            tq.university === "dynamic"
              ? universitySlug ?? "unimelb"
              : tq.university ?? null;
          const parent = tq.parent ?? null;
          const key = `${tq.type}|${parent}|${university}`;
          const options = optionsByKey.get(key) ?? [];

          const rawValue = rawAnswers[q.field];
          if (rawValue === undefined || rawValue === null) continue;

          if (q.type === "taxonomy-select") {
            const v = String(rawValue ?? "").trim();
            if (!v) continue;
            const matched = findOptionByValueOrLabel(options, v);
            if (matched) resolved[q.field] = matched.value;
          } else if (q.type === "taxonomy-multiselect") {
            const arr = Array.isArray(rawValue) ? rawValue : [rawValue];
            const resolvedArr = arr
              .map((v) => {
                const s =
                  typeof v === "string"
                    ? v
                    : String((v as any)?.value ?? (v as any)?.code ?? v ?? "");
                if (!s) return null;
                const matched = findOptionByValueOrLabel(options, s);
                return matched ? matched.value : s;
              })
              .filter(Boolean) as string[];
            resolved[q.field] = resolvedArr;
          }
        }
        return resolved;
      } finally {
        setIsResolving(false);
      }
    },
    []
  );

  return { resolve, isResolving };
}
