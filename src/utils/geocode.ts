import { GeocodeResult } from "@/types/shared";
import type { Question } from "@/types/onboarding";

/**
 * Normalizes v2 geocode search API response for local form state.
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
 * Turns stored geocode result into the `location` object for PATCH/POST
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

/**
 * Reads geocode for PATCH/POST organisation profile.
 * Question-based only — no global `location` fallback (would collide with user geocode on students).
 */
export function getOrganisationGeocodeLocationFromFormData(
  allData: Record<string, unknown>,
  questions: Question[]
): Record<string, unknown> | null {
  const fields = questions
    .filter(
      (q) => q.model === "organisation" && q.type === "location_geocode_lookup"
    )
    .map((q) => q.field);
  for (const f of fields) {
    const v = toMemberLocationPayload(allData[f]);
    if (v) return v;
  }
  return null;
}

/**
 * Reads geocode for PATCH /api/v2/users/me/ (`location` on user).
 
 */
export function getUserGeocodeLocationFromFormData(
  allData: Record<string, unknown>,
  questions: Question[]
): Record<string, unknown> | null {
  const fields = questions
    .filter((q) => q.model === "user" && q.type === "location_geocode_lookup")
    .map((q) => q.field);
  for (const f of fields) {
    const v = toMemberLocationPayload(allData[f]);
    if (v) return v;
  }
  const fromLocation = toMemberLocationPayload(allData.location);
  if (fromLocation) return fromLocation;
  return toMemberLocationPayload(allData.location_geocode_lookup);
}

/** Renders organisation/user location whether API returns a string or object with formatted_address property. */
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
