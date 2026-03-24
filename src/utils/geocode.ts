import { GeocodeResult } from "@/types/shared";
import type { Question } from "@/types/onboarding";

/**
 * Normalizes v2 geocode search API response for local form state.
 * Preserves all fields returned by the API (e.g. neighborhood, administrative_area_level_1).
 */
export function mapGeocodeSearchResponse(
  raw: Record<string, unknown>
): GeocodeResult {
  return {
    ...raw,
    formatted_address: String(raw.formatted_address ?? ""),
  } as GeocodeResult;
}

/**
 * Turns stored geocode result into the `location` object for PATCH/POST organisation member.
 * Strips only the client-only `id` (if present). Omits plain strings (typed but not selected).
 */
export function toMemberLocationPayload(
  value: unknown
): Record<string, unknown> | null {
  if (value == null || value === "") return null;
  if (typeof value === "string") return null;
  if (typeof value !== "object" || value === null) return null;
  const o = value as Record<string, unknown>;
  if (o.formatted_address == null && o.latitude == null) return null;
  const { id: _id, ...rest } = o;
  return rest;
}

/** Reads geocode from `organisation_member` + `location_geocode_lookup` question fields in form data. */
export function getMemberGeocodeLocationFromFormData(
  allData: Record<string, unknown>,
  questions: Question[]
): Record<string, unknown> | null {
  const fields = questions
    .filter(
      (q) =>
        q.model === "organisation_member" &&
        q.type === "location_geocode_lookup"
    )
    .map((q) => q.field);
  for (const f of fields) {
    const v = toMemberLocationPayload(allData[f]);
    if (v) return v;
  }
  return null;
}

/** Renders organisation/user location whether API returns a string or object with formatted_address property. */
/*** presently API returns a string */
export function formatLocationDisplay(location: unknown): string {
  if (location == null) return "";
  if (typeof location === "string") return location;
  if (
    typeof location === "object" &&
    location !== null &&
    "formatted_address" in location
  ) {
    return String(
      (location as { formatted_address?: string }).formatted_address ?? ""
    );
  }
  return "";
}
