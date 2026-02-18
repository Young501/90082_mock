"use client";

import { useMemo } from "react";
import { Control } from "react-hook-form";
import { useTaxonomy } from "@/services/shared";
import { TaxonomyNode } from "@/types/shared";
import { TaxonomyQueryParams } from "@/types/shared";
import { SelectField } from "./SelectField";

interface TaxonomyMultiselectFieldProps {
  name: string;
  label?: string;
  control: Control<any>;
  taxonomyQuery: TaxonomyQueryParams;
  parentValue?: string | null;
  universitySlug?: string | null;
  error?: string;
  required?: boolean;
  maxSelection?: number;
  filterLabel?: string;
}

export const TaxonomyMultiselectField = ({
  name,
  label,
  control,
  taxonomyQuery,
  parentValue,
  universitySlug,
  error,
  required,
  maxSelection,
  filterLabel,
}: TaxonomyMultiselectFieldProps) => {
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

  if (isLoading) {
    return (
      <div style={{ padding: "12px", color: "#666" }}>Loading options...</div>
    );
  }

  return (
    <SelectField
      name={name}
      label={filterLabel || label}
      control={control}
      options={options}
      error={error}
      required={required}
      multiple={true}
      maxSelection={maxSelection}
    />
  );
};
