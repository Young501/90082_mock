"use client";

import { useMemo, useEffect, useRef } from "react";
import { Control, useController } from "react-hook-form";
import { useTaxonomy } from "@/services/shared";
import { TaxonomyNode } from "@/types/shared";
import { TaxonomyQueryParams } from "@/types/shared";
import { SelectField } from "./SelectField";

interface TaxonomySelectFieldProps {
  name: string;
  label?: string;
  control: Control<any>;
  taxonomyQuery: TaxonomyQueryParams;
  parentValue?: string | null;
  universitySlug?: string | null;
  error?: string;
  required?: boolean;
  filterLabel?: string;
}

export const TaxonomySelectField = ({
  name,
  label,
  control,
  taxonomyQuery,
  parentValue,
  universitySlug,
  error,
  required,
  filterLabel,
}: TaxonomySelectFieldProps) => {
  const params = useMemo(() => {
    const university =
      taxonomyQuery.university === "dynamic"
        ? (universitySlug ?? "unimelb")
        : (taxonomyQuery.university ?? null);

    return {
      type: taxonomyQuery.type,
      parent: parentValue ?? null,
      university,
    };
  }, [taxonomyQuery, parentValue, universitySlug]);

  const { data: nodes = [], isLoading } = useTaxonomy(params);

  const options = useMemo(() => {
    return (nodes as TaxonomyNode[]).map((node) => ({
      label: node.label,
      value: node.code,
      key: node.id,
    }));
  }, [nodes]);

  const { field: controllerField } = useController({
    name,
    control,
    defaultValue: "",
  });

  const initialValueRef = useRef<any>(controllerField.value);
  const normalisedRef = useRef(false);

  useEffect(() => {
    if (options.length === 0 || normalisedRef.current) return;
    normalisedRef.current = true;

    const v = typeof initialValueRef.current === "string"
      ? initialValueRef.current
      : String(initialValueRef.current ?? "");

    if (!v) return;
    if (options.some((o) => o.value === v)) return; // already a valid code

    const byLabel = options.find(
      (o) =>
        typeof o.label === "string" &&
        o.label.toLowerCase() === v.toLowerCase()
    );
    if (byLabel) {
      controllerField.onChange(byLabel.value);
    }
  }, [options]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div style={{ padding: "12px", color: "#666" }}>Loading options...</div>
    );
  }

  if (options.length === 0) {
    return null;
  }

  return (
    <SelectField
      name={name}
      label={label || filterLabel}
      control={control}
      options={options}
      error={error}
      required={required}
    />
  );
};
