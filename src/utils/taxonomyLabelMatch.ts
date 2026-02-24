/**
 * Normalizes a label string for fuzzy matching between stored answers and taxonomy API responses.
 * Handles variations in whitespace, slashes, and casing.
 */
export function normalizeLabelForMatching(label: string): string {
  if (typeof label !== "string") return "";
  return label
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*\/\s*/g, "/");
}

/**
 * Finds an option by matching the value (code or label) against options.
 */
export function findOptionByValueOrLabel<T extends { value: string; label: string }>(
  options: T[],
  value: string
): T | undefined {
  if (!value || options.length === 0) return undefined;
  const v = String(value).trim();
  const byCode = options.find((o) => o.value === v);
  if (byCode) return byCode;
  const byLabel = options.find(
    (o) =>
      typeof o.label === "string" &&
      normalizeLabelForMatching(o.label) === normalizeLabelForMatching(v)
  );
  return byLabel;
}
