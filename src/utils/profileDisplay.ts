/**
 * Extracts a display string from API profile values.
 * API may return:
 * - string: e.g. "Digital Technologies"
 * - taxonomy object: { id, code, label } or { id, code, name }
 * - null/undefined
 */
export function toProfileDisplayString(
  value: unknown
): string | undefined {
  if (value == null || value === "") {
    return undefined;
  }
  if (typeof value === "string") {
    return value.trim() || undefined;
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    if (typeof obj.label === "string" && obj.label.trim()) {
      return obj.label.trim();
    }
    if (typeof obj.name === "string" && obj.name.trim()) {
      return obj.name.trim();
    }
  }
  return undefined;
}
